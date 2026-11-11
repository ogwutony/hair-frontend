// src/utils/cart.js
// Shop cart + wishlist shared by the mobile header and the mobile shop.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SHOP_ITEM_BY_ID } from './shopCatalog';
import { trackEvent } from '../components/AdMonetization';
import { trackAddToCart, trackInitiateCheckout } from './pixels';
import { goToShopifyCheckout } from './shopifyCheckout';

const priceOf = (item, mode) => (mode === 'subscription' ? item.pricing.subscription : item.pricing.oneTime);

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
    if (item) trackAddToCart({ id: item.variantId, name: item.name, price: priceOf(item, mode), quantity: 1 });
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
    return sum + priceOf(item, l.mode) * l.qty;
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

  trackInitiateCheckout(lines.map((l) => {
    const item = SHOP_ITEM_BY_ID[l.id];
    return { id: item.variantId, name: item.name, price: priceOf(item, l.mode), quantity: l.qty };
  }));

  goToShopifyCheckout(lines.map((l) => {
    const item = SHOP_ITEM_BY_ID[l.id];
    return {
      variantId: item.variantId,
      quantity: l.qty,
      sellingPlanId: l.mode === 'subscription' ? item.sellingPlanId : undefined,
    };
  }));
}
