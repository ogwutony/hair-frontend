// src/utils/shopifyCheckout.js
// Sends shoppers to Shopify checkout with a real form submission, so GA4's
// cross-domain linker can tag the URL and keep one session across domains.
import { SHOP_DOMAIN } from './constants';

function submitForm(action, method, fields) {
  const form = document.createElement('form');
  form.method = method;
  form.action = action;
  form.style.display = 'none';
  fields.forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });
  document.body.appendChild(form);
  // requestSubmit fires the submit event (GA4 linker listens for it); submit() does not.
  if (typeof form.requestSubmit === 'function') form.requestSubmit();
  else form.submit();
}

// lines: [{ variantId, quantity, sellingPlanId? }]
export function goToShopifyCheckout(lines) {
  if (!lines.length) return;

  if (!lines.some((l) => l.sellingPlanId)) {
    const permalink = lines.map((l) => `${l.variantId}:${l.quantity}`).join(',');
    submitForm(`https://${SHOP_DOMAIN}/cart/${permalink}`, 'GET', [['checkout[shipping_address][country]', 'US']]);
    return;
  }

  // Subscriptions need /cart/add so each line can carry its selling plan.
  const fields = [];
  lines.forEach((l, i) => {
    fields.push([`items[${i}][id]`, l.variantId], [`items[${i}][quantity]`, l.quantity]);
    if (l.sellingPlanId) fields.push([`items[${i}][selling_plan]`, l.sellingPlanId]);
  });
  fields.push(['return_to', '/checkout']);
  submitForm(`https://${SHOP_DOMAIN}/cart/add`, 'POST', fields);
}
