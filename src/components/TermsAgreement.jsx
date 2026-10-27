// src/components/TermsAgreement.jsx
// Required EULA / Terms of Use checkbox shown on Sign Up and Log In, before any account is created
// or signed in (App Store Guideline 1.2). The text states zero tolerance for objectionable content
// and abusive users. Parent pages disable every sign-up / log-in button until it is checked.

import React from 'react';
import { Link } from 'react-router-dom';

export const ZERO_TOLERANCE_TEXT =
  'There is zero tolerance for objectionable, inappropriate or abusive content and users. Any user posting such content will be removed from the platform immediately.';

export const TermsAgreement = ({ checked, onChange, highlight = false }) => (
  <div
    style={{
      textAlign: 'left',
      border: `1px solid ${highlight ? '#c0392b' : '#e5e5e5'}`,
      background: highlight ? '#fff6f5' : '#fafafa',
      borderRadius: '10px',
      padding: '12px 14px',
      margin: '0 0 16px',
    }}
  >
    <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#444', lineHeight: 1.5 }}>
      <strong>Terms of Use (EULA).</strong> {ZERO_TOLERANCE_TEXT} Every post, comment and profile has a “•••” menu to
      report it or block the person. We review reports within 24 hours.
    </p>
    <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '13px', cursor: 'pointer', color: '#222' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: '2px' }}
        aria-describedby="terms-agreement-text"
      />
      <span id="terms-agreement-text">
        I agree to the <Link to="/TermsofService" target="_blank">Terms of Service (EULA)</Link>,{' '}
        <Link to="/privacy" target="_blank">Privacy Policy</Link> and Community Guidelines.
      </span>
    </label>
  </div>
);
