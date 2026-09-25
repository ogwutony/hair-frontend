// src/pages/ContactPage.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { BUSINESS } from '../utils/business';

const page = { maxWidth: '860px', margin: '0 auto', padding: '60px 30px', fontFamily: 'Inter, sans-serif', color: '#222', lineHeight: 1.8 };
const h2 = { fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' };

export const ContactPage = () => (
  <div style={page}>
    <Helmet>
      <title>Contact Us | The Majorities</title>
      <meta name="description" content="Contact The Majorities (Majority Hair Solution LLC) in Fort Worth, Texas — email, phone and mailing address for orders, partnerships and press." />
      <link rel="canonical" href="https://themajorities.com/contact" />
    </Helmet>
    <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Contact Us</h1>
    <p style={{ color: '#555' }}>Questions about an order, a product, partnerships, advertising or press? We’re happy to help.</p>

    <address style={{ fontStyle: 'normal', border: '1px solid #eee', borderRadius: '16px', padding: '24px', marginTop: '24px' }}>
      <strong style={{ fontSize: '18px' }}>{BUSINESS.legalName}</strong><br />
      <span style={{ color: '#555' }}>doing business as {BUSINESS.dba}</span><br /><br />
      {BUSINESS.streetAddress}<br />
      {BUSINESS.city}, {BUSINESS.region} {BUSINESS.postalCode}<br />
      United States<br /><br />
      Email: <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a><br />
      Phone: <a href={`tel:${BUSINESS.phone}`}>{BUSINESS.phoneDisplay}</a>
    </address>

    <h2 style={h2}>Orders and returns</h2>
    <p>Orders ship from our Fort Worth, Texas fulfillment center. For order status or a return, email us with your order number. See our <Link to="/returns">Return Policy</Link>.</p>

    <h2 style={h2}>Partnerships and wholesale</h2>
    <p>Retailers, creators and brands can apply through our <Link to="/partner">Partner page</Link> or email us directly.</p>

    <h2 style={h2}>Community and privacy</h2>
    <p>To report content on the Duma or ask about your data, email us or read our <Link to="/privacy">Privacy Policy</Link>. We aim to reply within two business days.</p>
  </div>
);
