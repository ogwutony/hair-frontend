// src/components/MobileHeader.jsx
// Mobile-only header: promo bar, hamburger menu, logo, account / wishlist / cart, plus the menu and cart drawers.
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

export function MobileHeader({ isLoggedIn, onLogout, unreadMessages, rankTitle }) {
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

  return (
    <>
      <div className="ms-promo">Subscribe and save on every order. Pre-orders ship October 31.</div>
      <header className="ms-header">
        <button type="button" className="ms-ib" aria-label="Open menu" onClick={() => setMenuOpen(true)}>{Icon.menu}</button>
        <Link to="/" className="ms-logo">The Majorities</Link>
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
          {isLoggedIn ? (
            <>
              <button type="button" onClick={() => go('/')}>Home</button>
              <button type="button" onClick={() => go('/recommend')}>Recommend</button>
              <button type="button" onClick={() => go('/partner')}>Partner</button>
              <button type="button" onClick={() => go('/duma')}>The Duma</button>
              <button type="button" onClick={() => go('/perspectives')}>Perspectives</button>
              <button type="button" onClick={() => go('/profile')}>Profile</button>
              <button type="button" onClick={() => go('/messages')}>Messages{unreadMessages > 0 ? ` (${unreadMessages})` : ''}</button>
              <button type="button" onClick={() => { closeAll(); onLogout(); }}>Logout</button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => go('/')}>Shop</button>
              <button type="button" onClick={() => go('/recommend')}>Recommend</button>
              <button type="button" onClick={() => go('/partner')}>Partner</button>
              <button type="button" onClick={() => go('/duma')}>The Duma</button>
              <button type="button" onClick={() => go('/signup')}>Sign Up</button>
              <button type="button" onClick={() => go('/login')}>Login</button>
            </>
          )}
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
