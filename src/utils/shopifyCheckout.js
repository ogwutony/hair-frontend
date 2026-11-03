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

// The logged-in themajorities.com email, so Shopify checkout opens with it filled in and the
// order lands on the same Shopify customer the backend linked to this account.
function signedInEmail() {
  try {
    const email = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || '';
    // Apple sign-in placeholders are not real inboxes
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !/@users\.themajorities\.com$/i.test(email) ? email : '';
  } catch {
    return '';
  }
}

// lines: [{ variantId, quantity, sellingPlanId? }]
export function goToShopifyCheckout(lines) {
  if (!lines.length) return;
  const email = signedInEmail();

  if (!lines.some((l) => l.sellingPlanId)) {
    const permalink = lines.map((l) => `${l.variantId}:${l.quantity}`).join(',');
    const fields = [['checkout[shipping_address][country]', 'US']];
    if (email) fields.push(['checkout[email]', email]);
    submitForm(`https://${SHOP_DOMAIN}/cart/${permalink}`, 'GET', fields);
    return;
  }

  // Subscriptions need /cart/add so each line can carry its selling plan.
  const fields = [];
  lines.forEach((l, i) => {
    fields.push([`items[${i}][id]`, l.variantId], [`items[${i}][quantity]`, l.quantity]);
    if (l.sellingPlanId) fields.push([`items[${i}][selling_plan]`, l.sellingPlanId]);
  });
  fields.push(['return_to', email ? `/checkout?checkout[email]=${encodeURIComponent(email)}` : '/checkout']);
  submitForm(`https://${SHOP_DOMAIN}/cart/add`, 'POST', fields);
}
