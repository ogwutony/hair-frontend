// src/pages/TermsOfServicePage.jsx
import React, { useEffect } from 'react';

export const TermsOfServicePage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '60px 30px', fontFamily: 'Inter, sans-serif', color: '#222', lineHeight: 1.8 }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Terms of Service &amp; End User License Agreement (EULA)</h1>
      <p style={{ color: '#888', fontSize: '13px', marginBottom: '40px' }}>Last updated: October 27, 2026</p>

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
      <h2 id="community-guidelines" style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>6. Community Guidelines</h2>
      <ul>
        <li><strong>Respectful Content:</strong> We ask that all members avoid posting offensive, inappropriate, or abusive content.</li>
        <li><strong>Report Issues:</strong> If you see something that violates these principles, you can flag it directly by tapping the ••• menu on any post, comment, or profile. Our team reviews reported items promptly.</li>
        <li><strong>Account Guidelines:</strong> To help maintain a positive community, content or accounts that repeatedly disrupt the experience for others may be removed or restricted at our discretion.</li>
      </ul>
      <p>Offensive, inappropriate or abusive content includes, but is not limited to: hate speech or slurs; harassment, bullying or threats; sexually explicit material or nudity; content that sexualizes minors; violence or dangerous acts; illegal goods or activity; spam, scams and impersonation. This applies to posts, comments, images, videos, messages, profile names and photos, in the website and the mobile app.</p>
      <p>Automatic filters block posts, comments and messages that contain objectionable language before they are published.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>7. Reporting, Blocking and Enforcement</h2>
      <p>Every post, comment, message and profile has a “•••” menu to <strong>Report</strong> it or <strong>Block</strong> the person. Blocking immediately hides that person’s content from you and stops them from messaging you or commenting on your posts. You can unblock people from your Profile.</p>
      <p>Our moderation team reviews reported items promptly. Content that breaks these rules is removed, and content or accounts that repeatedly disrupt the experience for others may be removed or restricted at our discretion. Content reported by several members is hidden automatically while it is reviewed. To contact the moderation team, email OgwuTony@themajorities.com.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>8. Account Deletion</h2>
      <p>You can permanently delete your account and its content at any time from your Profile settings, on the website or in the app.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>9. Apple App Store</h2>
      <p>If you downloaded the app from the Apple App Store, these terms are between you and Majority Hair Solution LLC (DBA The Majorities), not Apple. Apple’s Standard Licensed Application End User License Agreement also applies, and Apple has no obligation to provide support or maintenance for the app.</p>
    </div>
  );
};
