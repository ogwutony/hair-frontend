// api/indexnow.js — tells Bing (and the other IndexNow engines) which pages
// changed, so they recrawl right away instead of waiting for the sitemap.
//
// Runs daily from the Vercel cron in vercel.json and submits Duma perspectives
// created/updated in the last `hours` (default 26). Manual runs:
//   /api/indexnow?all=1        → submit every URL in the sitemap
//   /api/indexnow?hours=72     → submit pages changed in the last 72 hours
// If CRON_SECRET is set in Vercel, calls must send `Authorization: Bearer <CRON_SECRET>`
// (Vercel's cron does this automatically) or `?secret=<CRON_SECRET>`.
const { SITE, fetchDuma, sitemapUrls, INDEXNOW_KEY } = require('./_lib/site');

const HOST = new URL(SITE).host;

module.exports = async (req, res) => {
  const send = (status, body) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(body));
  };

  const query = new URL(req.url, SITE).searchParams;
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}` && query.get('secret') !== secret) {
    return send(401, { error: 'unauthorized' });
  }

  const all = query.get('all') === '1';
  const hours = Math.min(Math.max(Number(query.get('hours')) || 26, 1), 24 * 30);
  const since = Date.now() - hours * 3600 * 1000;

  const items = await fetchDuma();
  const urls = sitemapUrls(items)
    .filter(u => all || (u.date && u.date.getTime() >= since))
    .map(u => SITE + u.loc);

  if (!urls.length) return send(200, { submitted: 0, note: `no pages changed in the last ${hours}h` });

  try {
    const r = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`, urlList: urls.slice(0, 10000) }),
      signal: AbortSignal.timeout(8000),
    });
    // 200/202 = accepted; 403 = key not verified yet; 422 = URLs don't match host; 429 = too many requests
    return send(r.ok ? 200 : 502, { submitted: urls.length, indexnowStatus: r.status, urls });
  } catch (err) {
    return send(502, { error: `IndexNow request failed: ${err.message}` });
  }
};
