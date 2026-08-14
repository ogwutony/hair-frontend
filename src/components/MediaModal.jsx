// src/components/MediaModal.jsx
import React from 'react';

export const MediaModal = ({ media, onClose }) => {
  if (!media) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={onClose}>
      <button type="button" aria-label="Close media preview" style={{ position: 'absolute', top: '20px', right: '30px', background: 'transparent', border: 'none', color: '#fff', fontSize: '36px', cursor: 'pointer', zIndex: 100000 }} onClick={onClose}>✕</button>
      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90%', maxHeight: '90%', position: 'relative' }}>
        {media.type === 'video' ? (
          <video src={media.url} controls autoPlay playsInline style={{ maxWidth: '100vw', maxHeight: '90vh', borderRadius: '8px', outline: 'none' }} />
        ) : (
          <img src={media.url} alt="Enlarged view" style={{ maxWidth: '100vw', maxHeight: '90vh', borderRadius: '8px', objectFit: 'contain' }} />
        )}
      </div>
    </div>
  );
};
