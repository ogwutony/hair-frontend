// src/utils/pixels.js
// Browser-side ad/analytics events for the steps that happen on this site
// (page view, product view, add to cart, checkout started).
// Purchases happen on Shopify checkout and are tracked there by the
// Facebook & Instagram, TikTok and Google & YouTube Shopify apps.

const META_PIXEL_ID = (process.env.REACT_APP_META_PIXEL_ID || '2960067337680276').trim();
const TIKTOK_PIXEL_ID = (process.env.REACT_APP_TIKTOK_PIXEL_ID || 'D9JPSLRC77UCU52DR75G').trim();
const PINTEREST_TAG_ID = (process.env.REACT_APP_PINTEREST_TAG_ID || '2612947123029').trim();
// Snapchat and X load only once their IDs are set as Vercel environment variables.
const SNAP_PIXEL_ID = (process.env.REACT_APP_SNAP_PIXEL_ID || '').trim();
const X_PIXEL_ID = (process.env.REACT_APP_X_PIXEL_ID || '').trim();

let initialized = false;

const safe = (fn) => {
  try { fn(); } catch (e) { /* never let tracking break the page */ }
};

function loadMeta() {
  if (!META_PIXEL_ID || window.fbq) return;
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', META_PIXEL_ID);
}

function loadTikTok() {
  if (!TIKTOK_PIXEL_ID || window.ttq) return;
  /* eslint-disable */
  !function (w, d, t) {
    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
    ttq.load(TIKTOK_PIXEL_ID);
  }(window, document, 'ttq');
  /* eslint-enable */
}

function loadScript(src) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function loadPinterest() {
  if (!PINTEREST_TAG_ID || window.pintrk) return;
  const pintrk = function pintrk(...args) { pintrk.queue.push(args); };
  pintrk.queue = [];
  pintrk.version = '3.0';
  window.pintrk = pintrk;
  loadScript('https://s.pinimg.com/ct/core.js');
  window.pintrk('load', PINTEREST_TAG_ID);
  window.pintrk('page');
}

function loadSnap() {
  if (!SNAP_PIXEL_ID || window.snaptr) return;
  const snaptr = function snaptr(...args) {
    if (snaptr.handleRequest) snaptr.handleRequest(...args);
    else snaptr.queue.push(args);
  };
  snaptr.queue = [];
  window.snaptr = snaptr;
  loadScript('https://sc-static.net/scevent.min.js');
  window.snaptr('init', SNAP_PIXEL_ID);
}

function loadX() {
  if (!X_PIXEL_ID || window.twq) return;
  const twq = function twq(...args) {
    if (twq.exe) twq.exe(...args);
    else twq.queue.push(args);
  };
  twq.version = '1.1';
  twq.queue = [];
  window.twq = twq;
  loadScript('https://static.ads-twitter.com/uwt.js');
  window.twq('config', X_PIXEL_ID);
}

export function initPixels() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  safe(loadMeta);
  safe(loadTikTok);
  safe(loadPinterest);
  safe(loadSnap);
  safe(loadX);
}

const fb = (...args) => safe(() => window.fbq && window.fbq(...args));
const tt = (...args) => safe(() => window.ttq && window.ttq[args[0]](...args.slice(1)));
const ga = (...args) => safe(() => window.gtag && window.gtag(...args));
const pin = (...args) => safe(() => window.pintrk && window.pintrk('track', ...args));
const snap = (...args) => safe(() => window.snaptr && window.snaptr('track', ...args));

// items: [{ id, name, price, quantity }]
const toMeta = (items) => ({
  content_ids: items.map((i) => String(i.id)),
  contents: items.map((i) => ({ id: String(i.id), quantity: i.quantity || 1, item_price: i.price })),
  content_type: 'product',
  currency: 'USD',
  value: Number(items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0).toFixed(2)),
  num_items: items.reduce((n, i) => n + (i.quantity || 1), 0),
});
const toTikTok = (items) => ({
  contents: items.map((i) => ({ content_id: String(i.id), content_name: i.name, quantity: i.quantity || 1, price: i.price })),
  content_type: 'product',
  currency: 'USD',
  value: Number(items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0).toFixed(2)),
});
const toGa = (items) => ({
  currency: 'USD',
  value: Number(items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0).toFixed(2)),
  items: items.map((i) => ({ item_id: String(i.id), item_name: i.name, price: i.price, quantity: i.quantity || 1 })),
});

export function trackPageView() {
  fb('track', 'PageView');
  tt('page');
  pin('pagevisit');
  snap('PAGE_VIEW');
}

export function trackViewContent(item) {
  const items = [{ ...item, quantity: 1 }];
  fb('track', 'ViewContent', toMeta(items));
  tt('track', 'ViewContent', toTikTok(items));
  ga('event', 'view_item', toGa(items));
  snap('VIEW_CONTENT', { item_ids: items.map((i) => String(i.id)), currency: 'USD', price: item.price });
}

export function trackAddToCart(item) {
  const items = [{ ...item, quantity: item.quantity || 1 }];
  fb('track', 'AddToCart', toMeta(items));
  tt('track', 'AddToCart', toTikTok(items));
  ga('event', 'add_to_cart', toGa(items));
  pin('addtocart', { value: item.price * (item.quantity || 1), order_quantity: item.quantity || 1, currency: 'USD' });
  snap('ADD_CART', { item_ids: [String(item.id)], currency: 'USD', price: item.price });
}

export function trackInitiateCheckout(items) {
  if (!items.length) return;
  fb('track', 'InitiateCheckout', toMeta(items));
  tt('track', 'InitiateCheckout', toTikTok(items));
  ga('event', 'begin_checkout', toGa(items));
  snap('START_CHECKOUT', { item_ids: items.map((i) => String(i.id)), currency: 'USD' });
}
