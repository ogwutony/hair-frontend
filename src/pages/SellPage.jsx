// src/pages/SellPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CredentialHeader } from '../components/CredentialHeader';
import { GuestSubmissionPrompt } from '../components/GuestSubmissionPrompt';
import { RankBadge } from '../components/RankBadge';
import { BACKEND_URL } from '../utils/constants';
import { styles } from '../utils/styles';

const BOOST_COST_POINTS = 500;
const LISTING_CATEGORIES = ['Hair Care', 'Skin Care', 'Services', 'Merch', 'Other'];

export const SellPage = ({ userEmail, rankTitle, rankScore, authToken, userAvatar, onAddPoints }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: LISTING_CATEGORIES[0],
    externalLink: '',
    image: null
  });
  const [boostListing, setBoostListing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [wasBoosted, setWasBoosted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  const hasEnoughPoints = (rankScore || 1) >= BOOST_COST_POINTS;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setShowGuestPrompt(false);

    if (!formData.title || !formData.description || formData.price === '' || !formData.category || !formData.externalLink) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    const price = Number(formData.price);
    if (!Number.isFinite(price) || price < 0) {
      setErrorMsg('Price must be a valid non-negative number.');
      return;
    }
    try {
      const parsed = new URL(formData.externalLink);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('bad protocol');
    } catch {
      setErrorMsg('External Link must be a valid URL starting with http:// or https://');
      return;
    }
    if (!authToken) {
      setShowGuestPrompt(true);
      return;
    }
    if (boostListing && !hasEnoughPoints) {
      setErrorMsg(`Boosting costs ${BOOST_COST_POINTS} points — your balance is ${rankScore || 1}.`);
      return;
    }

    setIsLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('price', String(price));
      submitData.append('category', formData.category);
      submitData.append('externalLink', formData.externalLink.trim());
      if (formData.image) submitData.append('image', formData.image);

      const res = await fetch(`${BACKEND_URL}/api/marketplace/list`, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + authToken },
        body: submitData
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || 'Submission failed'); setIsLoading(false); return; }
      if (onAddPoints) onAddPoints(50);

      let boosted = false;
      if (boostListing && data.item && (data.item._id || data.item.id)) {
        const boostRes = await fetch(`${BACKEND_URL}/api/marketplace/boost`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + authToken },
          body: JSON.stringify({ listingId: data.item._id || data.item.id })
        });
        const boostData = await boostRes.json();
        if (!boostRes.ok) {
          setErrorMsg(boostData.error || 'Listing created, but the boost failed.');
          setSubmitted(true);
          setIsLoading(false);
          return;
        }
        boosted = true;
        if (onAddPoints) onAddPoints(-BOOST_COST_POINTS);
      }
      setWasBoosted(boosted);
      setSubmitted(true);
    } catch (err) {
      setErrorMsg('We could not submit your listing. Please try again.');
    }
    setIsLoading(false);
  };

  if (submitted) {
    return (
      <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ ...styles.dumaCard, textAlign: 'center', padding: '50px' }}>
          <h2 style={{ marginBottom: '10px' }}>{wasBoosted ? 'Listing Live & Boosted!' : 'Listing Submitted!'}</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            {wasBoosted
              ? 'Your listing is pinned to the top of the Marketplace for the next 24 hours.'
              : 'Your listing is now live in The Duma Marketplace.'}
          </p>
          {rankTitle && <RankBadge rankTitle={rankTitle} />}
          <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/duma" style={{ ...styles.authButton, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>View the Marketplace</Link>
            <button
              style={{ ...styles.authButton, background: '#f5f5f5', color: '#222' }}
              onClick={() => { setSubmitted(false); setWasBoosted(false); setBoostListing(false); setFormData({ title: '', description: '', price: '', category: LISTING_CATEGORIES[0], externalLink: '', image: null }); }}
            >
              List Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2>Sell in the Marketplace</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>
        List a product or service in The Duma Marketplace. Buyers check out through your external link (Shopify, Calendly, CashApp, etc.) — no on-platform transactions.
      </p>

      {userEmail && rankTitle && <div style={{ marginBottom: '20px' }}><CredentialHeader email={userEmail} rankTitle={rankTitle} rankScore={rankScore} avatarUrl={userAvatar} /></div>}
      {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}
      {showGuestPrompt && <GuestSubmissionPrompt message="Log in or register to list an item in the Marketplace." />}
      {!authToken && !showGuestPrompt && <GuestSubmissionPrompt message="Log in or register to list an item in the Marketplace." />}

      <form style={styles.dumaCard} onSubmit={handleSubmit}>
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '15px', textTransform: 'uppercase', color: '#222' }}>1. Listing Details</h3>
          <input required placeholder="Title *" style={styles.input} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
          <textarea required placeholder="Description *" style={{ ...styles.input, height: '100px' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '15px', textTransform: 'uppercase', color: '#222' }}>2. Pricing & Category</h3>
          <input required type="number" min="0" step="0.01" placeholder="Price (USD) *" style={styles.input} value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
          <select required style={styles.input} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
            {LISTING_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '15px', textTransform: 'uppercase', color: '#222' }}>3. Photo & Checkout Link</h3>
          <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Upload Image</label>
          <input type="file" accept="image/jpeg, image/png, image/webp" style={styles.input} onChange={e => setFormData({ ...formData, image: e.target.files?.[0] || null })} />
          <input required type="url" placeholder="External Link (Shopify, Calendly, CashApp...) *" style={styles.input} value={formData.externalLink} onChange={e => setFormData({ ...formData, externalLink: e.target.value })} />
        </div>

        <div style={{ marginBottom: '25px', background: boostListing ? '#fffbe6' : '#f9f9f9', border: '1px solid #eee', borderRadius: '12px', padding: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
            <input type="checkbox" checked={boostListing} onChange={e => setBoostListing(e.target.checked)} />
            Boost to the top for 24 Hours (Costs 500 Points)
          </label>
          <p style={{ fontSize: '12px', color: '#666', margin: '8px 0 0 0' }}>
            Your balance: <strong>{rankScore || 1} points</strong>.
            {!hasEnoughPoints && <span style={{ color: '#c0392b' }}> Not enough points to boost.</span>}
          </p>
        </div>

        <button type="submit" style={styles.authButton} disabled={isLoading}>{isLoading ? 'Submitting...' : 'List in the Marketplace'}</button>
      </form>

      <div style={{ ...styles.dumaCard, background: '#f9f9f9', marginTop: '30px' }}>
        <h3 style={{ marginTop: 0, fontSize: '14px', fontWeight: '700' }}>Before You List:</h3>
        <ul style={{ fontSize: '13px', color: '#555', lineHeight: '1.8', marginLeft: '20px' }}>
          <li>Verify you are logged in so your listing is tied to your profile and points</li>
          <li>Double-check your External Link — buyers complete checkout there, off-platform</li>
          <li>Images must be JPEG, PNG, or WebP under 5MB</li>
          <li>Boosting deducts points immediately and pins your listing for 24 hours</li>
        </ul>
      </div>
    </div>
  );
};
