import { finishShopifySignIn, LOGOUT_KEY } from './shopifyAuth';

beforeEach(() => { sessionStorage.clear(); global.fetch = jest.fn(); });
const saveFlow = (changes = {}) => sessionStorage.setItem('shopifySignInFlow', JSON.stringify({ state: 'expected-state', verifier: 'x'.repeat(43), created: Date.now(), ...changes }));

test.each([
  ['wrong state', {}, '?code=code&state=attacker-state'],
  ['expired flow', { created: Date.now() - 700000 }, '?code=code&state=expected-state'],
  ['missing timestamp', { created: null }, '?code=code&state=expected-state'],
  ['authorization denied', {}, '?error=access_denied&state=expected-state'],
])('rejects %s without exchanging a code', async (_, changes, query) => {
  saveFlow(changes);
  await expect(finishShopifySignIn(query)).rejects.toThrow();
  expect(fetch).not.toHaveBeenCalled();
  expect(sessionStorage.getItem('shopifySignInFlow')).toBeNull();
});

test('consumes state once and sends only code and PKCE verifier to the backend', async () => {
  saveFlow();
  fetch.mockResolvedValue({ ok: true, json: async () => ({ token: 'community-token', email: 'member@example.com', logoutUrl: 'https://shopify.com/authentication/77673398450/logout?test=1' }) });
  await finishShopifySignIn('?code=one-use-code&state=expected-state');
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ code: 'one-use-code', verifier: 'x'.repeat(43) });
  expect(sessionStorage.getItem(LOGOUT_KEY)).toContain('https://shopify.com/');
  await expect(finishShopifySignIn('?code=one-use-code&state=expected-state')).rejects.toThrow();
  expect(fetch).toHaveBeenCalledTimes(1);
});
