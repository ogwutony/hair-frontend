// src/components/FocusPicker.jsx
//
// Lets an author choose which part of a photo stays in view when the site crops it.
// Click or drag on the photo (or use the arrow keys) to move the point; the previews show the
// two crops used on the site: the wide single-photo view and the square grid tile.
import React, { useEffect, useRef, useState } from 'react';
import { DEFAULT_FOCUS, focusPosition } from '../utils/mediaFocus';

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' };
const panel = { background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto', padding: '20px', boxSizing: 'border-box' };
const btn = { padding: '10px 16px', borderRadius: '8px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 };
const STEP = 2;

export function FocusPicker({ src, value, onSave, onClose }) {
  const [focus, setFocus] = useState(value || DEFAULT_FOCUS);
  const areaRef = useRef(null);
  const dragging = useRef(false);

  useEffect(() => { setFocus(value || DEFAULT_FOCUS); }, [value, src]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    areaRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const setFromPointer = (event) => {
    const img = areaRef.current?.querySelector('img');
    if (!img) return;
    const rect = img.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setFocus({ x: Math.round(Math.min(100, Math.max(0, x))), y: Math.round(Math.min(100, Math.max(0, y))) });
  };

  const onKeyDown = (e) => {
    const moves = { ArrowLeft: [-STEP, 0], ArrowRight: [STEP, 0], ArrowUp: [0, -STEP], ArrowDown: [0, STEP] };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    setFocus((f) => ({ x: Math.min(100, Math.max(0, f.x + move[0])), y: Math.min(100, Math.max(0, f.y + move[1])) }));
  };

  const position = focusPosition(focus);

  return (
    <div style={overlay} onClick={onClose} role="presentation">
      <div style={panel} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="focus-picker-title">
        <h3 id="focus-picker-title" style={{ margin: '0 0 4px' }}>Choose what stays in view</h3>
        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#666' }}>Tap or drag on the photo to set its focus point. The previews show how it will be cropped on the site.</p>

        <div
          ref={areaRef}
          tabIndex={0}
          role="slider"
          aria-label="Photo focus point"
          aria-valuetext={`${focus.x}% across, ${focus.y}% down`}
          aria-valuenow={focus.x}
          aria-valuemin={0}
          aria-valuemax={100}
          onKeyDown={onKeyDown}
          onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); setFromPointer(e); }}
          onPointerMove={(e) => { if (dragging.current) setFromPointer(e); }}
          onPointerUp={() => { dragging.current = false; }}
          onPointerCancel={() => { dragging.current = false; }}
          style={{ position: 'relative', display: 'flex', justifyContent: 'center', background: '#111', borderRadius: '8px', cursor: 'crosshair', touchAction: 'none', userSelect: 'none', outlineOffset: '3px' }}
        >
          <div style={{ position: 'relative', lineHeight: 0 }}>
            <img src={src} alt="" draggable={false} style={{ display: 'block', maxWidth: '100%', maxHeight: '50vh', objectFit: 'contain' }} />
            <span
              aria-hidden="true"
              data-testid="focus-marker"
              style={{ position: 'absolute', left: `${focus.x}%`, top: `${focus.y}%`, width: '28px', height: '28px', marginLeft: '-14px', marginTop: '-14px', borderRadius: '50%', border: '3px solid #fff', boxShadow: '0 0 0 2px rgba(0,0,0,0.6), inset 0 0 0 2px rgba(0,0,0,0.6)', pointerEvents: 'none' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <figure style={{ margin: 0, flex: '2 1 220px' }}>
            <img src={src} alt="" style={{ width: '100%', height: '120px', objectFit: 'cover', objectPosition: position, borderRadius: '8px', display: 'block' }} />
            <figcaption style={{ fontSize: '11px', color: '#777', marginTop: '4px' }}>Wide view</figcaption>
          </figure>
          <figure style={{ margin: 0, flex: '0 0 120px' }}>
            <img src={src} alt="" style={{ width: '120px', height: '120px', objectFit: 'cover', objectPosition: position, borderRadius: '8px', display: 'block' }} />
            <figcaption style={{ fontSize: '11px', color: '#777', marginTop: '4px' }}>Grid tile</figcaption>
          </figure>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px', flexWrap: 'wrap' }}>
          <button type="button" style={{ ...btn, marginRight: 'auto' }} onClick={() => setFocus(DEFAULT_FOCUS)}>Center</button>
          <button type="button" style={btn} onClick={onClose}>Cancel</button>
          <button type="button" style={{ ...btn, border: 0, background: '#222', color: '#fff' }} onClick={() => onSave(focus)}>Save focus</button>
        </div>
      </div>
    </div>
  );
}

// Small button laid over a photo thumbnail to open the picker
export const focusButtonStyle = {
  position: 'absolute', left: '4px', bottom: '4px', padding: '3px 7px', borderRadius: '999px', border: 0,
  background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '10px', fontWeight: 700, cursor: 'pointer', lineHeight: 1.4,
};

export default FocusPicker;
