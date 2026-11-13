import React, { useState } from 'react';
import { styles } from '../utils/styles';
import { startShopifySignIn } from '../utils/shopifyAuth';
import { TermsAgreement } from './TermsAgreement';
import { setTermsPreAccepted } from '../utils/moderation';

export function ShopifySignIn({ config }) {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const signIn = async () => {
    if (!agreed) { setError('Please agree to the Terms of Use before signing in.'); return; }
    setBusy(true);
    setError('');
    try { setTermsPreAccepted(); await startShopifySignIn(config); }
    catch (e) { setError(e.message); setBusy(false); }
  };
  return <main style={styles.authContainer}>
    <div style={{ ...styles.authCard, maxWidth: '420px', boxSizing: 'border-box', width: '100%' }}>
      <h1 style={{ fontSize: '24px' }}>The Majorities</h1>
      <p>One account for shopping and The Duma.</p>
      <p style={{ color: '#666', lineHeight: 1.5 }}>Sign in or create your account using the same secure login as our store.</p>
      {error && <p role="alert">{error}</p>}
      <TermsAgreement checked={agreed} onChange={setAgreed} />
      <button type="button" className="ms-btn" disabled={busy} onClick={signIn}>{busy ? 'Connecting…' : 'Continue to sign in'}</button>
    </div>
  </main>;
}
