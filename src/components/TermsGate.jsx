// src/components/TermsGate.jsx
// Shown once per account (and again whenever TERMS_VERSION changes) after login.
// Members must agree to the Community Guidelines, which state there is zero
// tolerance for objectionable content or abusive users.

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SUPPORT_EMAIL, TERMS_VERSION, hasAcceptedTerms, markTermsAccepted, syncBlockedFromServer } from '../utils/moderation';

const RULES = [
  ['Zero tolerance', 'No hateful, harassing, threatening, sexually explicit, violent, illegal or spam content, and no scams or impersonation. Accounts that break these rules are suspended or removed.'],
  ['Report and block', 'Every post, listing and profile has a "•••" menu to report it or block the person. Our team reviews reports within 24 hours and removes content that breaks these rules.'],
  ['Your content', 'You are responsible for what you post. You can delete your posts at any time, and you can permanently delete your account from your Profile.'],
  ['Points', 'Points and rank titles are earned by taking part in the community. They cannot be bought and have no cash value.'],
  ['Marketplace', 'Listings are created by community members. Purchases made through a listing\'s link happen outside The Majorities, between you and the seller.'],
];

export const TermsGate = ({ userEmail, authToken, onDecline }) => {
  const [visible, setVisible] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!userEmail) {
      setVisible(false);
      return;
    }
    syncBlockedFromServer(authToken);
    setVisible(!hasAcceptedTerms(userEmail));
  }, [userEmail, authToken]);

  if (!visible) return null;

  const accept = async () => {
    if (!agreed) return;
    await markTermsAccepted(userEmail, authToken);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Community Guidelines"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }}
    >
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
        <div style={{ padding: '22px 24px 12px', borderBottom: '1px solid #eee' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Community Guidelines &amp; Terms</h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>Version {TERMS_VERSION}</p>
        </div>
        <div style={{ padding: '16px 24px', overflowY: 'auto' }}>
          <p style={{ marginTop: 0, fontSize: '14px', lineHeight: 1.5 }}>
            Please read and accept these rules to continue using The Majorities community.
          </p>
          {RULES.map(([title, body]) => (
            <div key={title} style={{ marginBottom: '12px' }}>
              <strong style={{ fontSize: '14px' }}>{title}</strong>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#555', lineHeight: 1.5 }}>{body}</p>
            </div>
          ))}
          <p style={{ fontSize: '13px', color: '#555' }}>
            Full terms: <Link to="/TermsofService" target="_blank">Terms of Service</Link> ·{' '}
            <Link to="/privacy" target="_blank">Privacy Policy</Link>. Questions or reports:{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </p>
        </div>
        <div style={{ padding: '16px 24px 22px', borderTop: '1px solid #eee' }}>
          <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '13px', cursor: 'pointer', marginBottom: '14px' }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: '2px' }} />
            I agree to the Terms of Service and Community Guidelines, including zero tolerance for objectionable content and abusive users.
          </label>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onDecline}
              style={{ border: '1px solid #ddd', background: '#fff', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', fontWeight: 600 }}
            >
              Decline and log out
            </button>
            <button
              type="button"
              onClick={accept}
              disabled={!agreed}
              style={{ border: 'none', background: '#222', color: '#fff', borderRadius: '8px', padding: '10px 16px', cursor: agreed ? 'pointer' : 'not-allowed', fontWeight: 700, opacity: agreed ? 1 : 0.5 }}
            >
              Agree and continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
