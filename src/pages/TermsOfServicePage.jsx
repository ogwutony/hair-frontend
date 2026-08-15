// src/pages/TermsOfServicePage.jsx
import React, { useEffect } from 'react';

export const TermsOfServicePage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '60px 30px', fontFamily: 'Inter, sans-serif', color: '#222', lineHeight: 1.8 }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Terms of Service</h1>
      <p style={{ color: '#888', fontSize: '13px', marginBottom: '40px' }}>Last updated: June 22, 2026</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>1. Acceptance of Terms</h2>
      <p>By accessing or using The Majorities ecosystem, web interface, custom formulas, or network features (collectively, the "Service"), you explicitly agree to be bound by these Terms of Service. If you do not accept these conditions, you are prohibited from utilizing our custom product builder or participating in our governance structures.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>2. Custom Formulation E-Commerce</h2>
      <p>The Majorities provides an active custom assembly framework allowing users to choose exactly six (6) items across distinct hair and face categories to complete an authorized set.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>3. The Duma Ledger & Governance Tokens</h2>
      <p>Our platforms host a digital community ledger called the Duma. By interacting with the Duma, including uploading user avatars, publishing custom media context, following creators, or casting platform recommendations, you gain experience points that directly adjust your community tier.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>4. Partner Distribution Marketplace</h2>
      <p>Third-party manufacturing groups applying for official platform retail listings must adhere to our global logistics rules.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>5. User-Submitted Media and Content Rights</h2>
      <p>When you post a video view snippet, custom hair profile, or feedback justification to the Duma, you grant The Majorities an unrestricted, global, royalty-free license to host, display, and analyze that file.</p>
    </div>
  );
};
