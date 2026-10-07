// src/utils/maps.js

// Google Maps search link for an address or place label; no API key needed.
export const googleMapsUrl = (address) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(address || '').trim())}`;

// Worth linking only when it points somewhere specific: a street number or ZIP,
// or a venue label like "Name, Street, City, State, Country". Bare cities and
// countries ("Dallas, TX") would just open a zoomed-out map.
export const isSpecificAddress = (address) => {
  const text = String(address || '').trim();
  if (!text) return false;
  return /\d/.test(text) || text.split(',').filter((part) => part.trim()).length >= 4;
};
