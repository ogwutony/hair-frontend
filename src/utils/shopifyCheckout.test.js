import { goToShopifyCheckout } from './shopifyCheckout';

const submitted = () => {
  const form = document.body.querySelector('form');
  const fields = Object.fromEntries([...form.querySelectorAll('input')].map((i) => [i.name, i.value]));
  return { action: form.action, method: form.method, fields };
};

beforeEach(() => {
  document.body.innerHTML = '';
  HTMLFormElement.prototype.requestSubmit = jest.fn();
});

test('one-time single bottles use the cart permalink', () => {
  goToShopifyCheckout([{ variantId: '111', quantity: 2 }]);
  expect(submitted().action).toBe('https://c0bqfe-z2.myshopify.com/cart/111:2');
});

test('a pre-order line goes through /cart/add with its pre-order note', () => {
  goToShopifyCheckout([
    { variantId: '111', quantity: 1 },
    { variantId: '222', quantity: 1, properties: { 'Pre-order': 'Ships Nov 17, 2026' } },
  ]);
  const { action, method, fields } = submitted();
  expect(action).toBe('https://c0bqfe-z2.myshopify.com/cart/add');
  expect(method).toBe('post');
  expect(fields['items[1][id]']).toBe('222');
  expect(fields['items[1][properties][Pre-order]']).toBe('Ships Nov 17, 2026');
  expect(fields['items[0][properties][Pre-order]']).toBeUndefined();
});
