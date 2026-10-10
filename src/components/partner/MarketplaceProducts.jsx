// src/components/partner/MarketplaceProducts.jsx
// Marketplace Access, step 2: import products from a Shopify store and/or add them by hand.
import React, { useState } from 'react';
import { styles } from '../../utils/styles';
import { BACKEND_URL } from '../../utils/constants';
import { INK, LINE, MUTED, ui, TextInput, TextArea, SelectInput, MediaDrop } from './PartnerWizard';

export const PRODUCT_CATEGORIES = [
  { group: 'Hair', items: ['Shampoo', 'Conditioner', 'Leave-In Conditioner', 'Deep Conditioner / Hair Mask', 'Hair Oil & Serum', 'Styling Cream, Gel & Edge Control', 'Scalp Care', 'Hair Growth', 'Hair Color', 'Wigs, Extensions & Braiding Hair', 'Hair Tools & Accessories'] },
  { group: 'Skin', items: ['Cleanser', 'Face Scrub & Exfoliant', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Face Mask', 'Eye Care', 'Acne & Dark Spot Care'] },
  { group: 'Body', items: ['Body Wash & Bar Soap', 'Body Lotion', 'Body Butter & Oil', 'Deodorant', 'Fragrance', 'Hand & Foot Care', 'Bath Soak & Salts'] },
  { group: "Men's Grooming", items: ['Beard Oil & Balm', 'Shave Cream', 'Aftershave', 'Razor Bump Care', 'Shaving Tools'] },
  { group: 'Makeup & Nails', items: ['Complexion (Foundation, Concealer)', 'Lip Care & Color', 'Eye Makeup', 'Nail Care & Polish'] },
  { group: 'More', items: ['Oral Care', 'Baby & Kids', 'Feminine Care', 'Sets & Bundles', 'Other'] },
];
const MAX_PRODUCT_PHOTOS = 16; // the server accepts 16 files per application
const SIZE_HINT ='e.g. 8 oz, 100 ml, 2-pack';
const emptyProduct = () => ({ key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: '', category: '', size: '', price: '', subscriptionPrice: '', description: '', ingredients: '', photos: [] });

export const validateProducts = (f) => {
  if (!f.shopifySelected.length && !f.products.length) return 'Please import products from Shopify or add at least one product.';
  for (let i = 0; i < f.products.length; i++) {
    const p = f.products[i];
    const n = `Product ${i + 1}`;
    if (!p.name.trim()) return `${n}: please add a product name.`;
    if (!p.category) return `${p.name}: please choose a category.`;
    if (!(Number(p.price) > 0)) return `${p.name}: please add a retail price.`;
    if (p.subscriptionPrice !== '' && !(Number(p.subscriptionPrice) > 0)) return `${p.name}: subscription price must be a number, or leave it blank.`;
    if (!p.description.trim()) return `${p.name}: please add a short description.`;
    if (!p.ingredients.trim()) return `${p.name}: please list the key ingredients.`;
  }
  const photoCount = f.products.reduce((n, p) => n + p.photos.length, 0);
  if (photoCount > MAX_PRODUCT_PHOTOS) return `You can attach up to ${MAX_PRODUCT_PHOTOS} product photos in total (you have ${photoCount}). Remove a few, and we'll collect the rest after approval.`;
  return '';
};

export const appendProducts = (fd, f) => {
  const imported = f.shopifyCatalog.filter(p => f.shopifySelected.includes(p.id))
    .map(({ id, title, handle, productType, price, compareAtPrice, image, vendor, variantCount }) => ({ id, title, handle, productType, price, compareAtPrice, image, vendor, variantCount }));
  const manual = f.products.map(({ name, category, size, price, subscriptionPrice, description, ingredients }) => ({ name, category, size, price, subscriptionPrice, description, ingredients }));
  fd.append('products', JSON.stringify(manual));
  if (imported.length) {
    fd.append('shopifyStore', f.shopifyStore);
    fd.append('shopifyProducts', JSON.stringify(imported));
    fd.append('shopifySyncRequested', f.shopifySync);
  }
  // Summary fields the review team already uses
  const types = [...new Set([...manual.map(p => p.category), ...imported.map(p => p.productType).filter(Boolean)])];
  fd.append('productTypes', types.join(', '));
  if (manual[0]) {
    fd.append('standardUnitPrice', manual[0].price);
    fd.append('promotionalUnitPrice', manual[0].subscriptionPrice);
  }
  f.products.forEach((p, i) => p.photos.forEach((ph, j) => fd.append(`product_photo_${i}_${j}`, ph.file)));
};

const ShopifyImport = ({ f, set }) => {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('');

  const load = async () => {
    if (!f.shopifyStore.trim()) { setErr('Enter your store address first.'); return; }
    setErr(''); setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/partner/shopify-products?store=${encodeURIComponent(f.shopifyStore.trim())}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(data.error || "We couldn't import products. Please try again."); return; }
      if (!data.products?.length) { setErr('No published products were found in that store.'); return; }
      set({ shopifyStore: data.store, shopifyCatalog: data.products, shopifySelected: data.products.map(p => p.id) });
    } catch (e) {
      setErr("We couldn't reach the server. Please check your connection and try again.");
    } finally { setLoading(false); }
  };

  const catalog = f.shopifyCatalog;
  const shown = filter ? catalog.filter(p => `${p.title} ${p.productType}`.toLowerCase().includes(filter.toLowerCase())) : catalog;
  const allOn = catalog.length > 0 && f.shopifySelected.length === catalog.length;
  const toggle = (id) => set(prev => ({ shopifySelected: prev.shopifySelected.includes(id) ? prev.shopifySelected.filter(x => x !== id) : [...prev.shopifySelected, id] }));

  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: '14px', padding: '16px', backgroundColor: '#fafafa' }}>
      <div style={{ fontWeight: 700, fontSize: '15px' }}>Import from Shopify</div>
      <p style={{ ...ui.hint, margin: '4px 0 8px' }}>Enter your store address and we'll pull in your published products. Pick the ones you want to sell here.</p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input aria-label="Shopify store address" style={{ ...styles.input, flex: '1 1 220px', margin: 0, backgroundColor: '#fff' }} placeholder="yourstore.myshopify.com or yourstore.com"
          autoCapitalize="none" inputMode="url" value={f.shopifyStore}
          onChange={e => set({ shopifyStore: e.target.value })}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); load(); } }} />
        <button type="button" onClick={load} disabled={loading}
          style={{ ...styles.authButton, width: 'auto', flex: '0 0 auto', padding: '12px 20px', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Importing…' : catalog.length ? 'Refresh' : 'Import Products'}
        </button>
      </div>
      {err && <div role="alert" style={{ fontSize: '12px', color: '#a61b1b', marginTop: '8px' }}>{err}</div>}

      {catalog.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
            <strong style={{ fontSize: '13px' }}>{f.shopifySelected.length} of {catalog.length} selected</strong>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {catalog.length > 8 && <input aria-label="Filter products" placeholder="Filter…" value={filter} onChange={e => setFilter(e.target.value)} style={{ ...styles.input, margin: 0, padding: '6px 10px', width: '140px', backgroundColor: '#fff' }} />}
              <button type="button" onClick={() => set({ shopifySelected: allOn ? [] : catalog.map(p => p.id) })}
                style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px', color: INK }}>
                {allOn ? 'Clear all' : 'Select all'}
              </button>
            </div>
          </div>
          <div style={{ maxHeight: '320px', overflowY: 'auto', marginTop: '8px', border: `1px solid ${LINE}`, borderRadius: '10px', backgroundColor: '#fff' }}>
            {shown.map((p, i) => {
              const on = f.shopifySelected.includes(p.id);
              return (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderTop: i ? `1px solid ${LINE}` : 'none', cursor: 'pointer' }}>
                  <input type="checkbox" checked={on} onChange={() => toggle(p.id)} style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                  {p.image ? <img src={p.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                    : <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: '#eee', flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                    <div style={{ fontSize: '12px', color: MUTED }}>{[p.productType, p.variantCount > 1 ? `${p.variantCount} variants` : ''].filter(Boolean).join(' · ')}</div>
                  </div>
                  {p.price && <div style={{ fontSize: '13px', fontWeight: 600 }}>${p.price}</div>}
                </label>
              );
            })}
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', marginTop: '12px', cursor: 'pointer' }}>
            <input type="checkbox" checked={f.shopifySync} onChange={e => set({ shopifySync: e.target.checked })} style={{ width: '18px', height: '18px', marginTop: '1px' }} />
            <span>Keep my listings in sync with Shopify (prices, stock and new products). Our team sets this up after approval.</span>
          </label>
        </>
      )}
    </div>
  );
};

const ProductCard = ({ index, p, onChange, onRemove }) => {
  const up = (patch) => onChange({ ...p, ...patch });
  const id = `mk-p${index}`;
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: '14px', padding: '16px', marginTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '15px' }}>{p.name.trim() || `Product ${index + 1}`}</strong>
        <button type="button" onClick={onRemove} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}>Remove</button>
      </div>
      <div style={ui.grid2}>
        <TextInput id={`${id}-name`} label="Product Name" required value={p.name} onChange={v => up({ name: v })} />
        <SelectInput id={`${id}-cat`} label="Category" required value={p.category} onChange={v => up({ category: v })} options={PRODUCT_CATEGORIES} placeholder="Choose a category" />
        <TextInput id={`${id}-size`} label="Size" optional placeholder={SIZE_HINT} value={p.size} onChange={v => up({ size: v })} />
        <TextInput id={`${id}-price`} label="Retail Price (USD)" required type="number" inputMode="decimal" min="0" step="0.01" placeholder="e.g. 18.00" value={p.price} onChange={v => up({ price: v })} />
        <TextInput id={`${id}-sub`} label="Subscription Price (USD)" optional type="number" inputMode="decimal" min="0" step="0.01" placeholder="e.g. 15.00" value={p.subscriptionPrice} onChange={v => up({ subscriptionPrice: v })} />
      </div>
      <TextArea id={`${id}-desc`} label="Description" required rows={2} placeholder="What it does and who it's for." value={p.description} onChange={v => up({ description: v })} />
      <TextArea id={`${id}-ing`} label="Key Ingredients" required rows={2} placeholder="e.g. Shea butter, jojoba oil, aloe vera" value={p.ingredients} onChange={v => up({ ingredients: v })} />
      <MediaDrop label="Product Photos" compact allowVideo={false} photos={p.photos} onChange={({ photos }) => up({ photos })} />
    </div>
  );
};

export const MarketplaceProductsStep = ({ f, set }) => {
  const setProduct = (i, p) => set(prev => ({ products: prev.products.map((x, idx) => (idx === i ? p : x)) }));
  const remove = (i) => set(prev => {
    prev.products[i].photos.forEach(ph => URL.revokeObjectURL(ph.url));
    return { products: prev.products.filter((_, idx) => idx !== i) };
  });
  return (
    <>
      <ShopifyImport f={f} set={set} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 4px', color: MUTED, fontSize: '12px' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: LINE }} />{f.shopifyCatalog.length ? 'AND / OR' : 'OR'}<div style={{ flex: 1, height: '1px', backgroundColor: LINE }} />
      </div>
      <div style={{ fontWeight: 700, fontSize: '15px', marginTop: '8px' }}>Add products manually</div>
      <p style={{ ...ui.hint, margin: '4px 0 0' }}>Hair, skin, body, grooming, makeup and more.</p>
      {f.products.map((p, i) => <ProductCard key={p.key} index={i} p={p} onChange={np => setProduct(i, np)} onRemove={() => remove(i)} />)}
      <button type="button" onClick={() => set(prev => ({ products: [...prev.products, emptyProduct()] }))}
        style={{ ...styles.authButton, marginTop: '12px', backgroundColor: '#fff', color: INK, border: `1.5px dashed ${INK}`, padding: '12px' }}>
        + Add {f.products.length ? 'another' : 'a'} product
      </button>
    </>
  );
};
