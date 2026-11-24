import { BACKEND_URL } from './constants';

const FLOW_KEY = 'shopifySignInFlow';
export const LOGOUT_KEY = 'shopifyLogoutUrl';
const base64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const random = () => base64url(crypto.getRandomValues(new Uint8Array(32)));

export function getShopifyConfig() {
  return fetch(`${BACKEND_URL}/api/auth/shopify/config`)
    .then(response => response.ok ? response.json() : { enabled: false })
    .catch(() => ({ enabled: false }));
}

// Only same-site paths are accepted as a place to return to after sign-in.
export const safeReturnPath = (path) => (typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/auth/') ? path : '');

export async function startShopifySignIn(config, returnTo = '') {
  if (!config.enabled || new URL(config.redirectUri).origin !== window.location.origin) {
    throw new Error('Shopify sign-in is not configured for this site.');
  }
  const verifier = random();
  const state = random();
  const challenge = base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
  sessionStorage.setItem(FLOW_KEY, JSON.stringify({ state, verifier, created: Date.now(), returnTo: safeReturnPath(returnTo) }));
  const url = new URL(config.authorizationEndpoint);
  url.search = new URLSearchParams({ client_id: config.clientId, response_type: 'code',
    redirect_uri: config.redirectUri, scope: 'openid email customer-account-api:full',
    state, code_challenge: challenge, code_challenge_method: 'S256' }).toString();
  window.location.assign(url.href);
}

export async function finishShopifySignIn(search) {
  const params = new URLSearchParams(search);
  const flow = JSON.parse(sessionStorage.getItem(FLOW_KEY) || 'null');
  sessionStorage.removeItem(FLOW_KEY);
  if (params.get('error') || !flow || !flow.state || params.get('state') !== flow.state ||
      !params.get('code') || !Number.isFinite(flow.created) || Date.now() - flow.created > 10 * 60 * 1000 || Date.now() < flow.created) {
    throw new Error('Your sign-in session expired. Please start again.');
  }
  const response = await fetch(`${BACKEND_URL}/api/auth/shopify/exchange`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: params.get('code'), verifier: flow.verifier }),
  });
  const data = await response.json();
  if (!response.ok || !data.token || !data.email) throw new Error(data.error || 'Unable to sign in.');
  // Only a logout endpoint for the configured Shopify shop is accepted.
  const logout = new URL(data.logoutUrl);
  if (logout.origin === 'https://shopify.com' && logout.pathname === '/authentication/77673398450/logout') {
    localStorage.setItem(LOGOUT_KEY, logout.href);
  }
  return { ...data, returnTo: safeReturnPath(flow.returnTo) };
}

// Signs a member into the store (themajorities.com) too. The store shares the Shopify login, so
// its sign-in page returns straight away when the member is already signed in to Shopify.
// Done once per tab; after that store links go straight to the page.
const STORE_URL = 'https://themajorities.com';
const STORE_LINKED_KEY = 'storeSignedIn';
export function storeUrl(path, isLoggedIn) {
  const target = new URL(path, STORE_URL);
  let linked = false;
  try { linked = sessionStorage.getItem(STORE_LINKED_KEY) === '1'; } catch { linked = true; }
  if (!isLoggedIn || linked) return target.href;
  try { sessionStorage.setItem(STORE_LINKED_KEY, '1'); } catch { /* private mode */ }
  return `${STORE_URL}/account/login?return_url=${encodeURIComponent(target.pathname + target.search)}`;
}
export function forgetStoreSignIn() {
  try { sessionStorage.removeItem(STORE_LINKED_KEY); } catch { /* private mode */ }
}
