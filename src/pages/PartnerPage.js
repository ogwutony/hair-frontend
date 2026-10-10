// src/pages/PartnerPage.jsx
// Partner applications. Every track uses the same 3-step wizard (see components/partner) and asks
// only the questions that fit that kind of partner. Deep link a track with /partner?type=creator.
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CredentialHeader } from '../components/CredentialHeader';
import { PartnerWizard } from '../components/partner/PartnerWizard';
import { BRAND_TRACK, CREATOR_TRACK, VENUE_TRACK, MARKETPLACE_TRACK, REVIEW_TRACK } from '../components/partner/tracks';
import { BACKEND_URL, getPartnerApplyPoints } from '../utils/constants';
import { styles } from '../utils/styles';

const TRACKS = {
  brand: { track: BRAND_TRACK, icon: '🛍️', title: 'Brand & Retailer', desc: 'Wholesale pricing, marketplace listings, and sponsored placements.',
    perks: ['Wholesale access on approval', '20% commission, no listing fees', 'Featured on The Duma'] },
  creator: { track: CREATOR_TRACK, icon: '🎥', title: 'Creator / Influencer', desc: 'Make content, join The Duma, and earn 8% on referrals.',
    perks: ['8% on every referral sale', 'Paid monthly, no cap', 'Get featured on The Duma'] },
  venue: { track: VENUE_TRACK, icon: '📍', title: 'Venue / Community', desc: 'Salons, barbershops, run clubs, and local event organizers.',
    perks: ['Free samples for your people', 'Event sponsorship', 'Sell our products in your space'] },
  marketplace: { track: MARKETPLACE_TRACK, title: 'Sell on our Marketplace',
    perks: ['Import products from Shopify', '20% commission, no listing fees', 'Reach a community shopping for you'] },
  review: { track: REVIEW_TRACK, title: 'Request a Review',
    perks: ['Honest review by our team', 'Shared across The Majorities', 'Optional boost on The Duma'] },
};
const PRIMARY = ['brand', 'creator', 'venue'];
const SECONDARY = ['marketplace', 'review'];
const DRAFT_KEYS = Object.values(TRACKS).map(t => t.track.draftKey);

export const PartnerPage = ({ addDumaItem, onAddPoints, userEmail, rankTitle, rankScore, authToken, userAvatar, onWholesaleApproved }) => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initial = TRACKS[params.get('type')] ? params.get('type') : 'brand';
  const [active, setActive] = useState(initial);
  const [visited, setVisited] = useState([initial]); // wizards stay mounted once opened, so switching keeps progress
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const canApplyPremium = (rankScore || 1) >= 900000;

  const choose = (key) => {
    setErrorMsg('');
    setActive(key);
    setVisited(v => (v.includes(key) ? v : [...v, key]));
    setParams({ type: key }, { replace: true });
  };

  const sendApplication = async (formDataObj, category, { hasPhoto, hasVideo }) => {
    setErrorMsg('');
    if (!authToken) { setErrorMsg('You must be logged in to submit a partnership application.'); return; }
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/duma/partner`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formDataObj,
      });
      // The server can answer with non-JSON (e.g. an upload too large for the host) — never treat that as success
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErrorMsg(data.error || `Submission failed (${res.status}). Please try again.`); return; }

      try { DRAFT_KEYS.forEach(k => sessionStorage.removeItem(k)); } catch (e) { /* storage unavailable */ }
      if (onAddPoints) onAddPoints(getPartnerApplyPoints(category));
      // Public item from the server (no EIN or contact details)
      addDumaItem({
        ...(data.item || {}),
        id: data.item?._id || Date.now(),
        type: 'Partner',
        submittedBy: userEmail || 'anonymous',
        submitterRank: rankTitle || 'Comrade',
        hasPhoto,
        hasVideo,
      });
      setSubmitted(category);

      // Brand & Retail applications unlock wholesale access immediately (the server grants it) — go straight there
      if (category === BRAND_TRACK.category && data.wholesaleApproved) {
        if (onWholesaleApproved) onWholesaleApproved();
        navigate('/wholesale', { state: { fromApplication: true } });
      }
    } catch (err) {
      setErrorMsg("We couldn't reach the server, so your application was not sent. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const isReview = submitted === REVIEW_TRACK.category;
    return (
      <div style={{ padding: '40px clamp(16px, 5vw, 60px)', maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ ...styles.dumaCard, textAlign: 'center', padding: 'clamp(28px, 6vw, 50px)' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>✅</div>
          <h2>{isReview ? 'Review request sent!' : 'Application submitted!'}</h2>
          <p style={{ color: '#666' }}>We'll review it and get back to you by email. You can follow along on The Duma.</p>
          <Link to="/duma" style={{ ...styles.authButton, marginTop: '20px', width: 'auto', padding: '12px 24px', textDecoration: 'none', display: 'inline-block' }}>
            View the Duma
          </Link>
        </div>
      </div>
    );
  }

  const current = TRACKS[active];

  return (
    <div style={{ padding: '32px clamp(16px, 5vw, 60px) 48px', maxWidth: '880px', margin: '0 auto', boxSizing: 'border-box' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', letterSpacing: '0.12em', fontWeight: 700, color: '#888', marginBottom: '8px' }}>PARTNER WITH THE MAJORITIES</div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', lineHeight: 1.1, margin: '0 0 10px' }}>Grow with The Majorities</h1>
        <p style={{ fontSize: '16px', color: '#555', lineHeight: 1.6, margin: 0, maxWidth: '600px' }}>
          Pick how you want to work with us. Each application takes about 3 minutes.
        </p>
      </header>

      {userEmail && rankTitle && (
        <div style={{ marginBottom: '20px' }}>
          <CredentialHeader email={userEmail} rankTitle={rankTitle} rankScore={rankScore} avatarUrl={userAvatar} />
        </div>
      )}

      {/* ── TRACK PICKER ───────────────────────────────────────────────────── */}
      <div role="radiogroup" aria-label="Partnership type" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {PRIMARY.map(key => {
          const { icon, title, desc } = TRACKS[key];
          const on = active === key;
          return (
            <button key={key} type="button" role="radio" aria-checked={on} onClick={() => choose(key)}
              style={{ textAlign: 'left', padding: '16px 18px', borderRadius: '16px', cursor: 'pointer', color: '#1a1a1a',
                border: `2px solid ${on ? '#1a1a1a' : '#e5e5e5'}`, backgroundColor: on ? '#f6f6f6' : '#fff', transition: 'all 0.15s' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }} aria-hidden="true">{icon}</div>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{title}</div>
              <div style={{ fontSize: '13px', color: '#666', lineHeight: 1.5 }}>{desc}</div>
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', margin: '12px 0 24px', fontSize: '13px', color: '#666' }}>
        <span>Also:</span>
        {SECONDARY.map(key => {
          const on = active === key;
          return (
            <button key={key} type="button" aria-pressed={on} onClick={() => choose(key)}
              style={{ padding: '6px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '13px',
                border: `1.5px solid ${on ? '#1a1a1a' : '#ddd'}`, backgroundColor: on ? '#1a1a1a' : '#fff', color: on ? '#fff' : '#1a1a1a' }}>
              {TRACKS[key].title}
            </button>
          );
        })}
      </div>

      {/* ── WHAT YOU GET (only for the selected track) ─────────────────────── */}
      <ul aria-label="What you get" style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexWrap: 'wrap', gap: '8px 18px', fontSize: '13px', color: '#444' }}>
        {current.perks.map(p => <li key={p}>✓ {p}</li>)}
      </ul>

      {visited.map(key => (
        <div key={key} style={{ display: key === active ? 'block' : 'none' }}>
          <PartnerWizard
            track={TRACKS[key].track}
            authToken={authToken}
            canApplyPremium={canApplyPremium}
            submitting={submitting}
            serverError={key === active ? errorMsg : ''}
            onSubmit={(fd, meta) => sendApplication(fd, TRACKS[key].track.category, meta)}
          />
        </div>
      ))}
    </div>
  );
};
