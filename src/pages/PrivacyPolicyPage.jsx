// src/pages/PrivacyPolicyPage.jsx
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { BUSINESS } from '../utils/business';

const h2 = { fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' };
const ext = { target: '_blank', rel: 'noopener noreferrer' };

export const PrivacyPolicyPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '60px 30px', fontFamily: 'Inter, sans-serif', color: '#222', lineHeight: 1.8 }}>
      <Helmet>
        <title>Privacy Policy | The Majorities</title>
        <meta name="description" content="How The Majorities collects, uses and shares information, including cookies used by Google and other advertising and analytics partners." />
        <link rel="canonical" href="https://themajorities.com/privacy" />
      </Helmet>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Privacy Policy</h1>
      <p style={{ color: '#888', fontSize: '13px', marginBottom: '40px' }}>Last updated: September 25, 2026</p>

      <p>This policy explains how {BUSINESS.legalName}, doing business as {BUSINESS.dba} (“we”, “us”), collects, uses and shares information when you visit themajorities.com, use our app, or buy our products.</p>

      <h2 style={h2}>1. Information we collect</h2>
      <p><strong>Information you give us:</strong> your email address and password (stored hashed), display name, profile photo or video, social profile links you choose to add, perspectives, recommendations, partner applications, marketplace listings, messages you send to other members, and the products you choose when you order.</p>
      <p><strong>Order information:</strong> your name, shipping address and order details. Card payments are processed by Stripe; we never see or store your full card number.</p>
      <p><strong>Information collected automatically:</strong> device and browser type, IP address, pages viewed, referring pages, and similar usage data, collected through cookies, local storage and similar technologies.</p>
      <p><strong>Sign-in providers:</strong> if you sign in with Google, Apple, Instagram or TikTok, we receive your email address and basic profile information from that provider.</p>

      <h2 style={h2}>2. How we use information</h2>
      <p>We use information to run your account and the community features (the Duma, Perspectives, points and ranks, messaging), process and ship orders, provide customer support, keep the service safe and moderate content, understand how the site is used, show advertising, and meet legal obligations.</p>

      <h2 style={h2}>3. Advertising and cookies</h2>
      <p>We use Google AdSense to show ads on our site. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites.</p>
      <p>Google’s use of advertising cookies enables it and its partners to serve ads to you based on your visits to our site and/or other sites on the Internet.</p>
      <p>You may opt out of personalized advertising by visiting Google <a href="https://www.google.com/settings/ads" {...ext}>Ads Settings</a>. You can also opt out of some third-party vendors’ use of cookies for personalized advertising at <a href="https://www.aboutads.info/choices/" {...ext}>www.aboutads.info/choices</a> or <a href="https://optout.networkadvertising.org/" {...ext}>optout.networkadvertising.org</a>. To learn how Google uses information from sites that use its services, see <a href="https://policies.google.com/technologies/partner-sites" {...ext}>How Google uses information from sites or apps that use our services</a>.</p>
      <p>If other ad networks serve ads on our site, they may also use cookies and similar technologies in the same way. You can block or delete cookies in your browser settings; some features, such as staying signed in, may not work without them.</p>

      <h2 style={h2}>4. Analytics</h2>
      <p>We use Google Analytics and Google Tag Manager to understand how visitors use the site. These services set cookies and receive usage data such as pages viewed and device information. You can install the <a href="https://tools.google.com/dlpage/gaoptout" {...ext}>Google Analytics opt-out browser add-on</a>.</p>

      <h2 style={h2}>5. How we share information</h2>
      <p>We do not sell your personal information. We share it only with service providers that help us run the business, including Stripe (payments), ShipBob (order fulfillment and shipping), Cloudinary (image and video hosting), our hosting and database providers, Google (advertising and analytics) and the sign-in providers you choose. We may also disclose information when required by law or to protect the safety of our members.</p>
      <p><strong>Public content:</strong> perspectives, recommendations and marketplace listings you post on the Duma are public, along with your display name, rank and profile photo. Anyone, including search engines, can see them.</p>

      <h2 style={h2}>6. Your choices and rights</h2>
      <p>You can update your profile or delete your account from your Profile page. You can ask us for a copy of your information, or ask us to correct or delete it, by emailing <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>. Depending on where you live, you may have additional rights under local privacy laws, and we will honor them as required.</p>

      <h2 style={h2}>7. Data retention and security</h2>
      <p>We keep information for as long as your account is active or as needed to provide the service, fulfill orders and meet legal and tax obligations. We use reasonable safeguards, but no online service can be completely secure.</p>

      <h2 style={h2}>8. Children</h2>
      <p>Our service is not directed to children under 13, and we do not knowingly collect personal information from them. If you believe a child has given us information, contact us and we will delete it.</p>

      <h2 style={h2}>9. Changes to this policy</h2>
      <p>We may update this policy from time to time. We will change the “Last updated” date above and, for significant changes, notify signed-in members.</p>

      <h2 style={h2}>10. Contact us</h2>
      <p>
        {BUSINESS.legalName} ({BUSINESS.dba})<br />
        {BUSINESS.streetAddress}, {BUSINESS.city}, {BUSINESS.region} {BUSINESS.postalCode}<br />
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> · <Link to="/contact">Contact page</Link>
      </p>
    </div>
  );
};
