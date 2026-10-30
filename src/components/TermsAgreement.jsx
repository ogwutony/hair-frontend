// src/components/TermsAgreement.jsx
// Required EULA / Terms of Use checkbox shown on Sign Up and Log In, before any account is created
// or signed in (App Store Guideline 1.2). Covers respectful content, reporting and account guidelines. Parent pages disable every sign-up / log-in button until it is checked.

import React from 'react';
import { Link } from 'react-router-dom';

export const EULA_POINTS = [
  ['Respectful Content', 'We ask that all members avoid posting offensive, inappropriate, or abusive content.'],
  ['Report Issues', 'If you see something that violates these principles, you can flag it directly by tapping the ••• menu on any post, comment, or profile. Our team reviews reported items promptly.'],
  ['Account Guidelines', 'To help maintain a positive community, content or accounts that repeatedly disrupt the experience for others may be removed or restricted at our discretion.'],
];

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
    <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#444', fontWeight: 700 }}>Terms of Use (EULA)</p>
    <ul style={{ margin: '0 0 8px', paddingLeft: '18px', fontSize: '12px', color: '#444', lineHeight: 1.5 }}>
      {EULA_POINTS.map(([title, body]) => (
        <li key={title}><strong>{title}:</strong> {body}</li>
      ))}
    </ul>
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
