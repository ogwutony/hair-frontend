// api/_lib/site.js — shared helpers for the prerender (api/render.js) and
// sitemap (api/sitemap.js) functions. Files in api/_lib are not deployed as
// endpoints of their own.
const fs = require('fs');
const path = require('path');

const SITE = 'https://themajorities.com';
const BACKEND_URL = (process.env.BACKEND_URL || process.env.REACT_APP_BACKEND_URL || 'https://hair-backend-1.onrender.com').replace(/\/+$/, '');
const API_TIMEOUT_MS = Number(process.env.PRERENDER_API_TIMEOUT_MS || 3500);
const DUMA_CACHE_MS = 5 * 60 * 1000;

const escapeHtml = (value) => String(value == null ? '' : value)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const clip = (text, max) => {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
};

// ---- Build files (app shell + prerendered fragments) -------------------------
// Bundled with the function via vercel.json `includeFiles`; if that isn't
// available, fetch the same files from this deployment's static output.
const fileCache = new Map();
async function readBuildFile(rel, host) {
  if (fileCache.has(rel)) return fileCache.get(rel);
  let text = null;
  for (const base of [path.join(process.cwd(), 'build'), path.join(__dirname, '..', '..', 'build')]) {
    try { text = fs.readFileSync(path.join(base, rel), 'utf8'); break; } catch { /* try next */ }
  }
  if (text == null && host) {
    try {
      const proto = /^(localhost|127\.)/.test(host) ? 'http' : 'https';
      const r = await fetch(`${proto}://${host}/${rel}`, { signal: AbortSignal.timeout(3000) });
      if (r.ok) text = await r.text();
    } catch { /* fall through */ }
  }
  if (text != null) fileCache.set(rel, text);
  return text;
}

// ---- Duma data from the backend ---------------------------------------------
let dumaCache = { at: 0, items: null };
async function fetchDuma() {
  if (dumaCache.items && Date.now() - dumaCache.at < DUMA_CACHE_MS) return dumaCache.items;
  try {
    const r = await fetch(`${BACKEND_URL}/api/duma`, { signal: AbortSignal.timeout(API_TIMEOUT_MS), headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(`status ${r.status}`);
    const data = await r.json();
    if (!Array.isArray(data)) throw new Error('unexpected payload');
    dumaCache = { at: Date.now(), items: data };
    return data;
  } catch (err) {
    console.warn('[prerender] duma fetch failed:', err.message);
    return dumaCache.items; // stale copy if we have one, otherwise null
  }
}

const itemId = (item) => String((item && (item._id || item.id)) || '');
const isPublicId = (id) => /^[a-f0-9]{24}$/i.test(id);
const isHidden = (item) => Boolean(item.hidden || item.isHidden || item.removed || ['hidden', 'removed', 'rejected'].includes(String(item.status || '').toLowerCase()));
const isPerspective = (item) => item.section === 'Cultural' || item.category === 'Culture' || item.type === 'Culture' || item.type === 'Video';
const isRecommendation = (item) => item.type === 'Product Recommendation' || item.type === 'Recommendation';

const publicPerspectives = (items) => (items || []).filter(i => isPerspective(i) && !isHidden(i) && isPublicId(itemId(i)));
const publicRecommendations = (items) => (items || []).filter(i => isRecommendation(i) && !isHidden(i));

// Public author label — never the email address itself
const authorName = (item) => {
  if (item.submitterDisplayName) return item.submitterDisplayName;
  const e = String(item.submittedBy || '');
  return e.includes('@') ? e.split('@')[0] : (e || 'A community member');
};

const itemDate = (item) => {
  const d = new Date(item.updatedAt || item.createdAt || 0);
  return Number.isNaN(d.getTime()) || d.getTime() === 0 ? null : d;
};

module.exports = {
  SITE, BACKEND_URL, escapeHtml, clip, readBuildFile, fetchDuma, itemId, isPublicId,
  publicPerspectives, publicRecommendations, authorName, itemDate,
};
