// src/components/AddressLink.jsx
import React from 'react';
import { googleMapsUrl, isSpecificAddress } from '../utils/maps';

// The grey 📍 location pill used on Duma and Perspectives cards.
export const LOCATION_PILL_STYLE = { fontSize: '11px', color: '#555', backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', marginBottom: '10px', alignItems: 'center', gap: '4px' };

// Shows an address, linked to Google Maps when it's specific enough to pin.
// variant="pill" renders the grey pill; variant="inline" renders bare text.
export const AddressLink = ({ address, variant = 'pill', style }) => {
  const text = String(address || '').trim();
  if (!text) return null;
  const baseStyle = variant === 'pill' ? { ...LOCATION_PILL_STYLE, ...style } : style;
  const label = variant === 'pill' ? `📍 ${text}` : text;

  if (!isSpecificAddress(text)) return <span style={baseStyle}>{label}</span>;

  return (
    <a
      href={googleMapsUrl(text)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${text} in Google Maps`}
      title="Open in Google Maps"
      onClick={(e) => e.stopPropagation()}
      className="address-link"
      style={{ ...baseStyle, textDecoration: 'none', color: variant === 'pill' ? '#555' : 'inherit', cursor: 'pointer' }}
    >
      {label}
    </a>
  );
};
