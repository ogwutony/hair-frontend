// src/components/MobileHeader.jsx
// Site header (mobile and desktop): promo bar, hamburger menu, logo, account / wishlist / cart, plus the menu and cart drawers.
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, checkoutCart } from '../utils/cart';
import { SHOP_ITEM_BY_ID } from '../utils/shopCatalog';
import { formatCurrency } from '../utils/helpers';
import { RankBadge } from './RankBadge';
import '../mobileShop.css';

const Icon = {
  menu: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" /></svg>,
  close: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>,
  user: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>,
  heart: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>,
  bag: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>,
};
export { Icon };

// Messages that rotate in the black promo bar at the top of every page.
const PROMO_MESSAGES = [
  'Subscribe & Save Every Time | Pre-Orders Ship Oct 31, 2026',
  'Free Shipping on All Retail Orders',
  'Build Your Custom 6-Pack & Save',
];
const PROMO_INTERVAL_MS = 4000;

function PromoBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % PROMO_MESSAGES.length);
    }, PROMO_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  // All messages share one grid cell, so the bar is always as tall as the longest
  // message (no layout jump when one wraps on a phone) and only the active one shows.
  return (
    <div className="ms-promo">
      <div className="ms-promo-track">
        {PROMO_MESSAGES.map((msg, i) => (
          <span key={msg} className={`ms-promo-msg${i === index ? ' active' : ''}`} aria-hidden={i !== index}>{msg}</span>
        ))}
      </div>
    </div>
  );
}

export function MobileHeader({ isLoggedIn, onLogout, unreadMessages, rankTitle, wholesaleApproved = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lines, count, subtotal, changeQty, wishlist, cartOpen, setCartOpen } = useCart();
  const navigate = useNavigate();
  const anyOpen = menuOpen || cartOpen;

  useEffect(() => {
    if (!anyOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { setMenuOpen(false); setCartOpen(false); } };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; };
  }, [anyOpen, setCartOpen]);

  const closeAll = () => { setMenuOpen(false); setCartOpen(false); };
  const go = (to) => { closeAll(); navigate(to); };
  const logout = () => { closeAll(); onLogout(); };

  // Same items in the mobile drawer and the desktop nav bar
  const navItems = isLoggedIn
    ? [
        ['Home', () => go('/')],
        ['Recommend', () => go('/recommend')],
        ['Partner', () => go('/partner')],
        ...(wholesaleApproved ? [['Wholesale', () => go('/wholesale')]] : []),
        ['The Duma', () => go('/duma')],
        ['Perspectives', () => go('/perspectives')],
        ['Profile', () => go('/profile')],
        [`Messages${unreadMessages > 0 ? ` (${unreadMessages})` : ''}`, () => go('/messages')],
        ['Logout', logout],
      ]
    : [
        ['Shop', () => go('/')],
        ['Recommend', () => go('/recommend')],
        ['Partner', () => go('/partner')],
        ['The Duma', () => go('/duma')],
        ['Sign Up', () => go('/signup')],
        ['Login', () => go('/login')],
      ];

  return (
    <>
      <PromoBar />
      <header className="ms-header">
        <button type="button" className="ms-ib" aria-label="Open menu" onClick={() => setMenuOpen(true)}>{Icon.menu}</button>
        <Link to="/" className="ms-logo">The Majorities</Link>
        <nav className="ms-nav" aria-label="Main">
          {isLoggedIn && rankTitle && <RankBadge rankTitle={rankTitle} />}
          {navItems.map(([label, action]) => (
            <button type="button" key={label} onClick={action}>{label}</button>
          ))}
        </nav>
        <div className="ms-icons">
          <Link to={isLoggedIn ? '/profile' : '/login'} className="ms-ib" aria-label="Account">{Icon.user}</Link>
          <Link to="/?c=wishlist" className="ms-ib" aria-label="Wishlist">
            {Icon.heart}
            {wishlist.length > 0 && <span className="ms-count">{wishlist.length}</span>}
          </Link>
          <button type="button" className="ms-ib" aria-label={`Cart, ${count} items`} onClick={() => setCartOpen(true)}>
            {Icon.bag}
            <span className="ms-count">{count}</span>
          </button>
        </div>
      </header>

      <div className={`ms-scrim${anyOpen ? ' on' : ''}`} onClick={closeAll} />

      <aside className={`ms-drawer${menuOpen ? ' on' : ''}`} aria-label="Menu" aria-hidden={!menuOpen}>
        <button type="button" className="ms-ib ms-close" aria-label="Close menu" onClick={closeAll}>{Icon.close}</button>
        {isLoggedIn && rankTitle && <div className="ms-rank"><RankBadge rankTitle={rankTitle} /></div>}
        <nav className="ms-menu">
          {navItems.map(([label, action]) => (
            <button type="button" key={label} onClick={action}>{label}</button>
          ))}
        </nav>
      </aside>

      <aside className={`ms-cart${cartOpen ? ' on' : ''}`} aria-label="Cart" aria-hidden={!cartOpen}>
        <div className="ms-cart-head">
          <h2>Your cart</h2>
          <button type="button" className="ms-ib" aria-label="Close cart" onClick={closeAll}>{Icon.close}</button>
        </div>
        {lines.length === 0 ? (
          <p className="ms-muted">Your cart is empty. Start with a bundle or pick single bottles.</p>
        ) : (
          <>
            <ul className="ms-lines">
              {lines.map((l) => {
                const item = SHOP_ITEM_BY_ID[l.id];
                const price = l.mode === 'subscription' ? item.pricing.subscription : item.pricing.oneTime;
                return (
                  <li key={`${l.id}-${l.mode}`}>
                    <img src={item.images[0]} alt="" />
                    <div className="ms-line-info">
                      <div className="ms-line-name">{item.name}</div>
                      <div className="ms-muted">{l.mode === 'subscription' ? 'Subscribe · delivered every month' : 'One-time'} · {formatCurrency(price)}</div>
                      <div className="ms-qty">
                        <button type="button" aria-label="Remove one" onClick={() => changeQty(l.id, l.mode, -1)}>−</button>
                        <span>{l.qty}</span>
                        <button type="button" aria-label="Add one" onClick={() => changeQty(l.id, l.mode, 1)}>+</button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="ms-subtotal"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
            <p className="ms-muted">Pre-orders ship October 31. Shipping and taxes are calculated at checkout.</p>
            <button type="button" className="ms-btn" onClick={() => checkoutCart(lines, subtotal)}>Checkout</button>
          </>
        )}
      </aside>
    </>
  );
}
