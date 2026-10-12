// src/components/ImageLightbox.jsx
// Full-screen view of a post's photos. Opens on double-click (or Enter) on a Duma photo.
// Arrow keys / buttons move between photos, Escape or the backdrop closes.
import React, { useEffect, useRef } from 'react';

/** Smaller Cloudinary copy for on-page display (originals are ~1MB). Non-Cloudinary URLs are left alone. */
export const sizedImageUrl = (url, width) => {
  const m = typeof url === 'string' && url.match(/^(https?:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|video)\/upload\/)(v\d+\/.*)$/);
  return m ? `${m[1]}c_limit,w_${width},q_auto,f_auto/${m[2]}` : url;
};

const navBtn = {
  position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%',
  border: 0, background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '24px', cursor: 'pointer',
};

export function ImageLightbox({ photos, index, onIndexChange, onClose }) {
  const closeRef = useRef(null);
  const open = index !== null && index !== undefined && photos.length > 0;

  useEffect(() => {
    if (!open) return undefined;
    const prevFocus = document.activeElement;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onIndexChange((index + 1) % photos.length);
      else if (e.key === 'ArrowLeft') onIndexChange((index - 1 + photos.length) % photos.length);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    };
  }, [open, index, photos.length, onClose, onIndexChange]);

  if (!open) return null;
  const many = photos.length > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${photos.length}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}
    >
      <img
        src={sizedImageUrl(photos[index], 2000)}
        alt={`Attachment ${index + 1} of ${photos.length}`}
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '6px' }}
        onError={(e) => { if (e.currentTarget.src !== photos[index]) e.currentTarget.src = photos[index]; }}
      />
      <button ref={closeRef} type="button" aria-label="Close photo" onClick={onClose}
        style={{ position: 'absolute', top: '12px', right: '12px', width: '40px', height: '40px', borderRadius: '50%', border: 0, background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>
        ✕
      </button>
      {many && (
        <>
          <button type="button" aria-label="Previous photo" onClick={() => onIndexChange((index - 1 + photos.length) % photos.length)} style={{ ...navBtn, left: '12px' }}>‹</button>
          <button type="button" aria-label="Next photo" onClick={() => onIndexChange((index + 1) % photos.length)} style={{ ...navBtn, right: '12px' }}>›</button>
          <div style={{ position: 'absolute', bottom: '14px', left: 0, right: 0, textAlign: 'center', color: '#ddd', fontSize: '13px' }}>
            {index + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  );
}

export default ImageLightbox;
