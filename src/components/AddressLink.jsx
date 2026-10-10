// src/components/AddressLink.jsx
// Renders an address / place string as a link that opens it in Google Maps.
// Uses the Maps URLs format, which needs no API key:
// https://developers.google.com/maps/documentation/urls/get-started#search-action
import React from 'react';

export const googleMapsUrl = (address) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(address).trim())}`;

export const AddressLink = ({ address, children, showPin = false, style, className }) => {
  if (!address || !String(address).trim()) return null;

  return (
    <a
      href={googleMapsUrl(address)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title="Open in Google Maps"
      style={{ color: 'inherit', textDecoration: 'none', ...style }}
      onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
      onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
    >
      {showPin ? '📍 ' : ''}{children || address}
    </a>
  );
};

export default AddressLink;
