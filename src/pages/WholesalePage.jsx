// src/pages/WholesalePage.jsx
// Wholesale catalog for approved partners. Access is enforced by the backend:
// GET /api/wholesale/products answers 401/403 unless the signed-in user has wholesaleApproved
// (granted when they submit a Brand & Retail Partners application). Products come from the
// Shopify items with product type "Wholesale"; checkout goes to Shopify with a cart link.
import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BACKEND_URL, SHOP_DOMAIN } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';

const page = { maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 120px', fontFamily: 'Inter, sans-serif', color: '#222' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '24px' };
const card = { border: '1px solid #eee', borderRadius: '16px', padding: '16px', background: '#fff', display: 'flex', flexDirection: 'column', gap: '10px' };
const qtyBtn = { width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #ccc', background: '#fff', fontSize: '16px', cursor: 'pointer' };

export function WholesalePage({ authToken }) {
  const { state } = useLocation();
  const [status, setStatus] = useState('loading'); // loading | ready | error | denied
  const [products, setProducts] = useState([]);
  const [shopDomain, setShopDomain] = useState(SHOP_DOMAIN);
  const [errorMsg, setErrorMsg] = useState('');
  const [qty, setQty] = useState({});

  useEffect(() => {
    if (!authToken) { setStatus('denied'); return undefined; }
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/wholesale/products`, {
          headers: { Authorization: `Bearer ${authToken}` },
          signal: controller.signal,
        });
        if (res.status === 401 || res.status === 403) { setStatus('denied'); return; }
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { setErrorMsg(data.error || 'Could not load wholesale products right now.'); setStatus('error'); return; }
        setProducts(Array.isArray(data.products) ? data.products : []);
        if (data.shopDomain) setShopDomain(data.shopDomain);
        setStatus('ready');
      } catch (err) {
        if (err.name === 'AbortError') return;
        setErrorMsg('We couldn’t reach the server. Please check your connection and try again.');
        setStatus('error');
      }
    })();
    return () => controller.abort();
  }, [authToken]);

  const variantIndex = useMemo(() => {
    const map = {};
    products.forEach((p) => p.variants.forEach((v) => { map[v.id] = { ...v, product: p.title }; }));
    return map;
  }, [products]);

  const lines = Object.entries(qty).filter(([, n]) => n > 0).map(([id, n]) => ({ id, n, v: variantIndex[id] })).filter((l) => l.v);
  const unitCount = lines.reduce((s, l) => s + l.n, 0);
  const subtotal = lines.reduce((s, l) => s + l.n * l.v.price, 0);

  // Functional update so rapid clicks on +/- never overwrite each other
  const changeQty = (id, fn) => setQty((prev) => ({ ...prev, [id]: Math.max(0, Math.min(9999, fn(prev[id] || 0) || 0)) }));

  const checkout = () => {
    if (!lines.length) return;
    const permalink = lines.map((l) => `${l.id}:${l.n}`).join(',');
    window.location.href = `https://${shopDomain}/cart/${permalink}?checkout[shipping_address][country]=US`;
  };

  // Not signed in, or signed in without wholesale access -> back to the partner application
  if (status === 'denied') return <Navigate to="/partner" replace />;

  return (
    <div style={page}>
      <Helmet>
        <title>Wholesale | The Majorities</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1 style={{ fontSize: '32px', fontWeight: 700, margin: 0 }}>Wholesale</h1>
      <p style={{ color: '#555', marginTop: '6px' }}>Bulk cases of The Majorities products for resale through your own channels.</p>

      {state?.fromApplication && (
        <div role="status" style={{ background: '#eaf6ee', border: '1px solid #bfe3cb', color: '#1f5c37', padding: '12px 16px', borderRadius: '12px', marginTop: '16px' }}>
          Your Brand &amp; Retail application was received and wholesale access is now unlocked on your account.
        </div>
      )}

      {status === 'loading' && <p style={{ marginTop: '32px', color: '#666' }}>Loading wholesale products…</p>}
      {status === 'error' && <p role="alert" style={{ marginTop: '32px', color: '#b00020' }}>{errorMsg}</p>}
      {status === 'ready' && products.length === 0 && <p style={{ marginTop: '32px', color: '#666' }}>No wholesale products are available right now. Please check back soon.</p>}

      {status === 'ready' && products.length > 0 && (
        <div style={grid}>
          {products.map((p) => (
            <article key={p.id} style={card}>
              {p.image && <img src={p.image.url} alt={p.image.alt} loading="lazy" style={{ width: '100%', height: '180px', objectFit: 'contain', background: '#f6f6f6', borderRadius: '10px' }} />}
              <h2 style={{ fontSize: '17px', margin: 0 }}>{p.title}</h2>
              {p.description && <p style={{ margin: 0, color: '#555', fontSize: '13px', lineHeight: 1.5 }}>{p.description.length > 160 ? `${p.description.slice(0, 157)}…` : p.description}</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                {p.variants.map((v) => (
                  <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <span>
                      {v.title !== 'Default Title' && <strong>{v.title}</strong>}
                      <span style={{ color: '#555', marginLeft: v.title !== 'Default Title' ? '8px' : 0 }}>{formatCurrency(v.price)}</span>
                    </span>
                    {v.availableForSale ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button type="button" style={qtyBtn} aria-label={`Decrease ${p.title} ${v.title}`} onClick={() => changeQty(v.id, (n) => n - 1)}>−</button>
                        <input
                          type="number" min="0" inputMode="numeric" aria-label={`Quantity for ${p.title} ${v.title}`}
                          value={qty[v.id] || 0} onChange={(e) => { const n = parseInt(e.target.value, 10); changeQty(v.id, () => n); }}
                          style={{ width: '52px', textAlign: 'center', padding: '5px 0', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                        <button type="button" style={qtyBtn} aria-label={`Increase ${p.title} ${v.title}`} onClick={() => changeQty(v.id, (n) => n + 1)}>+</button>
                      </span>
                    ) : <span style={{ color: '#999', fontSize: '13px' }}>Sold out</span>}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      {unitCount > 0 && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: '#111', color: '#fff', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', zIndex: 50 }}>
          <span>{unitCount} {unitCount === 1 ? 'item' : 'items'} · <strong>{formatCurrency(subtotal)}</strong></span>
          <button type="button" onClick={checkout} style={{ background: '#fff', color: '#111', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}

export default WholesalePage;
