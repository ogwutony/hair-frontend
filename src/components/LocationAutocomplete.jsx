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

export const LocationAutocomplete = ({ value, onChange, placeholder, style }) => {
  const inputRef = React.useRef(null);
  const autocompleteRef = React.useRef(null); // CRITICAL: Prevents double-binding

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `.pac-container { z-index: 10000 !important; }`;
    document.head.appendChild(styleEl);
    return () => { if (document.head.contains(styleEl)) document.head.removeChild(styleEl); };
  }, []);

  useEffect(() => {
    let cancelled = false;

    function initAutocomplete() {
      if (cancelled || !window.google || !window.google.maps || !inputRef.current) return;
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

    if (typeof window !== 'undefined' && !window.google) {
      const existingScript = document.getElementById('google-places-script');
      if (existingScript) {
        existingScript.addEventListener('load', initAutocomplete);
      } else {
        const script = document.createElement('script');
        script.id = 'google-places-script';
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
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
