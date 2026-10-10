// src/pages/MobileShop.jsx
// Mobile storefront: intro, grid/list toggle, bundles first then single bottles, quick view sheet, FAQ.
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SHOP_ITEMS, SHOP_ITEM_BY_ID } from '../utils/shopCatalog';
import { useCart } from '../utils/cart';
import { calculateSetTotals, formatCurrency } from '../utils/helpers';
import { PRODUCT_VARIANT_MAP } from '../utils/constants';
import { Icon } from '../components/MobileHeader';
import '../mobileShop.css';

const FILTERS = {
  all: { label: 'Shop all', match: () => true },
  bundles: { label: 'Bundles', match: (i) => i.category === 'bundles' },
  hair: { label: 'Hair', match: (i) => i.category === 'hair' || i.id === 'bundle-3-hair' },
  face: { label: 'Face', match: (i) => i.category === 'face' || i.id === 'bundle-3-face' },
};

const eye = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>;

function ModeToggle({ mode, onChange }) {
  return (
    <div className="ms-mode" role="group" aria-label="Purchase option">
      <button type="button" aria-pressed={mode === 'one-time'} onClick={() => onChange('one-time')}>One-time</button>
      <button type="button" aria-pressed={mode === 'subscription'} onClick={() => onChange('subscription')}>Subscribe</button>
    </div>
  );
}

function Price({ item, mode }) {
  return mode === 'subscription' ? (
    <div className="ms-price">{formatCurrency(item.pricing.subscription)} <s>{formatCurrency(item.pricing.oneTime)}</s></div>
  ) : (
    <div className="ms-price">{formatCurrency(item.pricing.oneTime)}</div>
  );
}

export function MobileShop({ onBuildSet, setCount = 0 }) {
  const { search } = useLocation();
  const param = new URLSearchParams(search).get('c') || 'all';
  const { addToCart, wishlist, toggleWish, setCartOpen } = useCart();
  const [view, setView] = useState('grid');
  const [modes, setModes] = useState({});
  const [quickId, setQuickId] = useState(null);
  const [toast, setToast] = useState('');
  const faqRef = useRef(null);
  const toastTimer = useRef(null);

  const modeOf = (id) => modes[id] || 'subscription';
  const setMode = (id, m) => setModes((prev) => ({ ...prev, [id]: m }));

  const isWishlist = param === 'wishlist';
  const filter = FILTERS[param] || FILTERS.all;
  const items = isWishlist ? SHOP_ITEMS.filter((i) => wishlist.includes(i.id)) : SHOP_ITEMS.filter(filter.match);
  const showBuildCard = !isWishlist && (param === 'all' || param === 'bundles' || !FILTERS[param]);

  useEffect(() => {
    if (param === 'faq' && faqRef.current) faqRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [param]);

  useEffect(() => {
    if (!quickId) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setQuickId(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [quickId]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const add = (id) => {
    addToCart(id, modeOf(id));
    const short = SHOP_ITEM_BY_ID[id].name.replace('The Majorities ', '');
    setToast(`Added to cart: ${short}`);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  };

  const quick = quickId ? SHOP_ITEM_BY_ID[quickId] : null;
  const title = isWishlist ? 'Wishlist' : filter.label;

  const card = (item) => (
    <article className="ms-card" key={item.id}>
      <div className="ms-media">
        <img src={item.images[0]} alt={item.name} loading="lazy" />
        <span className="ms-tag">{item.tag}</span>
        <button type="button" className="ms-fab ms-heart" aria-label="Save to wishlist" aria-pressed={wishlist.includes(item.id)} onClick={() => toggleWish(item.id)}>{Icon.heart}</button>
        <button type="button" className="ms-fab ms-eye" aria-label={`Quick view: ${item.name}`} onClick={() => setQuickId(item.id)}>{eye}</button>
      </div>
      <div className="ms-info">
        <h3 className="ms-name">{item.name}</h3>
        <div className="ms-price-row">
          <Price item={item} mode={modeOf(item.id)} />
          <span className="ms-free-ship">Free Shipping</span>
        </div>
        <div className="ms-ship">Ships Oct 31</div>
        <ModeToggle mode={modeOf(item.id)} onChange={(m) => setMode(item.id, m)} />
        <button type="button" className="ms-btn ms-add" onClick={() => add(item.id)}>Add to cart</button>
      </div>
    </article>
  );

  const bundles = items.filter((i) => i.category === 'bundles');
  const rest = items.filter((i) => i.category !== 'bundles');

  return (
    <div className="ms-shop">
      <section className="ms-intro">
        <h1>Skin and hair care for every one of us.</h1>
        <p>
          Start with a 3-bottle or 6-bottle bundle, or pick the individual essentials you need.
          Choose auto-delivery to subscribe and save on every order.
        </p>
      </section>

      <div className="ms-toolbar">
        <span>{title} · {items.length} {items.length === 1 ? 'product' : 'products'}</span>
        <div className="ms-views">
          <button type="button" aria-label="Grid view" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
            <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1" y="1" width="6" height="6" /><rect x="9" y="1" width="6" height="6" /><rect x="1" y="9" width="6" height="6" /><rect x="9" y="9" width="6" height="6" /></svg>
          </button>
          <button type="button" aria-label="List view" aria-pressed={view === 'list'} onClick={() => setView('list')}>
            <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1" y="2" width="14" height="2.5" /><rect x="1" y="7" width="14" height="2.5" /><rect x="1" y="12" width="14" height="2.5" /></svg>
          </button>
        </div>
      </div>

      {isWishlist && items.length === 0 ? (
        <p className="ms-empty">Tap the heart on any product to save it here. <Link to="/">Shop all</Link></p>
      ) : (
        <main className={`ms-grid${view === 'list' ? ' list' : ''}`} id="shop">
          {bundles.map(card)}
          {showBuildCard && (
            <article className="ms-card ms-build">
              <button type="button" className="ms-build-inner" onClick={onBuildSet}>
                <span className="ms-build-count">{setCount}/6</span>
                <span className="ms-name">Build your own 6-bottle set</span>
                <span className="ms-muted">Mix any six bottles. From {formatCurrency(calculateSetTotals(Array(6).fill({ name: Object.keys(PRODUCT_VARIANT_MAP)[0] })).subscription)} a month with subscribe.</span>
                <span className="ms-btn">Start building</span>
              </button>
            </article>
          )}
          {rest.map(card)}
        </main>
      )}

      <section className="ms-faq" id="faq" ref={faqRef}>
        <h2>FAQ</h2>
        <details>
          <summary>When will my order ship?</summary>
          <p>All products are on pre-order and ship October 31.</p>
        </details>
        <details>
          <summary>How does subscribe and save work?</summary>
          <p>Choose Subscribe on any product to get it delivered every month at the lower subscribe price.</p>
        </details>
        <details>
          <summary>How big are the bottles?</summary>
          <p>Every bottle is 100ml. The 3-bottle bundles hold three bottles and the 6-bottle bundle holds the full line.</p>
        </details>
        <details>
          <summary>What is your return policy?</summary>
          <p>See our <Link to="/returns">return and shipping policy</Link>.</p>
        </details>
      </section>

      <div className={`ms-scrim${quick ? ' on' : ''}`} onClick={() => setQuickId(null)} />
      <section className={`ms-sheet${quick ? ' on' : ''}`} aria-label="Quick view" aria-hidden={!quick}>
        {quick && (
          <>
            <div className="ms-sheet-top">
              <span className="ms-grab" />
              <button type="button" className="ms-ib" aria-label="Close quick view" onClick={() => setQuickId(null)}>{Icon.close}</button>
            </div>
            <div className="ms-gallery">
              {quick.images.map((src, i) => (
                <img key={src} src={src} alt={`${quick.name}, view ${i + 1} of ${quick.images.length}`} />
              ))}
            </div>
            <h2>{quick.name}</h2>
            <div className="ms-ship">Pre-order · Ships Oct 31</div>
            <div className="ms-desc">{quick.summary ? <p>{quick.summary}</p> : quick.desc}</div>
            {quick.includes && <p className="ms-includes"><strong>Includes:</strong> {quick.includes}</p>}
            <button type="button" className="ms-opt" aria-pressed={modeOf(quick.id) === 'subscription'} onClick={() => setMode(quick.id, 'subscription')}>
              <span>Subscribe and save<small>Delivered every month</small></span>
              <strong>{formatCurrency(quick.pricing.subscription)}</strong>
            </button>
            <button type="button" className="ms-opt" aria-pressed={modeOf(quick.id) === 'one-time'} onClick={() => setMode(quick.id, 'one-time')}>
              <span>One-time purchase</span>
              <strong>{formatCurrency(quick.pricing.oneTime)}</strong>
            </button>
            <button type="button" className="ms-btn" onClick={() => { add(quick.id); setQuickId(null); }}>Add to cart</button>
          </>
        )}
      </section>

      <div className={`ms-toast${toast ? ' on' : ''}`} role="status">
        {toast}
        {toast && <button type="button" onClick={() => setCartOpen(true)}>View cart</button>}
      </div>
    </div>
  );
}
