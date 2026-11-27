// api/geocode.js — served at /api/geocode. Location lookups for the "Location (Optional)"
// field when Google Places is unavailable (no key, key rejected, API not enabled).
//
//   GET /api/geocode?q=dallas            -> place suggestions (autocomplete)
//   GET /api/geocode?lat=32.7&lon=-96.8  -> the place at those coordinates (reverse geocode)
//
// Responds with { results: [{ id, main, secondary, label }] }.
//
// Requests go server-side so the browser never calls OpenStreetMap services directly:
// that avoids CORS issues and lets us send the identifying User-Agent their usage
// policies require. Suggestions come from Photon (built for search-as-you-type);
// reverse lookups use Photon, then Nominatim as a fallback. Responses are cached at
// the edge to keep traffic to these free services low.

const USER_AGENT = 'TheMajoritiesLocationLookup/1.0 (+https://themajorities.com/contact)';
const PHOTON = 'https://photon.komoot.io';
const NOMINATIM = 'https://nominatim.openstreetmap.org';
const TIMEOUT_MS = 6000;
const MAX_RESULTS = 5;

const fetchJson = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json', 'Accept-Language': 'en' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`${new URL(url).host} responded ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
};

const unique = (parts) => {
  const seen = new Set();
  return parts
    .map((p) => (p == null ? '' : String(p).trim()))
    .filter((p) => p && !seen.has(p.toLowerCase()) && seen.add(p.toLowerCase()));
};

// Photon feature -> { main: "Klyde Warren Park", secondary: "2012 Woodall Rodgers Fwy, Dallas, TX, United States" }
const fromPhoton = (feature) => {
  const p = feature?.properties || {};
  const street = [p.housenumber, p.street].filter(Boolean).join(' ');
  const main = p.name || street || p.city || p.county || p.state || p.country || '';
  const secondary = unique([p.name ? street : '', p.district, p.city, p.state, p.country])
    .filter((part) => part.toLowerCase() !== main.toLowerCase())
    .join(', ');
  if (!main) return null;
  return {
    id: `${p.osm_type || ''}${p.osm_id || ''}` || `${main}|${secondary}`,
    main,
    secondary,
    label: secondary ? `${main}, ${secondary}` : main,
  };
};

const fromNominatim = (place) => {
  if (!place || !place.display_name) return null;
  const a = place.address || {};
  const main = place.name || [a.house_number, a.road].filter(Boolean).join(' ') || a.city || a.town || a.village || a.state || '';
  const secondary = unique([a.city || a.town || a.village, a.state, a.country])
    .filter((part) => part.toLowerCase() !== main.toLowerCase())
    .join(', ');
  return {
    id: `${place.osm_type || ''}${place.osm_id || ''}`,
    main: main || place.display_name,
    secondary,
    label: main && secondary ? `${main}, ${secondary}` : place.display_name,
  };
};

const dedupe = (list) => {
  const seen = new Set();
  return list.filter((r) => r && !seen.has(r.label.toLowerCase()) && seen.add(r.label.toLowerCase()));
};

const search = async (q) => {
  const data = await fetchJson(`${PHOTON}/api/?q=${encodeURIComponent(q)}&limit=${MAX_RESULTS + 3}&lang=en`);
  return dedupe((data.features || []).map(fromPhoton)).slice(0, MAX_RESULTS);
};

const reverse = async (lat, lon) => {
  try {
    const data = await fetchJson(`${PHOTON}/reverse?lat=${lat}&lon=${lon}&limit=1&lang=en`);
    const results = dedupe((data.features || []).map(fromPhoton));
    if (results.length) return results.slice(0, 1);
  } catch (err) {
    console.warn('Photon reverse lookup failed, trying Nominatim:', err.message);
  }
  const place = await fetchJson(`${NOMINATIM}/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`);
  return dedupe([fromNominatim(place)]);
};

const send = (res, status, body, cacheSeconds) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', cacheSeconds
    ? `public, max-age=300, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`
    : 'no-store');
  res.end(JSON.stringify(body));
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  const params = new URL(req.url, 'http://localhost').searchParams;
  const q = (params.get('q') || '').trim().slice(0, 200);
  const lat = Number(params.get('lat'));
  const lon = Number(params.get('lon'));
  const hasCoords = params.has('lat') && params.has('lon')
    && Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;

  try {
    if (hasCoords) {
      // Round to ~100 m: enough to name the place, better cache hits, less precise location in logs
      const results = await reverse(lat.toFixed(3), lon.toFixed(3));
      return send(res, 200, { results }, 86400);
    }
    if (q.length < 2) return send(res, 400, { error: 'Pass q (at least 2 characters) or lat and lon.' });
    return send(res, 200, { results: await search(q) }, 86400);
  } catch (err) {
    console.error('Location lookup failed:', err.message);
    return send(res, 502, { error: 'Location lookup is unavailable right now.', results: [] });
  }
};
