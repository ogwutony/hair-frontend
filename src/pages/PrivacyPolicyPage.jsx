// src/pages/PrivacyPolicyPage.jsx
import React, { useEffect } from 'react';

export const PrivacyPolicyPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '60px 30px', fontFamily: 'Inter, sans-serif', color: '#222', lineHeight: 1.8 }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Privacy Policy</h1>
      <p style={{ color: '#888', fontSize: '13px', marginBottom: '40px' }}>Last updated: June 22, 2026</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>1. Information We Collect Natively</h2>
      <p>To safely fulfill custom cosmetic selections and compute user tier algorithms, we process and log account email addresses, unique password configurations, custom profile avatars, user points tallies, and logged system formulas.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>2. How Your Private Records are Handled</h2>
      <p>We restrict utilization of logged variables strictly to core operational mechanics: To execute fast delivery packaging metrics through third-party optimization services like ShipBob.</p>
    </div>
  );
};
