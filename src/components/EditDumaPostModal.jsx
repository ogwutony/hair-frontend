// src/components/EditDumaPostModal.jsx
// Lets authors edit their own Duma posts. Saves with PUT /api/duma/:id (owner-only on the server).
// Culture posts: prompt, text, photos/videos (remove existing, add new via /api/media/upload).
// Product Recommendations: product name, brand, link, reason.
// Creator applications (Partner): photos only, so the author can set each photo's focus point.
// Every photo has a Focus button: the chosen point is kept on its URL (see utils/mediaFocus).
import React, { useEffect, useRef, useState } from 'react';
import { BACKEND_URL } from '../utils/constants';
import { FocusPicker, focusButtonStyle } from './FocusPicker';
import { focusPosition, getFocus, isVideoMediaUrl, stripFocus, withFocus } from '../utils/mediaFocus';

const MAX_MEDIA = 6;
const isVideoUrl = isVideoMediaUrl;
const isHttpUrl = (v) => /^https?:\/\/\S+\.\S+/i.test((v || '').trim());
const isRecommendation = (item) => item?.type === 'Product Recommendation' || item?.type === 'Recommendation';
const isMediaOnly = (item) => item?.type === 'Partner';

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' };
const panel = { background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', padding: '20px', boxSizing: 'border-box' };
const input = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '10px', boxSizing: 'border-box', fontFamily: 'inherit' };
const label = { display: 'block', fontSize: '12px', fontWeight: 700, color: '#555', margin: '6px 0', textTransform: 'uppercase' };

export function EditDumaPostModal({ item, authToken, onClose, onSaved }) {
  const rec = isRecommendation(item);
  const mediaOnly = isMediaOnly(item);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [webLink, setWebLink] = useState('');
  const [reason, setReason] = useState('');
  const [existingMedia, setExistingMedia] = useState([]);
  const [newFiles, setNewFiles] = useState([]); // { file, preview, focus }
  // Photo whose focus is being chosen: { kind: 'existing', url } or { kind: 'new', index }
  const [focusTarget, setFocusTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!item) return;
    setPrompt(item.prompt || '');
    setResponse(item.response || '');
    setName(item.name || item.product || '');
    setBrand(item.brand || item.company || '');
    setWebLink(item.webLink || '');
    setReason(item.reason || '');
    setExistingMedia(Array.isArray(item.mediaUrls) ? item.mediaUrls.filter(isHttpUrl) : []);
    setNewFiles([]);
    setError('');
  }, [item]);

  // Free preview object URLs once a file is removed, and all of them when the dialog closes.
  // (Updating a file's focus keeps its preview, so only URLs no longer in the list are freed.)
  const previewsRef = useRef([]);
  useEffect(() => {
    const current = newFiles.map((f) => f.preview);
    previewsRef.current.filter((p) => !current.includes(p)).forEach((p) => URL.revokeObjectURL(p));
    previewsRef.current = current;
  }, [newFiles]);
  useEffect(() => () => previewsRef.current.forEach((p) => URL.revokeObjectURL(p)), []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !saving && !focusTarget) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, saving, focusTarget]);

  if (!item) return null;

  const mediaCount = existingMedia.length + newFiles.length;

  const addFiles = (e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_MEDIA - mediaCount);
    setNewFiles((prev) => [...prev, ...files.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
    e.target.value = '';
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', file.type.startsWith('video/') ? 'video' : 'image');
    const res = await fetch(`${BACKEND_URL}/api/media/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData,
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => ({}));
    return data.storageUrl || data.secure_url || data.url || null;
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    let body;
    if (rec) {
      if (!name.trim() || !brand.trim() || !reason.trim()) { setError('Please fill in the product, brand and reason.'); return; }
      if (!isHttpUrl(webLink)) { setError('Please enter a full product link starting with https://'); return; }
      body = { name: name.trim(), brand: brand.trim(), webLink: webLink.trim(), reason: reason.trim() };
    } else if (mediaOnly) {
      body = { mediaUrls: existingMedia };
    } else {
      if (!response.trim()) { setError('Please write something for your post.'); return; }
      body = { prompt: prompt.trim(), response: response.trim(), mediaUrls: existingMedia };
    }

    setSaving(true);
    try {
      if (!rec && newFiles.length > 0) {
        const uploaded = (await Promise.all(newFiles.map((f) => uploadFile(f.file)
          .then((url) => (url ? withFocus(url, f.focus) : null))
          .catch(() => null)))).filter(Boolean);
        if (uploaded.length < newFiles.length) {
          setError(`${newFiles.length - uploaded.length} file(s) couldn't be uploaded. Please try again.`);
          setSaving(false);
          return;
        }
        body.mediaUrls = [...existingMedia, ...uploaded];
      }
      const id = item._id || item.id;
      const res = await fetch(`${BACKEND_URL}/api/duma/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || `Your changes weren't saved (${res.status}). Please try again.`); setSaving(false); return; }
      onSaved(data.item || { ...item, ...body });
    } catch {
      setError("We couldn't reach the server, so your changes weren't saved. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div style={overlay} onClick={() => !saving && onClose()} role="presentation">
      <form style={panel} onClick={(e) => e.stopPropagation()} onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="edit-duma-title">
        <h3 id="edit-duma-title" style={{ marginTop: 0 }}>{mediaOnly ? 'Edit photos' : 'Edit post'}</h3>
        {!rec && <p style={{ margin: '-6px 0 12px', fontSize: '12px', color: '#666' }}>Use <strong>Focus</strong> on a photo to choose the part that stays in view when it's cropped.</p>}
        {error && <div role="alert" style={{ background: '#fdecea', color: '#b00020', padding: '10px', borderRadius: '8px', marginBottom: '10px', fontSize: '13px' }}>{error}</div>}

        {rec ? (
          <>
            <label style={label} htmlFor="edit-name">Product name</label>
            <input id="edit-name" style={input} value={name} onChange={(e) => setName(e.target.value)} />
            <label style={label} htmlFor="edit-brand">Brand</label>
            <input id="edit-brand" style={input} value={brand} onChange={(e) => setBrand(e.target.value)} />
            <label style={label} htmlFor="edit-link">Product link</label>
            <input id="edit-link" style={input} type="url" value={webLink} onChange={(e) => setWebLink(e.target.value)} />
            <label style={label} htmlFor="edit-reason">Why you recommend it</label>
            <textarea id="edit-reason" style={{ ...input, minHeight: '110px' }} value={reason} onChange={(e) => setReason(e.target.value)} />
          </>
        ) : (
          <>
            {!mediaOnly && (
              <>
                <label style={label} htmlFor="edit-prompt">Prompt</label>
                <input id="edit-prompt" style={input} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                <label style={label} htmlFor="edit-response">Your post</label>
                <textarea id="edit-response" style={{ ...input, minHeight: '140px' }} value={response} onChange={(e) => setResponse(e.target.value)} />
              </>
            )}

            <span style={label}>Photos & videos ({mediaCount}/{MAX_MEDIA})</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {existingMedia.map((url) => (
                <div key={url} style={{ position: 'relative', width: '84px', height: '84px' }}>
                  {isVideoUrl(url)
                    ? <video src={stripFocus(url)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', background: '#000' }} muted preload="metadata" />
                    : <img src={stripFocus(url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: focusPosition(url), borderRadius: '8px' }} />}
                  {!isVideoUrl(url) && (
                    <button type="button" style={focusButtonStyle} aria-label="Set photo focus" onClick={() => setFocusTarget({ kind: 'existing', url })}>Focus</button>
                  )}
                  <button type="button" aria-label="Remove attachment" onClick={() => setExistingMedia((prev) => prev.filter((u) => u !== url))}
                    style={{ position: 'absolute', top: '-6px', right: '-6px', width: '22px', height: '22px', borderRadius: '50%', border: 0, background: '#e74c3c', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>×</button>
                </div>
              ))}
              {newFiles.map((f, i) => (
                <div key={f.preview} style={{ position: 'relative', width: '84px', height: '84px' }}>
                  {f.file.type.startsWith('video/')
                    ? <video src={f.preview} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', background: '#000' }} muted />
                    : <img src={f.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: focusPosition(f.focus), borderRadius: '8px' }} />}
                  {!f.file.type.startsWith('video/') && (
                    <button type="button" style={focusButtonStyle} aria-label="Set photo focus" onClick={() => setFocusTarget({ kind: 'new', index: i })}>Focus</button>
                  )}
                  <button type="button" aria-label="Remove new attachment" onClick={() => setNewFiles((prev) => prev.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: '-6px', right: '-6px', width: '22px', height: '22px', borderRadius: '50%', border: 0, background: '#e74c3c', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>×</button>
                </div>
              ))}
              {mediaCount < MAX_MEDIA && (
                <label style={{ width: '84px', height: '84px', borderRadius: '8px', border: '1px dashed #2FA862', background: '#DCF0E5', color: '#1A7844', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
                  + Add
                  <input type="file" accept="image/*,video/*" multiple onChange={addFiles} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} disabled={saving} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>Cancel</button>
          <button type="submit" disabled={saving} style={{ padding: '10px 16px', borderRadius: '8px', border: 0, background: '#222', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
      {focusTarget && (
        // Keep clicks in the picker from reaching this dialog's backdrop (which would close it)
        <div onClick={(e) => e.stopPropagation()} role="presentation">
        <FocusPicker
          src={focusTarget.kind === 'existing' ? stripFocus(focusTarget.url) : newFiles[focusTarget.index]?.preview}
          value={focusTarget.kind === 'existing' ? getFocus(focusTarget.url) : newFiles[focusTarget.index]?.focus}
          onClose={() => setFocusTarget(null)}
          onSave={(focus) => {
            if (focusTarget.kind === 'existing') {
              setExistingMedia((prev) => prev.map((u) => (u === focusTarget.url ? withFocus(u, focus) : u)));
            } else {
              setNewFiles((prev) => prev.map((f, j) => (j === focusTarget.index ? { ...f, focus } : f)));
            }
            setFocusTarget(null);
          }}
        />
        </div>
      )}
    </div>
  );
}

export default EditDumaPostModal;
