// src/utils/cart.js
// Shop cart + wishlist shared by the mobile header and the mobile shop.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SHOP_DOMAIN } from './constants';
import { SHOP_ITEM_BY_ID } from './shopCatalog';
import { trackEvent } from '../components/AdMonetization';

const CART_KEY = 'shopCart_v1';
const WISH_KEY = 'shopWishlist_v1';

const readJSON = (key, fallback) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null');
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};
const writeJSON = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // Lines look like { id, mode: 'one-time' | 'subscription', qty }
  const [lines, setLines] = useState(() =>
    readJSON(CART_KEY, []).filter((l) => SHOP_ITEM_BY_ID[l.id] && l.qty > 0)
  );
  const [wishlist, setWishlist] = useState(() => readJSON(WISH_KEY, []).filter((id) => SHOP_ITEM_BY_ID[id]));
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => writeJSON(CART_KEY, lines), [lines]);
  useEffect(() => writeJSON(WISH_KEY, wishlist), [wishlist]);

  const addToCart = useCallback((id, mode) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.id === id && l.mode === mode);
      if (i === -1) return [...prev, { id, mode, qty: 1 }];
      return prev.map((l, k) => (k === i ? { ...l, qty: l.qty + 1 } : l));
    });
    const item = SHOP_ITEM_BY_ID[id];
    trackEvent('add_to_cart', { placement: 'mobile_shop', item: item?.name, purchaseType: mode });
  }, []);

  const changeQty = useCallback((id, mode, delta) => {
    setLines((prev) =>
      prev
        .map((l) => (l.id === id && l.mode === mode ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0)
    );
  }, []);

  const toggleWish = useCallback((id) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((sum, l) => {
    const item = SHOP_ITEM_BY_ID[l.id];
    const price = l.mode === 'subscription' ? item.pricing.subscription : item.pricing.oneTime;
    return sum + price * l.qty;
  }, 0);

  const value = useMemo(
    () => ({ lines, count, subtotal, addToCart, changeQty, wishlist, toggleWish, cartOpen, setCartOpen }),
    [lines, count, subtotal, addToCart, changeQty, wishlist, toggleWish, cartOpen]
  );
  return React.createElement(CartContext.Provider, { value }, children);
}

export const useCart = () => useContext(CartContext);

// Sends the cart to Shopify checkout.
// One-time only: the cart permalink the site already uses.
// With subscriptions: a form post to /cart/add, which accepts a selling plan per line.
export function checkoutCart(lines, subtotal) {
  if (!lines.length) return;
  trackEvent('checkout_started', {
    placement: 'mobile_shop',
    itemCount: lines.reduce((n, l) => n + l.qty, 0),
    checkoutValue: subtotal,
    purchaseType: lines.some((l) => l.mode === 'subscription') ? 'mixed_or_subscription' : 'one_time',
  });

  if (lines.every((l) => l.mode === 'one-time')) {
    const permalink = lines.map((l) => `${SHOP_ITEM_BY_ID[l.id].variantId}:${l.qty}`).join(',');
    window.location.href = `https://${SHOP_DOMAIN}/cart/${permalink}?checkout[shipping_address][country]=US`;
    return;
  }

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = `https://${SHOP_DOMAIN}/cart/add`;
  const field = (name, val) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(val);
    form.appendChild(input);
  };
  lines.forEach((l, i) => {
    const item = SHOP_ITEM_BY_ID[l.id];
    field(`items[${i}][id]`, item.variantId);
    field(`items[${i}][quantity]`, l.qty);
    if (l.mode === 'subscription') field(`items[${i}][selling_plan]`, item.sellingPlanId);
  });
  field('return_to', '/checkout');
  document.body.appendChild(form);
  form.submit();
}
