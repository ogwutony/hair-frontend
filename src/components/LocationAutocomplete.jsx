// src/components/LocationAutocomplete.jsx
//
// Location field with Google place suggestions.
// Uses Places API (New) (AutocompleteSuggestion), which Google Cloud projects
// created after March 2025 must use. If the key can't use the new API, it falls
// back to the classic places.Autocomplete widget. If Google rejects the key
// entirely, it stays a plain text field so people can still type a location.
import React, { useEffect, useRef, useState } from 'react';

// Combine the place name (venue, business, landmark) with its address,
// e.g. "Klyde Warren Park, 2012 Woodall Rodgers Fwy, Dallas, TX 75201, USA".
// Skips the name when it's already the start of the address (cities, street addresses).
export const formatPlaceLabel = (place) => {
  if (!place) return '';
  const name = (place.name || '').trim();
  const address = (place.formatted_address || '').trim();
  if (!address) return name;
  if (!name || address.toLowerCase().startsWith(name.toLowerCase())) return address;
  return `${name}, ${address}`;
};

const SCRIPT_ID = 'google-places-script';
const MIN_CHARS = 2;
const DEBOUNCE_MS = 250;

// Google calls window.gm_authFailure when the Maps key is rejected (missing key,
// domain not allowed, API not enabled, billing off). Classic widgets then get
// disabled with an error icon; we undo that so the field still works as text.
const authFailureListeners = new Set();
if (typeof window !== 'undefined' && !window.__locationAuthHook) {
  window.__locationAuthHook = true;
  const prev = window.gm_authFailure;
  window.gm_authFailure = () => {
    console.error('Google Maps rejected the API key: location suggestions are off. Check REACT_APP_GOOGLE_MAPS_API_KEY and its settings in Google Cloud.');
    window.__locationAuthFailed = true;
    authFailureListeners.forEach((fn) => fn());
    if (typeof prev === 'function') prev();
  };
}

// Load the Maps JS API once for the whole app and resolve with the places library.
let placesPromise = null;
const loadPlaces = (apiKey) => {
  if (placesPromise) return placesPromise;
  placesPromise = new Promise((resolve, reject) => {
    const done = () => {
      const g = window.google?.maps;
      if (!g) return reject(new Error('Google Maps failed to load'));
      if (typeof g.importLibrary === 'function') {
        g.importLibrary('places').then(resolve, reject);
      } else if (g.places) {
        resolve(g.places);
      } else {
        reject(new Error('Google Places library unavailable'));
      }
    };
    if (window.google?.maps) return done();
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', done);
      existing.addEventListener('error', () => reject(new Error('Google Maps script failed to load')));
      return;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&v=weekly`;
    script.async = true;
    script.onload = done;
    script.onerror = () => reject(new Error('Google Maps script failed to load'));
    document.head.appendChild(script);
  });
  // Allow a later retry if loading failed (e.g. flaky network)
  placesPromise.catch(() => { placesPromise = null; });
  return placesPromise;
};

// Remembered across instances: once the new API fails, use the classic widget.
let useClassicWidget = false;

// Tests only: forget the loaded library and fallback choice between test cases
export const __resetLocationAutocompleteForTests = () => {
  placesPromise = null;
  useClassicWidget = false;
};

export const LocationAutocomplete = ({ value, onChange, placeholder, style }) => {
  const inputRef = useRef(null);
  const placesRef = useRef(null);        // places library once loaded
  const sessionTokenRef = useRef(null);  // groups keystrokes + selection into one billed session
  const classicRef = useRef(null);       // classic Autocomplete instance (fallback only)
  const requestIdRef = useRef(0);        // ignore out-of-order responses
  const debounceRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [mode, setMode] = useState('loading'); // 'loading' | 'new' | 'classic' | 'off'

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

  // z-index for the classic widget's dropdown
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `.pac-container { z-index: 10000 !important; }`;
    document.head.appendChild(styleEl);
    return () => { if (document.head.contains(styleEl)) document.head.removeChild(styleEl); };
  }, []);

  // If Google rejects the key, keep the field usable as plain text
  useEffect(() => {
    const restore = () => {
      const el = inputRef.current;
      if (!el) return;
      el.disabled = false;
      el.classList.remove('gm-err-autocomplete');
      el.style.backgroundImage = 'none';
      el.placeholder = placeholder || '';
    };
    // Google applies its error styling asynchronously, so restore again shortly after
    const onFail = () => {
      setMode('off'); setOpen(false); setSuggestions([]);
      restore(); setTimeout(restore, 300); setTimeout(restore, 1500);
    };
    authFailureListeners.add(onFail);
    if (window.__locationAuthFailed) onFail();
    return () => { authFailureListeners.delete(onFail); };
  }, [placeholder]);

  const attachClassic = (places) => {
    if (classicRef.current || !inputRef.current || !places?.Autocomplete) { if (!classicRef.current) setMode('off'); return; }
    const ac = classicRef.current = new places.Autocomplete(inputRef.current, { fields: ['formatted_address', 'name'] });
    ac.addListener('place_changed', () => onChangeRef.current(formatPlaceLabel(ac.getPlace())));
    setMode('classic');
  };

  // Load Google Places once
  useEffect(() => {
    let cancelled = false;
    if (!apiKey) {
      console.warn('REACT_APP_GOOGLE_MAPS_API_KEY is not set: location suggestions are off.');
      setMode('off');
      return undefined;
    }
    if (window.__locationAuthFailed) { setMode('off'); return undefined; }
    loadPlaces(apiKey)
      .then((places) => {
        if (cancelled) return;
        placesRef.current = places;
        if (places.AutocompleteSuggestion && !useClassicWidget) setMode('new');
        else attachClassic(places);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Location suggestions unavailable:', err);
        setMode('off');
      });
    return () => { cancelled = true; clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  const fetchSuggestions = async (text) => {
    const places = placesRef.current;
    if (!places?.AutocompleteSuggestion) return;
    const reqId = ++requestIdRef.current;
    try {
      if (!sessionTokenRef.current && places.AutocompleteSessionToken) {
        sessionTokenRef.current = new places.AutocompleteSessionToken();
      }
      const { suggestions: results } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: text,
        sessionToken: sessionTokenRef.current || undefined,
      });
      if (reqId !== requestIdRef.current) return; // a newer request is in flight
      const list = (results || [])
        .map((s) => s.placePrediction)
        .filter(Boolean)
        .slice(0, 5)
        .map((p) => ({
          id: p.placeId,
          main: p.mainText?.toString() || p.text?.toString() || '',
          secondary: p.secondaryText?.toString() || '',
          prediction: p,
        }));
      setSuggestions(list);
      setActiveIdx(-1);
      setOpen(list.length > 0);
    } catch (err) {
      if (reqId !== requestIdRef.current) return;
      // Usually means the key doesn't have "Places API (New)" enabled. Try the classic widget.
      console.warn('Places API (New) request failed, trying the classic Places widget:', err);
      useClassicWidget = true;
      setOpen(false); setSuggestions([]);
      if (!window.__locationAuthFailed) attachClassic(places);
    }
  };

  const handleInput = (e) => {
    const text = e.target.value;
    onChange(text);
    if (mode !== 'new') return;
    clearTimeout(debounceRef.current);
    if (text.trim().length < MIN_CHARS) { requestIdRef.current++; setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(() => fetchSuggestions(text.trim()), DEBOUNCE_MS);
  };

  const selectSuggestion = async (s) => {
    setOpen(false);
    setSuggestions([]);
    requestIdRef.current++;
    // Show the suggestion text right away, then upgrade to the full "Name, Address" label
    const fallback = s.secondary ? `${s.main}, ${s.secondary}` : s.main;
    onChange(fallback);
    try {
      const place = s.prediction.toPlace();
      await place.fetchFields({ fields: ['displayName', 'formattedAddress'] });
      const label = formatPlaceLabel({ name: place.displayName, formatted_address: place.formattedAddress });
      if (label) onChangeRef.current(label);
    } catch (err) {
      console.warn('Could not load place details, keeping suggestion text:', err);
    } finally {
      sessionTokenRef.current = null; // selection ends the billing session
    }
  };

  const handleKeyDown = (e) => {
    if (open && suggestions.length) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => (i + 1) % suggestions.length); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1)); return; }
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key === 'Enter') {
        e.preventDefault();
        selectSuggestion(suggestions[activeIdx >= 0 ? activeIdx : 0]);
        return;
      }
    }
    // Don't submit the surrounding form while picking a place from the classic dropdown
    if (e.key === 'Enter' && mode === 'classic') e.preventDefault();
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value || ''}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (suggestions.length) setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls="location-suggestions"
        style={{ ...style, width: '100%', boxSizing: 'border-box' }}
      />
      {open && suggestions.length > 0 && (
        <ul
          id="location-suggestions"
          role="listbox"
          style={{
            // Sit right under the input, ignoring any margin the page gives it
            position: 'absolute', top: `${(inputRef.current?.offsetHeight || 40) + 2}px`, left: 0, right: 0, zIndex: 10000,
            margin: 0, padding: '4px 0', listStyle: 'none',
            background: '#fff', border: '1px solid #ddd', borderRadius: '8px',
            boxShadow: '0 6px 18px rgba(0,0,0,0.12)', maxHeight: '260px', overflowY: 'auto',
          }}
        >
          {suggestions.map((s, idx) => (
            <li
              key={s.id || idx}
              role="option"
              aria-selected={idx === activeIdx}
              // mousedown (not click) so it runs before the input's blur closes the list
              onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
              onMouseEnter={() => setActiveIdx(idx)}
              style={{
                padding: '9px 12px', cursor: 'pointer', fontSize: '13px', textAlign: 'left',
                backgroundColor: idx === activeIdx ? '#f3f3f3' : '#fff',
              }}
            >
              <span style={{ fontWeight: 600, color: '#222' }}>{s.main}</span>
              {s.secondary && <span style={{ color: '#777', marginLeft: '6px' }}>{s.secondary}</span>}
            </li>
          ))}
          <li aria-hidden="true" style={{ padding: '4px 12px 2px', fontSize: '10px', color: '#999', textAlign: 'right' }}>Powered by Google</li>
        </ul>
      )}
    </div>
  );
};
