// src/components/EditDumaPostModal.jsx
// Lets authors edit their own Duma posts. Saves with PUT /api/duma/:id (owner-only on the server).
// Culture posts: prompt, text, photos/videos (remove existing, add new via /api/media/upload).
// Product Recommendations: product name, brand, link, reason.
import React, { useEffect, useState } from 'react';
import { BACKEND_URL } from '../utils/constants';

const MAX_MEDIA = 6;
const isVideoUrl = (url) => /\.(mp4|mov|webm|m4v)$/i.test(url) || url.includes('/video/upload/');
const isHttpUrl = (v) => /^https?:\/\/\S+\.\S+/i.test((v || '').trim());
const isRecommendation = (item) => item?.type === 'Product Recommendation' || item?.type === 'Recommendation';

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' };
const panel = { background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', padding: '20px', boxSizing: 'border-box' };
const input = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '10px', boxSizing: 'border-box', fontFamily: 'inherit' };
const label = { display: 'block', fontSize: '12px', fontWeight: 700, color: '#555', margin: '6px 0', textTransform: 'uppercase' };

export function EditDumaPostModal({ item, authToken, onClose, onSaved }) {
  const rec = isRecommendation(item);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [webLink, setWebLink] = useState('');
  const [reason, setReason] = useState('');
  const [existingMedia, setExistingMedia] = useState([]);
  const [newFiles, setNewFiles] = useState([]); // { file, preview }
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

  // Free object URLs made for previews
  useEffect(() => () => newFiles.forEach((f) => URL.revokeObjectURL(f.preview)), [newFiles]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !saving) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, saving]);

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
    } else {
      if (!response.trim()) { setError('Please write something for your post.'); return; }
      body = { prompt: prompt.trim(), response: response.trim(), mediaUrls: existingMedia };
    }

    setSaving(true);
    try {
      if (!rec && newFiles.length > 0) {
        const uploaded = (await Promise.all(newFiles.map((f) => uploadFile(f.file).catch(() => null)))).filter(Boolean);
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
        <h3 id="edit-duma-title" style={{ marginTop: 0 }}>Edit post</h3>
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
            <label style={label} htmlFor="edit-prompt">Prompt</label>
            <input id="edit-prompt" style={input} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            <label style={label} htmlFor="edit-response">Your post</label>
            <textarea id="edit-response" style={{ ...input, minHeight: '140px' }} value={response} onChange={(e) => setResponse(e.target.value)} />

            <span style={label}>Photos & videos ({mediaCount}/{MAX_MEDIA})</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {existingMedia.map((url) => (
                <div key={url} style={{ position: 'relative', width: '84px', height: '84px' }}>
                  {isVideoUrl(url)
                    ? <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', background: '#000' }} muted preload="metadata" />
                    : <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />}
                  <button type="button" aria-label="Remove attachment" onClick={() => setExistingMedia((prev) => prev.filter((u) => u !== url))}
                    style={{ position: 'absolute', top: '-6px', right: '-6px', width: '22px', height: '22px', borderRadius: '50%', border: 0, background: '#e74c3c', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>×</button>
                </div>
              ))}
              {newFiles.map((f, i) => (
                <div key={f.preview} style={{ position: 'relative', width: '84px', height: '84px' }}>
                  {f.file.type.startsWith('video/')
                    ? <video src={f.preview} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', background: '#000' }} muted />
                    : <img src={f.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />}
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
    </div>
  );
}

export default EditDumaPostModal;
