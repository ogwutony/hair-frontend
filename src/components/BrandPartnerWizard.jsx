// src/components/BrandPartnerWizard.jsx
// 3-step guided intake for Brand & Retail Partners:
//   1. Profile & Digital  →  2. Fit & Revenue  →  3. Verification & Submit
// Builds the same multipart payload the /api/duma/partner endpoint already accepts (including the
// existing interest flags), plus new fields: marketplaceListingInterest, ecommercePlatform,
// socialChannels, productCategory, monthlyRevenue, partnershipGoals. Submission itself is handled
// by the parent.
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { styles } from '../utils/styles';

const CATEGORY = 'Brand & Retail Partners';
export const BRAND_DRAFT_KEY = 'brand_partner_draft'; // sessionStorage key; the parent clears it after a successful submit
const MAX_IMAGE_MB = 10; // client-side upload limits: tune to what your host accepts
const MAX_VIDEO_MB = 50;
const isHttpUrl = (v) => /^https?:\/\/\S+\.\S+/i.test((v || '').trim());
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim());
// Accept "yourbrand.com" and add https:// for the applicant
const normalizeUrl = (v) => { const t = (v || '').trim(); return !t || /^https?:\/\//i.test(t) ? t : `https://${t}`; };

const STEPS = ['Profile & Digital', 'Fit & Revenue', 'Verification & Submit'];
const PLATFORMS = ['Shopify', 'Wix', 'Squarespace', 'Amazon Store', 'Custom'];
const SOCIALS = [
  { id: 'Instagram', placeholder: '@yourbrand or https://instagram.com/yourbrand' },
  { id: 'TikTok', placeholder: '@yourbrand or https://tiktok.com/@yourbrand' },
  { id: 'YouTube', placeholder: 'https://youtube.com/@yourbrand' },
  { id: 'LinkedIn / X', placeholder: 'https://linkedin.com/company/… or @handle' },
];
const GOAL_WHOLESALE = 'Wholesale / Bulk Purchase';
const GOAL_LISTING = 'Marketplace Listing';
const GOAL_ADS = 'Sponsored Placements / Advertising';
const GOALS = [
  { id: GOAL_WHOLESALE, desc: 'Buy The Majorities products at wholesale pricing for your own channels.' },
  { id: GOAL_LISTING, desc: 'List and sell your products on The Majorities Marketplace.' },
  { id: GOAL_ADS, desc: 'Paid campaigns and sponsored visibility across The Duma and the Marketplace.' },
];
const PRODUCT_CATEGORIES = ['Skincare', 'Haircare', 'Grooming', 'Cosmetics', 'Lifestyle'];
const REVENUE_BANDS = ['Under $10k', '$10k–$50k', '$50k–$250k', '$250k+'];
const TERMS = [
  { key: 'commission20AgreedTo', title: '20% commission structure', body: 'The Majorities retains a 20% commission on sales completed through our platform. There are no listing or setup fees.' },
  { key: 'customerRewardAgreed', title: 'Customer Reward program', body: 'Shoppers earn rank points on purchases of partner products. Rewards are funded and managed by The Majorities.' },
  { key: 'shippingReturnsAgreed', title: 'Shipping & Returns Policy', body: <>Orders follow The Majorities shipping timelines and return window. <Link to="/returns" target="_blank" rel="noopener noreferrer">Read the full Return Policy ↗</Link></> },
  { key: 'ownershipTitleAgreed', title: 'Ownership & Title Policy', body: <>Defines when title to inventory transfers between your brand and The Majorities. <Link to="/TermsofService" target="_blank" rel="noopener noreferrer">Read the Terms of Service ↗</Link></> },
];

const INK = '#1a1a1a';
const MUTED = '#666';
const LINE = '#e0e0e0';

const chip = (selected) => ({
  padding: '10px 16px', minHeight: '44px', borderRadius: '999px',
  border: `1.5px solid ${selected ? INK : LINE}`,
  backgroundColor: selected ? INK : '#fff', color: selected ? '#fff' : INK,
  fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
});
const label = { display: 'block', fontSize: '13px', fontWeight: 600, marginTop: '16px', marginBottom: '4px' };
const hint = { fontSize: '12px', color: '#888', margin: '2px 0 8px' };
const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', columnGap: '14px' };

// Kept in sessionStorage if a logged-out applicant leaves to log in / sign up.
// Deliberately NOT stored: Tax ID, uploads, accepted terms.
const DRAFT_FIELDS = ['company', 'name', 'contactEmail', 'phoneNumber', 'platform', 'websiteUrl', 'socials', 'goals',
  'productCategory', 'monthlyRevenue', 'totalBudget', 'countryOfOrigin', 'operatingCountry'];
const loadDraft = () => { try { return JSON.parse(sessionStorage.getItem(BRAND_DRAFT_KEY) || 'null'); } catch (e) { return null; } };

export const BrandPartnerWizard = ({ authToken, canApplyPremium, submitting, serverError, onSubmit }) => {
  const [draft] = useState(loadDraft);
  const [step, setStep] = useState(Math.min(2, Math.max(0, Number(draft?.step) || 0)));
  const [error, setError] = useState('');
  const [uploadNote, setUploadNote] = useState('');
  const [hiddenServerError, setHiddenServerError] = useState('');
  const [openTerm, setOpenTerm] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef(null);
  const topRef = useRef(null);

  const [f, setF] = useState({
    company: '', name: '', contactEmail: '', phoneNumber: '',
    platform: '', websiteUrl: '',
    socials: {}, // { Instagram: '@handle', ... } — key present = selected
    goals: [], productCategory: '', monthlyRevenue: '',
    ein: '', countryOfOrigin: '', operatingCountry: '',
    photos: [], video: null,
    commission20AgreedTo: false, customerRewardAgreed: false, shippingReturnsAgreed: false, ownershipTitleAgreed: false,
    tier: 'National Associate',
    totalBudget: '',
    ...(draft?.fields || {}),
  });
  const set = (patch) => setF(prev => ({ ...prev, ...patch }));

  const saveDraft = () => {
    try {
      const fields = {};
      DRAFT_FIELDS.forEach(k => { fields[k] = f[k]; });
      sessionStorage.setItem(BRAND_DRAFT_KEY, JSON.stringify({ fields, step }));
    } catch (e) { /* storage unavailable: progress just won't be kept */ }
  };

  // Release preview blob URLs when the wizard goes away
  const mediaRef = useRef({ photos: [], video: null });
  mediaRef.current = { photos: f.photos, video: f.video };
  useEffect(() => () => {
    mediaRef.current.photos.forEach(p => URL.revokeObjectURL(p.url));
    if (mediaRef.current.video) URL.revokeObjectURL(mediaRef.current.video.url);
  }, []);

  const toggleSocial = (id) => setF(prev => {
    const socials = { ...prev.socials };
    if (id in socials) delete socials[id]; else socials[id] = '';
    return { ...prev, socials };
  });
  const toggleGoal = (id) => setF(prev => ({
    ...prev, goals: prev.goals.includes(id) ? prev.goals.filter(g => g !== id) : [...prev.goals, id],
  }));

  // ── Media ──────────────────────────────────────────────────────────────────
  const mb = (file) => file.size / (1024 * 1024);
  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);
    const photos = [...f.photos];
    let video = f.video;
    const skipped = [];
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        if (photos.length >= 3) skipped.push(`${file.name} (3 images max)`);
        else if (mb(file) > MAX_IMAGE_MB) skipped.push(`${file.name} (over ${MAX_IMAGE_MB} MB)`);
        else photos.push({ file, url: URL.createObjectURL(file) });
      } else if (file.type.startsWith('video/')) {
        if (video) skipped.push(`${file.name} (1 video max)`);
        else if (mb(file) > MAX_VIDEO_MB) skipped.push(`${file.name} (over ${MAX_VIDEO_MB} MB)`);
        else video = { file, url: URL.createObjectURL(file) };
      } else {
        skipped.push(`${file.name} (images and video only)`);
      }
    });
    set({ photos, video });
    setUploadNote(skipped.length ? `Not added: ${skipped.join('; ')}.` : '');
  };
  const removePhoto = (i) => { URL.revokeObjectURL(f.photos[i].url); set({ photos: f.photos.filter((_, idx) => idx !== i) }); setUploadNote(''); };
  const removeVideo = () => { if (f.video) URL.revokeObjectURL(f.video.url); set({ video: null }); setUploadNote(''); };

  // ── Validation per step ───────────────────────────────────────────────────
  const validate = (s) => {
    if (s === 0) {
      if (!f.company.trim() || !f.name.trim()) return 'Please enter your brand name and contact name.';
      if (!isEmail(f.contactEmail)) return 'Please enter a valid work email.';
      if (!f.platform) return 'Please select your e-commerce platform.';
      if (!isHttpUrl(normalizeUrl(f.websiteUrl))) return 'Please enter a valid website URL, like yourbrand.com';
      const missing = Object.entries(f.socials).find(([, v]) => !v.trim());
      if (missing) return `Please add your ${missing[0]} handle or URL, or deselect it.`;
    }
    if (s === 1) {
      if (f.goals.length === 0) return 'Please select at least one partnership goal.';
      if (!f.productCategory) return 'Please select a product category.';
      if (!f.monthlyRevenue) return 'Please select your estimated monthly revenue.';
      if (f.goals.includes(GOAL_ADS) && f.totalBudget.trim() !== '' && !(Number(f.totalBudget) >= 0)) return 'Please enter a valid budget amount, or leave it blank.';
    }
    if (s === 2) {
      if (!f.ein.trim()) return 'Please enter your Tax ID / EIN.';
      if (!f.countryOfOrigin.trim() || !f.operatingCountry.trim()) return 'Please enter your country of origin and operating country.';
      if (!TERMS.every(t => f[t.key])) return 'Please review and accept all partner terms.';
    }
    return '';
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
    if (step < 2) return next();
    for (let s = 0; s < 3; s++) {
      const msg = validate(s);
      if (msg) { setError(msg); setStep(s); return; }
    }
    setError('');
    setHiddenServerError('');

    const fd = new FormData();
    const firstSocial = Object.values(f.socials)[0] || '';
    const website = normalizeUrl(f.websiteUrl);
    fd.append('partnerCategory', CATEGORY);
    fd.append('name', f.name.trim());
    fd.append('contactEmail', f.contactEmail.trim());
    fd.append('phoneNumber', f.phoneNumber.trim());
    fd.append('ein', f.ein.trim());
    fd.append('company', f.company.trim());
    fd.append('websiteOrSocial', website || firstSocial);
    fd.append('countryOfOrigin', f.countryOfOrigin.trim());
    fd.append('operatingCountry', f.operatingCountry.trim());
    fd.append('tier', canApplyPremium ? f.tier : 'National Associate');
    TERMS.forEach(t => fd.append(t.key, f[t.key]));
    // Existing interest flags keep their old meaning (the old form's advertising / sponsored-placement
    // checkboxes). "Marketplace Listing" (sell your own products) is its own, new flag.
    const wantsAds = f.goals.includes(GOAL_ADS);
    fd.append('wholesaleInterest', f.goals.includes(GOAL_WHOLESALE));
    fd.append('marketplaceListingInterest', f.goals.includes(GOAL_LISTING));
    fd.append('advertisingInterest', wantsAds);
    fd.append('sponsoredDumaInterest', wantsAds);
    fd.append('sponsoredMarketplaceInterest', wantsAds);
    fd.append('totalBudget', wantsAds ? f.totalBudget.trim() : '');
    // New descriptive fields
    fd.append('partnershipGoals', f.goals.join(', '));
    fd.append('ecommercePlatform', f.platform);
    fd.append('websiteUrl', website);
    fd.append('socialChannels', JSON.stringify(f.socials));
    fd.append('productCategory', f.productCategory);
    fd.append('monthlyRevenue', f.monthlyRevenue);
    f.photos.forEach((p, i) => fd.append(`photo_${i}`, p.file));
    if (f.video) fd.append('video', f.video.file);

    onSubmit(fd, { hasPhoto: f.photos.length > 0, hasVideo: !!f.video });
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const Stepper = () => (
    <ol style={{ display: 'flex', gap: '8px', listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
      {STEPS.map((title, i) => {
        const done = i < step, current = i === step;
        return (
          <li key={title} style={{ flex: 1, minWidth: 0 }} aria-current={current ? 'step' : undefined}>
            <button
              type="button" onClick={() => goTo(i)} disabled={i >= step}
              style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'inherit', textAlign: 'left', display: 'block', width: '100%', cursor: done ? 'pointer' : 'default' }}
            >
              <div style={{ height: '4px', borderRadius: '2px', backgroundColor: done || current ? INK : LINE, marginBottom: '8px' }} />
              <div style={{ fontSize: '11px', color: MUTED, fontWeight: 600 }}>STEP {i + 1}</div>
              <div style={{ fontSize: '13px', fontWeight: current ? 700 : 500, color: current ? INK : MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {done ? '✓ ' : ''}{title}
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );

  const stepOne = (
    <>
      <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>Tell us about your brand</h3>
      <p style={{ ...hint, fontSize: '13px' }}>The basics, plus where customers find you online.</p>
      <div style={grid2}>
        <div><label style={label} htmlFor="bp-company">Brand Name *</label>
          <input id="bp-company" style={styles.input} value={f.company} onChange={e => set({ company: e.target.value })} autoComplete="organization" /></div>
        <div><label style={label} htmlFor="bp-name">Contact Name *</label>
          <input id="bp-name" style={styles.input} value={f.name} onChange={e => set({ name: e.target.value })} autoComplete="name" /></div>
        <div><label style={label} htmlFor="bp-email">Work Email *</label>
          <input id="bp-email" type="email" inputMode="email" style={styles.input} value={f.contactEmail} onChange={e => set({ contactEmail: e.target.value })} autoComplete="email" /></div>
        <div><label style={label} htmlFor="bp-phone">Phone Number <span style={{ fontWeight: 400, color: '#888' }}>(optional)</span></label>
          <input id="bp-phone" type="tel" inputMode="tel" style={styles.input} value={f.phoneNumber} onChange={e => set({ phoneNumber: e.target.value })} autoComplete="tel" /></div>
      </div>

      <span style={label}>E-Commerce Platform *</span>
      <div role="radiogroup" aria-label="E-commerce platform" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
        {PLATFORMS.map(p => (
          <button key={p} type="button" role="radio" aria-checked={f.platform === p} style={chip(f.platform === p)} onClick={() => set({ platform: p })}>{p}</button>
        ))}
      </div>
      <label style={label} htmlFor="bp-site">Website URL *</label>
      <input id="bp-site" inputMode="url" autoCapitalize="none" autoComplete="url" placeholder="yourbrand.com" style={styles.input} value={f.websiteUrl} onChange={e => set({ websiteUrl: e.target.value })} onBlur={e => set({ websiteUrl: normalizeUrl(e.target.value) })} />

      <span style={label}>Social Media</span>
      <p style={hint}>Select the channels you're active on.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {SOCIALS.map(({ id }) => {
          const on = id in f.socials;
          return <button key={id} type="button" aria-pressed={on} style={chip(on)} onClick={() => toggleSocial(id)}>{on ? '✓ ' : '+ '}{id}</button>;
        })}
      </div>
      {SOCIALS.filter(s => s.id in f.socials).map(({ id, placeholder }) => (
        <div key={id}>
          <label style={label} htmlFor={`bp-social-${id}`}>{id} *</label>
          <input id={`bp-social-${id}`} style={styles.input} placeholder={placeholder} value={f.socials[id]}
            onChange={e => setF(prev => ({ ...prev, socials: { ...prev.socials, [id]: e.target.value } }))} />
        </div>
      ))}
    </>
  );

  const stepTwo = (
    <>
      <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>Fit & commercial goals</h3>
      <p style={{ ...hint, fontSize: '13px' }}>Help us route you to the right partnership track.</p>
      <span style={label}>Partnership Goals * <span style={{ fontWeight: 400, color: '#888' }}>(select all that apply)</span></span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '6px' }}>
        {GOALS.map(({ id, desc }) => {
          const on = f.goals.includes(id);
          return (
            <button key={id} type="button" aria-pressed={on} onClick={() => toggleGoal(id)}
              style={{ textAlign: 'left', padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                border: `1.5px solid ${on ? INK : LINE}`, backgroundColor: on ? '#f6f6f6' : '#fff', color: INK }}>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{on ? '✓ ' : ''}{id}</div>
              <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.5 }}>{desc}</div>
            </button>
          );
        })}
      </div>
      <div style={grid2}>
        <div><label style={label} htmlFor="bp-cat">Product Category *</label>
          <select id="bp-cat" style={{ ...styles.input, appearance: 'auto', backgroundColor: '#fff' }} value={f.productCategory} onChange={e => set({ productCategory: e.target.value })}>
            <option value="">Select a category</option>
            {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select></div>
        <div><label style={label} htmlFor="bp-rev">Estimated Monthly Revenue *</label>
          <select id="bp-rev" style={{ ...styles.input, appearance: 'auto', backgroundColor: '#fff' }} value={f.monthlyRevenue} onChange={e => set({ monthlyRevenue: e.target.value })}>
            <option value="">Select a range</option>
            {REVENUE_BANDS.map(r => <option key={r} value={r}>{r}</option>)}
          </select></div>
        {f.goals.includes(GOAL_ADS) && (
          <div><label style={label} htmlFor="bp-budget">Advertising Budget (USD) <span style={{ fontWeight: 400, color: '#888' }}>(optional)</span></label>
            <input id="bp-budget" type="number" inputMode="decimal" min="0" placeholder="e.g. 5000" style={styles.input} value={f.totalBudget} onChange={e => set({ totalBudget: e.target.value })} /></div>
        )}
      </div>
    </>
  );

  const allAgreed = TERMS.every(t => f[t.key]);
  const stepThree = (
    <>
      <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>Verification & submit</h3>
      <p style={{ ...hint, fontSize: '13px' }}>Your Tax ID is used only for verification and is never shown publicly.</p>
      <div style={grid2}>
        <div><label style={label} htmlFor="bp-ein">Tax ID / EIN *</label>
          <input id="bp-ein" style={styles.input} placeholder="XX-XXXXXXX" value={f.ein} onChange={e => set({ ein: e.target.value })} autoComplete="off" /></div>
        <div><label style={label} htmlFor="bp-origin">Country of Origin *</label>
          <input id="bp-origin" style={styles.input} value={f.countryOfOrigin} onChange={e => set({ countryOfOrigin: e.target.value })} autoComplete="country-name" /></div>
        <div><label style={label} htmlFor="bp-op">Operating Country *</label>
          <input id="bp-op" style={styles.input} value={f.operatingCountry} onChange={e => set({ operatingCountry: e.target.value })} /></div>
      </div>

      <span style={label}>Catalog Samples <span style={{ fontWeight: 400, color: '#888' }}>(optional)</span></span>
      <div
        role="button" tabIndex={0}
        onClick={() => fileInput.current?.click()}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.current?.click(); } }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        style={{ ...styles.uploadBox, marginTop: '6px', cursor: 'pointer', borderColor: dragging ? INK : '#ddd', backgroundColor: dragging ? '#f0f0f0' : '#fafafa' }}
      >
        <div style={{ fontSize: '22px' }}>⬆</div>
        <div style={{ fontWeight: 600, fontSize: '14px' }}>Drag & drop or tap to upload</div>
        <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Up to 3 product or catalog images and 1 short video</div>
        <input ref={fileInput} type="file" accept="image/*,video/*" multiple hidden onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
      </div>
      {uploadNote && <div role="status" style={{ fontSize: '12px', color: '#a61b1b', marginTop: '8px' }}>{uploadNote}</div>}
      {(f.photos.length > 0 || f.video) && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
          {f.photos.map((p, i) => (
            <div key={p.url} style={{ position: 'relative' }}>
              <img src={p.url} alt={`Upload ${i + 1}`} style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px' }} />
              <button type="button" aria-label={`Remove image ${i + 1}`} onClick={() => removePhoto(i)}
                style={{ position: 'absolute', top: '-6px', right: '-6px', width: '22px', height: '22px', borderRadius: '50%', border: 'none', background: INK, color: '#fff', cursor: 'pointer', fontSize: '12px' }}>×</button>
            </div>
          ))}
          {f.video && (
            <div style={{ position: 'relative' }}>
              <video src={f.video.url} style={{ width: '120px', height: '72px', objectFit: 'cover', borderRadius: '8px' }} muted />
              <button type="button" aria-label="Remove video" onClick={removeVideo}
                style={{ position: 'absolute', top: '-6px', right: '-6px', width: '22px', height: '22px', borderRadius: '50%', border: 'none', background: INK, color: '#fff', cursor: 'pointer', fontSize: '12px' }}>×</button>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '22px' }}>
        <span style={{ ...label, marginTop: 0 }}>Partner Terms *</span>
        <button type="button" onClick={() => set(Object.fromEntries(TERMS.map(t => [t.key, !allAgreed])))}
          style={{ background: 'none', border: 'none', color: INK, textDecoration: 'underline', fontSize: '12px', cursor: 'pointer' }}>
          {allAgreed ? 'Clear all' : 'Accept all'}
        </button>
      </div>
      <div style={{ border: `1px solid ${LINE}`, borderRadius: '12px', overflow: 'hidden', marginTop: '6px' }}>
        {TERMS.map(({ key, title, body }, i) => {
          const open = openTerm === key;
          return (
            <div key={key} style={{ borderTop: i ? `1px solid ${LINE}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px' }}>
                <input id={`bp-term-${key}`} type="checkbox" checked={f[key]} onChange={e => set({ [key]: e.target.checked })} style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                <label htmlFor={`bp-term-${key}`} style={{ flex: 1, fontSize: '14px', cursor: 'pointer' }}>I agree to the <strong>{title}</strong></label>
                <button type="button" aria-expanded={open} aria-controls={`bp-term-body-${key}`} onClick={() => setOpenTerm(open ? null : key)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: MUTED, whiteSpace: 'nowrap', padding: '6px' }}>
                  {open ? 'Hide ▴' : 'Details ▾'}
                </button>
              </div>
              {open && (
                <div id={`bp-term-body-${key}`} style={{ padding: '0 14px 14px 42px', fontSize: '13px', color: '#444', lineHeight: 1.6 }}>{body}</div>
              )}
            </div>
          );
        })}
      </div>

      {canApplyPremium && (
        <>
          <span style={label}>Partner Tier</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['National Associate', 'Premium Partner'].map(t => (
              <button key={t} type="button" role="radio" aria-checked={f.tier === t} style={chip(f.tier === t)} onClick={() => set({ tier: t })}>{t}</button>
            ))}
          </div>
        </>
      )}
    </>
  );

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate style={{ backgroundColor: '#fff', border: `1px solid ${LINE}`, borderRadius: '20px', padding: 'clamp(18px, 4vw, 32px)' }}>
      <div ref={topRef} style={{ scrollMarginTop: '80px' }} />
      <Stepper />
      {!authToken && (
        <div style={{ backgroundColor: '#f6f6f6', border: `1px solid ${LINE}`, borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#444', marginBottom: '16px', lineHeight: 1.5 }}>
          You'll need an account to submit. <Link to="/login" onClick={saveDraft} style={{ color: INK, fontWeight: 600 }}>Log in</Link> or <Link to="/signup" onClick={saveDraft} style={{ color: INK, fontWeight: 600 }}>create one</Link> first. Your answers are kept in this browser tab, except uploads, your Tax ID and accepted terms.
        </div>
      )}
      {(error || shownServerError) && <div role="alert" style={{ backgroundColor: '#fdecec', color: '#a61b1b', border: '1px solid #f5c2c2', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', marginBottom: '12px' }}>{error || shownServerError}</div>}

      {step === 0 && stepOne}
      {step === 1 && stepTwo}
      {step === 2 && stepThree}

      <div style={{ display: 'flex', gap: '10px', marginTop: '28px', flexWrap: 'wrap-reverse', alignItems: 'flex-start' }}>
        {step > 0 && (
          <button type="button" onClick={back}
            style={{ ...styles.authButton, flex: '1 1 120px', backgroundColor: '#fff', color: INK, border: `1.5px solid ${INK}`, padding: '14px' }}>
            ← Back
          </button>
        )}
        {step < 2 ? (
          <button type="submit" style={{ ...styles.authButton, flex: '2 1 200px', padding: '14px' }}>
            Continue →
          </button>
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
            {submitting ? 'Submitting…' : 'Submit Partner Application'}
          </button>
        )}
      </div>
      <p style={{ textAlign: 'center', fontSize: '12px', color: '#999', margin: '12px 0 0' }}>Step {step + 1} of 3</p>
    </form>
  );
};
