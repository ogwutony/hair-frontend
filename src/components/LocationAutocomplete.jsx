// src/components/LocationAutocomplete.jsx
import React, { useEffect } from 'react';

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

// Google calls window.gm_authFailure when the Maps key is rejected (missing key,
// domain not allowed, Places API not enabled, billing off). It then disables every
// autocomplete input and shows an error icon. Undo that so people can still type.
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

export const LocationAutocomplete = ({ value, onChange, placeholder, style }) => {
  const inputRef = React.useRef(null);
  const autocompleteRef = React.useRef(null); // CRITICAL: Prevents double-binding

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `.pac-container { z-index: 10000 !important; }`;
    document.head.appendChild(styleEl);
    return () => { if (document.head.contains(styleEl)) document.head.removeChild(styleEl); };
  }, []);

  // Keep the field usable as plain text if Google's key check fails
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
    const onFail = () => { restore(); setTimeout(restore, 300); setTimeout(restore, 1500); };
    authFailureListeners.add(onFail);
    if (window.__locationAuthFailed) onFail();
    return () => { authFailureListeners.delete(onFail); };
  }, [placeholder]);

  useEffect(() => {
    let cancelled = false;

    function initAutocomplete() {
      if (cancelled || !window.google?.maps?.places || !inputRef.current) return;
      if (window.__locationAuthFailed) return;
      if (autocompleteRef.current) return; // CRITICAL: Stops double-binding
      const autocomplete = autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ['formatted_address', 'name'],
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        onChange(formatPlaceLabel(place));
      });
      inputRef.current.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') e.preventDefault();
      });
    }

    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
    if (!apiKey) {
      console.warn('REACT_APP_GOOGLE_MAPS_API_KEY is not set: location suggestions are off.');
      return () => { cancelled = true; };
    }

    // Check for maps.places specifically: other Google scripts can define window.google too
    if (typeof window !== 'undefined' && !window.google?.maps?.places) {
      const existingScript = document.getElementById('google-places-script');
      if (existingScript) {
        existingScript.addEventListener('load', initAutocomplete);
      } else {
        const script = document.createElement('script');
        script.id = 'google-places-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.onload = initAutocomplete;
        document.head.appendChild(script);
      }
    } else {
      initAutocomplete();
    }

    return () => { cancelled = true; };
  }, [onChange]);

  // Sync external value changes (e.g., when the backend loads a saved location) into the input
  useEffect(() => {
    if (inputRef.current && value !== undefined && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...style, width: '100%', boxSizing: 'border-box' }}
      />
    </div>
  );
};
