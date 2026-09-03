// src/pages/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { trackEvent } from '../components/AdMonetization';
import { productsData } from '../utils/constants';
import { calculateSetTotals, formatCurrency, getProductCommerceConfig, submitShopifyCheckout } from '../utils/helpers';
import { styles } from '../utils/styles';

export function LandingPage({ saveSetToProfile, onAddPoints, savedSets }) {
const [selection, setSelection] = useState([]);
const [focusedItem, setFocusedItem] = useState(null);
const MOBILE_BREAKPOINT = 768;
const [isMobile, setIsMobile] = useState(() => window.innerWidth <= MOBILE_BREAKPOINT);

useEffect(() => {
let debounceTimer;
const handleResize = () => {
clearTimeout(debounceTimer);
debounceTimer = setTimeout(() => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT), 150);
};
window.addEventListener('resize', handleResize);
return () => { clearTimeout(debounceTimer); window.removeEventListener('resize', handleResize); };
}, []);

const handleSelect = (item) => {
setFocusedItem(item);
setSelection(prev => {
if (prev.length >= 6) return prev;
return [...prev, item];
});
};

const handleRemoveFromCart = (name) => {
setSelection(prev => {
const lastIdx = prev.map(i => i.name).lastIndexOf(name);
if (lastIdx === -1) return prev;
return prev.filter((_, i) => i !== lastIdx);
});
};

const selectedItems = selection;
const isSetComplete = selectedItems.length === 6;
const setTotals = calculateSetTotals(selectedItems);
const subscriptionSavings = Math.max(0, setTotals.oneTime - setTotals.subscription);

const handleOneTimeCheckout = () => {
if (!isSetComplete) return;
trackEvent("checkout_started", {
placement: "landing_page",
purchaseType: "one_time",
itemCount: selectedItems.length,
checkoutValue: setTotals.oneTime
});
submitShopifyCheckout(selectedItems, "one-time");
};

const handleSubscriptionCheckout = () => {
if (!isSetComplete) return;
trackEvent("checkout_started", {
placement: "landing_page",
purchaseType: "subscription",
itemCount: selectedItems.length,
checkoutValue: setTotals.subscription
});
submitShopifyCheckout(selectedItems, "subscription");
};

const renderRow = (label, category) => (
<div style={styles.rowSection}>
<h3 style={styles.rowLabel}>{label}</h3>
<div style={styles.scrollRow}>
{productsData[category].map(item => {
const isSelected = selection.some(i => i.name === item.name);
const { pricing } = getProductCommerceConfig(item.name);
return (
<div key={item.name} onClick={() => handleSelect(item)} style={{ ...styles.card, border: isSelected ? "2px solid #222" : "1px solid #eee" }}>

<img
src={item.imageUrl}
alt={item.name}
style={{ width: '100%', height: '120px', objectFit: 'contain', borderRadius: '10px', backgroundColor: '#f0f0f0', marginBottom: '8px' }}
/>

<div style={styles.itemName}>{item.name}</div>
<div style={{ fontSize: '11px', color: '#555', marginTop: '8px', lineHeight: '1.5' }}>
<div>One-time {formatCurrency(pricing.oneTime)} <span style={{ color: '#777' }}>· 1 box per month</span></div>
<div>Subscribe {formatCurrency(pricing.subscription)} <span style={{ color: '#777' }}>· 1 box per month</span></div>
</div>
</div>
);
})}
</div>
</div>
);

return (
<div>
<Helmet>
<title>Build Your Set | The Majorities</title>
<meta name="description" content="Build your custom 6-product haircare and skincare set. Choose from premium shampoos, conditioners, oils, and scrubs." />
<link rel="canonical" href="https://themajorities.com/" />
</Helmet>
<div style={{ ...styles.layout, flexDirection: isMobile ? 'column' : 'row', padding: isMobile ? '20px 16px' : '20px 60px', overflowX: isMobile ? 'hidden' : 'visible', boxSizing: 'border-box' }}>
<div style={{ ...styles.left, width: isMobile ? '100%' : '70%', paddingRight: isMobile ? 0 : '40px', minWidth: 0, overflowX: 'hidden' }}>
{renderRow("Pick Shampoos", "shampoos")}
{renderRow("Pick Conditioners", "conditioners")}
{renderRow("Pick Oils", "oils")}
{renderRow("Pick Face Scrubs", "faceScrubs")}
{renderRow("Pick Toners", "toners")}
{renderRow("Pick Creams", "faceCreams")}
</div>
<aside style={{ ...styles.right, width: isMobile ? '100%' : '30%', position: isMobile ? 'static' : 'sticky', top: isMobile ? 'auto' : '20px', boxSizing: 'border-box', height: 'auto', maxHeight: 'none' }}>

<div style={{ minHeight: '100px', marginBottom: '15px' }}>
{focusedItem ? (
<div>
<h3>{focusedItem.name}</h3>
<div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
<span style={{ fontSize: '12px', fontWeight: '600', color: '#333' }}>
One-time {formatCurrency(getProductCommerceConfig(focusedItem.name).pricing.oneTime)} · 1 box per month
</span>
<span style={{ fontSize: '12px', fontWeight: '600', color: '#2d6a4f' }}>
Subscribe {formatCurrency(getProductCommerceConfig(focusedItem.name).pricing.subscription)} · 1 box per month
</span>
</div>

<div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>
{focusedItem.desc}
</div>

{(focusedItem.images || focusedItem.imageUrl) && (
<div style={{ textAlign: 'center', marginBottom: '20px' }}>
{focusedItem.images ? (
<div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
{focusedItem.images.map((src, idx) => (
<img
key={idx}
src={src}
alt={focusedItem.name + ' view ' + (idx + 1)}
style={{ maxWidth: '30%', maxHeight: '250px', objectFit: 'contain', borderRadius: '12px', border: '1px solid #ddd', padding: '8px', backgroundColor: '#fff', flex: '1 1 28%' }}
/>
))}
</div>
) : (
<img
src={focusedItem.imageUrl}
alt={focusedItem.name}
style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain', borderRadius: '12px', border: '1px solid #ddd', padding: '10px', backgroundColor: '#fff' }}
/>
)}
</div>
)}
</div>
) : <p style={{color: '#888'}}>Select a product</p>}
</div>

<div style={styles.summaryContainer}>
<h4 style={{ fontSize: '14px', borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0 }}>Your Custom Set ({selectedItems.length}/6)</h4>
<div style={{ margin: '10px 0' }}>
{(() => {
const counts = {};
selectedItems.forEach(item => { counts[item.name] = (counts[item.name] || 0) + 1; });
return Object.entries(counts).map(([name, count]) => (
<div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0' }}>
<p style={{ fontSize: '11px', margin: 0 }}>
{name}{count > 1 ? ` x${count}` : ''} · {formatCurrency(getProductCommerceConfig(name).pricing.oneTime)} / {formatCurrency(getProductCommerceConfig(name).pricing.subscription)}
</p>
<button onClick={() => handleRemoveFromCart(name)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: '#aaa', lineHeight: 1, padding: '0 4px' }} title="Remove one">×</button>
</div>
));
})()}
</div>
{isSetComplete ? (
<div style={{ borderTop: '2px solid #222', paddingTop: '15px' }}>
<div style={{ fontSize: '12px', color: '#666', marginBottom: '12px', lineHeight: '1.6' }}>
<div>One-time total: <strong>{formatCurrency(setTotals.oneTime)}</strong> · 1 box per month</div>
<div>Subscription total: <strong>{formatCurrency(setTotals.subscription)} / month</strong> · 1 box per month</div>
<div>You save <strong>{formatCurrency(subscriptionSavings)}</strong> on each monthly set.</div>
</div>
<p style={{ margin: '0 0 14px', fontSize: '12px', color: '#2d6a4f', fontWeight: '700' }}>Subscribe &amp; save — pause or cancel anytime.</p>
<div style={{ backgroundColor: '#f4f9f4', border: '1px solid #c2e1c2', padding: '12px', borderRadius: '8px', marginBottom: '14px', textAlign: 'left' }}>
<span style={{ fontSize: '13px', color: '#1e4620', fontWeight: '700', display: 'block' }}>
Fast US Fulfillment via ShipBob
</span>
<span style={{ fontSize: '11px', color: '#2e6f32', display: 'block', marginTop: '3px' }}>
Estimated Delivery: <strong>{
new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
} - {
new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}</strong> (+ Shipping & Handling)
</span>
</div>
<button style={styles.checkoutBtn} onClick={handleOneTimeCheckout}>1 time Checkout ({formatCurrency(setTotals.oneTime)})</button>
<button style={{ ...styles.checkoutBtn, background: '#222', color: '#fff' }} onClick={handleSubscriptionCheckout}>Monthly Subscription — {formatCurrency(setTotals.subscription)} / Month</button>
<div style={{ padding: '12px', marginTop: '4px', borderRadius: '8px', background: '#fff', border: '1px solid #dce9dc', fontSize: '11px', lineHeight: '1.5', color: '#444' }}>
<strong style={{ display: 'block', color: '#222' }}>🔒 Secure checkout</strong>
Your payment details are securely processed.
</div>
<div style={{ padding: '12px', marginTop: '10px', borderRadius: '8px', background: '#fff', border: '1px solid #eee', fontSize: '11px', lineHeight: '1.5', color: '#444' }}>
<strong style={{ display: 'block', color: '#222' }}>30-day returns</strong>
Return unused items in original packaging within 30 days of delivery. <Link to="/returns" style={{ color: '#222', fontWeight: '700' }}>Read the full policy</Link>
</div>
<div style={{ padding: '12px', marginTop: '10px', borderRadius: '8px', background: '#fff', border: '1px solid #eee', fontSize: '11px', lineHeight: '1.5', color: '#444' }}>
<strong style={{ display: 'block', color: '#222' }}>★★★★★ Loved by our customers</strong>
"My hair feels softer without adding extra steps." — Jordan R.
</div>
</div>
) : <p style={{ fontSize: '12px', color: '#888' }}>Select 6 products to checkout</p>}
</div>
</aside>
</div>
</div>
);
}
