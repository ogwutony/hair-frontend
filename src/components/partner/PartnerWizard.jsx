// src/components/partner/PartnerWizard.jsx
// Shared 3-step wizard used by every partner track (Brand & Retail, Creator, Venue, Marketplace,
// Review Request). Each track supplies a config: its steps (title, heading, body, validation),
// initial values, which fields may be kept as a draft, and how to build the multipart payload
// for POST /api/duma/partner. Submission itself is handled by the parent (PartnerPage).
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { styles } from '../../utils/styles';
import { LocationAutocomplete } from '../LocationAutocomplete';

export const INK = '#1a1a1a';
export const MUTED = '#666';
export const LINE = '#e0e0e0';

export const isHttpUrl = (v) => /^https?:\/\/\S+\.\S+/i.test((v || '').trim());
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim());
// Accept "yourbrand.com" and add https:// for the applicant
export const normalizeUrl = (v) => { const t = (v || '').trim(); return !t || /^https?:\/\//i.test(t) ? t : `https://${t}`; };
// "Klyde Warren Park, Dallas, TX 75201, USA" -> "USA"
export const countryFromLocation = (loc) => { const parts = (loc || '').split(',').map(p => p.trim()).filter(Boolean); return parts.length > 1 ? parts[parts.length - 1] : (parts[0] || ''); };

// ── Small building blocks ───────────────────────────────────────────────────
export const ui = {
  label: { display: 'block', fontSize: '13px', fontWeight: 600, marginTop: '16px', marginBottom: '4px' },
  hint: { fontSize: '12px', color: '#888', margin: '2px 0 8px' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', columnGap: '14px' },
  select: { ...styles.input, appearance: 'auto', backgroundColor: '#fff' },
  chip: (selected) => ({
    padding: '10px 16px', minHeight: '44px', borderRadius: '999px',
    border: `1.5px solid ${selected ? INK : LINE}`,
    backgroundColor: selected ? INK : '#fff', color: selected ? '#fff' : INK,
    fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
  }),
};
const Optional = () => <span style={{ fontWeight: 400, color: '#888' }}>(optional)</span>;

export const StepHeading = ({ title, hint }) => (
  <>
    <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>{title}</h3>
    {hint && <p style={{ ...ui.hint, fontSize: '13px' }}>{hint}</p>}
  </>
);

export const Field = ({ id, label, required, optional, hint, children }) => (
  <div>
    <label style={ui.label} htmlFor={id}>{label}{required ? ' *' : ''} {optional && <Optional />}</label>
    {hint && <p style={ui.hint}>{hint}</p>}
    {children}
  </div>
);

export const TextInput = ({ id, label, required, optional, hint, value, onChange, ...rest }) => (
  <Field id={id} label={label} required={required} optional={optional} hint={hint}>
    <input id={id} style={styles.input} value={value} onChange={e => onChange(e.target.value)} {...rest} />
  </Field>
);

export const TextArea = ({ id, label, required, optional, hint, value, onChange, rows = 4, ...rest }) => (
  <Field id={id} label={label} required={required} optional={optional} hint={hint}>
    <textarea id={id} rows={rows} style={{ ...styles.input, resize: 'vertical', fontFamily: 'inherit' }} value={value} onChange={e => onChange(e.target.value)} {...rest} />
  </Field>
);

export const SelectInput = ({ id, label, required, optional, value, onChange, options, placeholder = 'Select…' }) => (
  <Field id={id} label={label} required={required} optional={optional}>
    <select id={id} style={ui.select} value={value} onChange={e => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map(o => typeof o === 'string'
        ? <option key={o} value={o}>{o}</option>
        : <optgroup key={o.group} label={o.group}>{o.items.map(i => <option key={i} value={i}>{i}</option>)}</optgroup>)}
    </select>
  </Field>
);

// Pill buttons. multi=false: value is a string; multi=true: value is an array.
export const Chips = ({ label, required, optional, hint, options, value, onChange, multi = false }) => {
  const isOn = (o) => (multi ? value.includes(o) : value === o);
  const toggle = (o) => onChange(multi ? (value.includes(o) ? value.filter(v => v !== o) : [...value, o]) : o);
  return (
    <div>
      {label && <span style={ui.label}>{label}{required ? ' *' : ''} {optional && <Optional />}</span>}
      {hint && <p style={ui.hint}>{hint}</p>}
      <div role={multi ? 'group' : 'radiogroup'} aria-label={label} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
        {options.map(o => (
          <button key={o} type="button" role={multi ? undefined : 'radio'} aria-checked={multi ? undefined : isOn(o)} aria-pressed={multi ? isOn(o) : undefined}
            style={ui.chip(isOn(o))} onClick={() => toggle(o)}>{multi && isOn(o) ? '✓ ' : ''}{o}</button>
        ))}
      </div>
    </div>
  );
};

// Selectable cards with a title and short description (multi-select)
export const ChoiceCards = ({ label, required, hint, options, value, onChange, minWidth = 220 }) => (
  <div>
    {label && <span style={ui.label}>{label}{required ? ' *' : ''} <span style={{ fontWeight: 400, color: '#888' }}>(select all that apply)</span></span>}
    {hint && <p style={ui.hint}>{hint}</p>}
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`, gap: '10px', marginTop: '6px' }}>
      {options.map(({ id, title, desc, badge }) => {
        const on = value.includes(id);
        return (
          <button key={id} type="button" aria-pressed={on} onClick={() => onChange(on ? value.filter(v => v !== id) : [...value, id])}
            style={{ textAlign: 'left', padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
              border: `1.5px solid ${on ? INK : LINE}`, backgroundColor: on ? '#f6f6f6' : '#fff', color: INK }}>
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
              {on ? '✓ ' : ''}{title || id}
              {badge && <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', backgroundColor: INK, color: '#fff' }}>{badge}</span>}
            </div>
            <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.5 }}>{desc}</div>
          </button>
        );
      })}
    </div>
  </div>
);

// Social channels: pick channels, then enter a handle / URL for each
export const SOCIAL_OPTIONS = [
  { id: 'Instagram', placeholder: '@yourhandle or https://instagram.com/yourhandle' },
  { id: 'TikTok', placeholder: '@yourhandle or https://tiktok.com/@yourhandle' },
  { id: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
  { id: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
  { id: 'LinkedIn / X', placeholder: 'https://linkedin.com/… or @handle' },
];
export const missingSocial = (socials) => { const m = Object.entries(socials || {}).find(([, v]) => !v.trim()); return m ? `Please add your ${m[0]} handle or URL, or deselect it.` : ''; };
export const SocialPicker = ({ idPrefix, label = 'Social Media', required, hint = "Select the channels you're active on.", value, onChange, options = SOCIAL_OPTIONS }) => {
  const toggle = (id) => { const next = { ...value }; if (id in next) delete next[id]; else next[id] = ''; onChange(next); };
  return (
    <div>
      <span style={ui.label}>{label}{required ? ' *' : ''}</span>
      <p style={ui.hint}>{hint}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {options.map(({ id }) => {
          const on = id in value;
          return <button key={id} type="button" aria-pressed={on} style={ui.chip(on)} onClick={() => toggle(id)}>{on ? '✓ ' : '+ '}{id}</button>;
        })}
      </div>
      {options.filter(s => s.id in value).map(({ id, placeholder }) => (
        <TextInput key={id} id={`${idPrefix}-social-${id}`} label={id} required placeholder={placeholder} autoCapitalize="none"
          value={value[id]} onChange={v => onChange({ ...value, [id]: v })} />
      ))}
    </div>
  );
};

// Address / city search (Google Places) plus "Use my current location"
export const LocationField = ({ id, label = 'Location', required, optional, hint, placeholder = 'Start typing a city or address', value, onChange }) => {
  const [status, setStatus] = useState('');
  const locate = () => {
    if (!navigator.geolocation) { setStatus("Your browser can't share location. Please type it instead."); return; }
    setStatus('Finding your location…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        const fallback = () => { onChange(`${lat.toFixed(4)}, ${lng.toFixed(4)}`); setStatus('Location added. You can edit it if needed.'); };
        if (!window.google?.maps?.Geocoder) return fallback();
        new window.google.maps.Geocoder().geocode({ location: { lat, lng } }, (results, gStatus) => {
          if (gStatus !== 'OK' || !results?.length) return fallback();
          // Prefer a city-level result ("Dallas, TX, USA") over a full street address
          const city = results.find(r => r.types.includes('locality')) || results.find(r => r.types.includes('postal_code')) || results[0];
          onChange(city.formatted_address);
          setStatus('');
        });
      },
      () => setStatus("We couldn't get your location. Please type it instead."),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };
  return (
    <Field id={id} label={label} required={required} optional={optional} hint={hint}>
      <LocationAutocomplete value={value} onChange={onChange} placeholder={placeholder} style={styles.input} />
      <button type="button" onClick={locate}
        style={{ background: 'none', border: 'none', padding: '2px 0', color: INK, fontSize: '13px', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>
        📍 Use my current location
      </button>
      {status && <div role="status" style={{ fontSize: '12px', color: MUTED, marginTop: '4px' }}>{status}</div>}
    </Field>
  );
};

// Drag-and-drop images (+ optional single video) with previews. value = { photos: [{file,url}], video: {file,url}|null }
const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 50;
export const MediaDrop = ({ label, optional = true, hint, photos = [], video = null, onChange, maxImages = 3, allowVideo = true, allowImages = true, compact = false }) => {
  const input = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [note, setNote] = useState('');
  const mb = (file) => file.size / (1024 * 1024);
  const add = (fileList) => {
    const next = [...photos];
    let vid = video;
    const skipped = [];
    Array.from(fileList || []).forEach(file => {
      if (allowImages && file.type.startsWith('image/')) {
        if (next.length >= maxImages) skipped.push(`${file.name} (${maxImages} image${maxImages > 1 ? 's' : ''} max)`);
        else if (mb(file) > MAX_IMAGE_MB) skipped.push(`${file.name} (over ${MAX_IMAGE_MB} MB)`);
        else next.push({ file, url: URL.createObjectURL(file) });
      } else if (allowVideo && file.type.startsWith('video/')) {
        if (vid) skipped.push(`${file.name} (1 video max)`);
        else if (mb(file) > MAX_VIDEO_MB) skipped.push(`${file.name} (over ${MAX_VIDEO_MB} MB)`);
        else vid = { file, url: URL.createObjectURL(file) };
      } else skipped.push(`${file.name} (${allowImages && allowVideo ? 'images and video only' : allowVideo ? 'video only' : 'images only'})`);
    });
    onChange({ photos: next, video: vid });
    setNote(skipped.length ? `Not added: ${skipped.join('; ')}.` : '');
  };
  const accept = [allowImages && 'image/*', allowVideo && 'video/*'].filter(Boolean).join(',');
  const what = [allowImages && `up to ${maxImages} image${maxImages > 1 ? 's' : ''}`, allowVideo && '1 short video'].filter(Boolean).join(' and ');
  const removeBtn = { position: 'absolute', top: '-6px', right: '-6px', width: '22px', height: '22px', borderRadius: '50%', border: 'none', background: INK, color: '#fff', cursor: 'pointer', fontSize: '12px' };
  return (
    <div>
      {label && <span style={ui.label}>{label} {optional && <Optional />}</span>}
      {hint && <p style={ui.hint}>{hint}</p>}
      <div role="button" tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.current?.click(); } }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); add(e.dataTransfer.files); }}
        style={{ ...styles.uploadBox, padding: compact ? '12px' : '20px', marginTop: '6px', cursor: 'pointer', borderColor: dragging ? INK : '#ddd', backgroundColor: dragging ? '#f0f0f0' : '#fafafa' }}>
        {!compact && <div style={{ fontSize: '22px' }}>⬆</div>}
        <div style={{ fontWeight: 600, fontSize: '14px' }}>Drag & drop or tap to upload</div>
        <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{what[0].toUpperCase() + what.slice(1)}</div>
        <input ref={input} type="file" accept={accept} multiple={maxImages > 1 || allowVideo} hidden onChange={e => { add(e.target.files); e.target.value = ''; }} />
      </div>
      {note && <div role="status" style={{ fontSize: '12px', color: '#a61b1b', marginTop: '8px' }}>{note}</div>}
      {(photos.length > 0 || video) && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
          {photos.map((p, i) => (
            <div key={p.url} style={{ position: 'relative' }}>
              <img src={p.url} alt={`Upload ${i + 1}`} style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px' }} />
              <button type="button" aria-label={`Remove image ${i + 1}`} style={removeBtn}
                onClick={() => { URL.revokeObjectURL(p.url); onChange({ photos: photos.filter((_, idx) => idx !== i), video }); setNote(''); }}>×</button>
            </div>
          ))}
          {video && (
            <div style={{ position: 'relative' }}>
              <video src={video.url} style={{ width: '120px', height: '72px', objectFit: 'cover', borderRadius: '8px' }} muted />
              <button type="button" aria-label="Remove video" style={removeBtn}
                onClick={() => { URL.revokeObjectURL(video.url); onChange({ photos, video: null }); setNote(''); }}>×</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// One checkbox for all terms, with an expandable summary of what they cover
export const TermsAgreement = ({ id, checked, onChange, title, items }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: '12px', marginTop: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px' }}>
        <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ width: '18px', height: '18px', flexShrink: 0 }} />
        <label htmlFor={id} style={{ flex: 1, fontSize: '14px', cursor: 'pointer' }}>I agree to the <strong>{title}</strong> *</label>
        <button type="button" aria-expanded={open} aria-controls={`${id}-body`} onClick={() => setOpen(!open)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: MUTED, whiteSpace: 'nowrap', padding: '6px' }}>
          {open ? 'Hide ▴' : "What's included ▾"}
        </button>
      </div>
      {open && (
        <ul id={`${id}-body`} style={{ margin: 0, padding: '0 18px 14px 46px', fontSize: '13px', color: '#444', lineHeight: 1.7 }}>
          {items.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
      )}
    </div>
  );
};

// Standard policy links used in several tracks' terms
export const POLICY_LINKS = {
  returns: <><Link to="/returns" target="_blank" rel="noopener noreferrer">Shipping &amp; Returns Policy ↗</Link></>,
  tos: <><Link to="/TermsofService" target="_blank" rel="noopener noreferrer">Terms of Service ↗</Link></>,
};

// ── Draft handling ──────────────────────────────────────────────────────────
const loadDraft = (key) => { try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch (e) { return null; } };
// Collect every preview blob URL in the form state (photos, videos, per-product photos)
const collectBlobUrls = (v, out = []) => {
  if (Array.isArray(v)) v.forEach(x => collectBlobUrls(x, out));
  else if (v && typeof v === 'object') {
    if (v.file && typeof v.url === 'string') out.push(v.url);
    else Object.values(v).forEach(x => collectBlobUrls(x, out));
  }
  return out;
};

// ── The wizard ──────────────────────────────────────────────────────────────
export const PartnerWizard = ({ track, authToken, canApplyPremium, submitting, serverError, onSubmit }) => {
  const last = track.steps.length - 1;
  const [draft] = useState(() => loadDraft(track.draftKey));
  const [step, setStep] = useState(Math.min(last, Math.max(0, Number(draft?.step) || 0)));
  const [error, setError] = useState('');
  const [hiddenServerError, setHiddenServerError] = useState('');
  const topRef = useRef(null);
  const [f, setF] = useState(() => ({ ...track.initial, tier: 'National Associate', termsAgreed: false, ...(draft?.fields || {}) }));
  const set = (patch) => setF(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));

  const saveDraft = () => {
    try {
      const fields = {};
      track.draftFields.forEach(k => { fields[k] = f[k]; });
      sessionStorage.setItem(track.draftKey, JSON.stringify({ fields, step }));
    } catch (e) { /* storage unavailable: progress just won't be kept */ }
  };

  // Release preview blob URLs when the wizard goes away
  const stateRef = useRef(f);
  stateRef.current = f;
  useEffect(() => () => collectBlobUrls(stateRef.current).forEach(u => URL.revokeObjectURL(u)), []);

  const validate = (s) => {
    if (s === last && !f.termsAgreed) return `Please agree to the ${track.terms.title}.`;
    return track.steps[s].validate ? track.steps[s].validate(f) : '';
  };
  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const next = () => {
    const msg = validate(step);
    setError(msg);
    if (!msg) { setHiddenServerError(serverError); setStep(step + 1); scrollTop(); }
  };
  const back = () => { setError(''); setHiddenServerError(serverError); setStep(step - 1); scrollTop(); };
  const goTo = (i) => { if (i < step) { setError(''); setHiddenServerError(serverError); setStep(i); } };
  const shownServerError = serverError && serverError !== hiddenServerError ? serverError : '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < last) return next();
    for (let s = 0; s <= last; s++) {
      const msg = validate(s);
      if (msg) { setError(msg); setStep(s); return; }
    }
    setError('');
    setHiddenServerError('');
    const fd = new FormData();
    fd.append('partnerCategory', track.category);
    fd.append('tier', canApplyPremium ? f.tier : 'National Associate');
    track.buildPayload(f, fd);
    const blobs = collectBlobUrls(f);
    onSubmit(fd, { hasPhoto: blobs.length > (f.video ? 1 : 0), hasVideo: !!f.video });
  };

  const ctx = { f, set, idp: track.idPrefix };
  const current = track.steps[step];

  return (
    <form onSubmit={handleSubmit} noValidate style={{ backgroundColor: '#fff', border: `1px solid ${LINE}`, borderRadius: '20px', padding: 'clamp(18px, 4vw, 32px)' }}>
      <div ref={topRef} style={{ scrollMarginTop: '80px' }} />
      <ol style={{ display: 'flex', gap: '8px', listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
        {track.steps.map(({ title }, i) => {
          const done = i < step, cur = i === step;
          return (
            <li key={title} style={{ flex: 1, minWidth: 0 }} aria-current={cur ? 'step' : undefined}>
              <button type="button" onClick={() => goTo(i)} disabled={i >= step}
                style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'inherit', textAlign: 'left', display: 'block', width: '100%', cursor: done ? 'pointer' : 'default' }}>
                <div style={{ height: '4px', borderRadius: '2px', backgroundColor: done || cur ? INK : LINE, marginBottom: '8px' }} />
                <div style={{ fontSize: '11px', color: MUTED, fontWeight: 600 }}>STEP {i + 1}</div>
                <div style={{ fontSize: '13px', fontWeight: cur ? 700 : 500, color: cur ? INK : MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {done ? '✓ ' : ''}{title}
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      {!authToken && step === 0 && (
        <div style={{ backgroundColor: '#f6f6f6', border: `1px solid ${LINE}`, borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#444', marginBottom: '16px', lineHeight: 1.5 }}>
          You'll need an account to submit. <Link to="/login" onClick={saveDraft} style={{ color: INK, fontWeight: 600 }}>Log in</Link> or <Link to="/signup" onClick={saveDraft} style={{ color: INK, fontWeight: 600 }}>create one</Link> first. Your answers are kept in this browser tab{track.draftNote ? `, except ${track.draftNote}` : ''}.
        </div>
      )}
      {(error || shownServerError) && <div role="alert" style={{ backgroundColor: '#fdecec', color: '#a61b1b', border: '1px solid #f5c2c2', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', marginBottom: '12px' }}>{error || shownServerError}</div>}

      <StepHeading title={current.heading} hint={current.hint} />
      {current.render(ctx)}

      {step === last && (
        <>
          <TermsAgreement id={`${track.idPrefix}-terms`} checked={f.termsAgreed} onChange={v => set({ termsAgreed: v })} title={track.terms.title} items={track.terms.items} />
          {canApplyPremium && (
            <Chips label="Partner Tier" options={['National Associate', 'Premium Partner']} value={f.tier} onChange={v => set({ tier: v })} />
          )}
        </>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '28px', flexWrap: 'wrap-reverse', alignItems: 'flex-start' }}>
        {step > 0 && (
          <button type="button" onClick={back}
            style={{ ...styles.authButton, flex: '1 1 120px', backgroundColor: '#fff', color: INK, border: `1.5px solid ${INK}`, padding: '14px' }}>
            ← Back
          </button>
        )}
        {step < last ? (
          <button type="submit" style={{ ...styles.authButton, flex: '2 1 200px', padding: '14px' }}>Continue →</button>
        ) : !authToken ? (
          <div style={{ flex: '2 1 240px', padding: '16px', border: `1.5px solid ${LINE}`, borderRadius: '12px', textAlign: 'center', backgroundColor: '#fafafa' }}>
            <p style={{ margin: '0 0 12px', fontSize: '14px', color: MUTED }}>Log in or create an account to submit your application.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/login" onClick={saveDraft} style={{ ...styles.authButton, width: 'auto', padding: '12px 24px', textDecoration: 'none' }}>Log In</Link>
              <Link to="/signup" onClick={saveDraft} style={{ ...styles.authButton, width: 'auto', padding: '12px 24px', textDecoration: 'none', backgroundColor: '#fff', color: INK, border: `1.5px solid ${INK}` }}>Create Account</Link>
            </div>
          </div>
        ) : (
          <button type="submit" disabled={submitting}
            style={{ ...styles.authButton, flex: '2 1 240px', padding: '16px', fontSize: '15px', backgroundColor: '#000', opacity: submitting ? 0.6 : 1, cursor: submitting ? 'wait' : 'pointer' }}>
            {submitting ? 'Submitting…' : track.submitLabel || 'Submit Application'}
          </button>
        )}
      </div>
      <p style={{ textAlign: 'center', fontSize: '12px', color: '#999', margin: '12px 0 0' }}>Step {step + 1} of {last + 1}</p>
    </form>
  );
};
