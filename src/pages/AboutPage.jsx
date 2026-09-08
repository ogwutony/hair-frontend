// src/pages/AboutPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const FONT = "'SF Pro Display', 'Inter', 'Helvetica Neue', sans-serif";

const PRODUCTS = ['SHAMPOO', 'CONDITIONER', 'HAIR OIL', 'FACIAL SCRUB', 'FACIAL TONER', 'MOISTURIZING LOTION'];

const PILLARS = [
  {
    title: 'Universal Performance',
    desc: 'Formulas tested across all hair textures and skin types. No compromises, no exceptions.',
  },
  {
    title: 'Standardized Design',
    desc: 'A consistent system of packaging and dosage so your routine stays clean, simple, and repeatable.',
  },
  {
    title: 'Accessible Quality',
    desc: 'Premium ingredients at honest prices. Quality care should never be a luxury for the few.',
  },
];

export function AboutPage() {
  return (
    <div style={{ fontFamily: FONT, background: '#fff', color: '#000' }}>
      <Helmet>
        <title>About — The Majorities</title>
      </Helmet>

      {/* Hero */}
      <section style={{ padding: '140px 60px', textAlign: 'center', background: '#000', color: '#fff' }}>
        <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: '700', letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 24px' }}>
          Premium care.<br />Uncompromised.
        </h1>
        <p style={{ fontSize: '21px', color: '#86868b', fontWeight: '400', margin: '0 auto 52px', maxWidth: '560px', lineHeight: 1.55 }}>
          Clean-beauty essentials engineered for the multicultural market.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            background: '#fff',
            color: '#000',
            padding: '16px 42px',
            borderRadius: '980px',
            fontWeight: '600',
            fontSize: '17px',
            textDecoration: 'none',
            letterSpacing: '-0.01em',
          }}
        >
          Shop The Set
        </Link>
      </section>

      {/* Philosophy */}
      <section style={{ padding: '140px 60px', textAlign: 'center', background: '#fff' }}>
        <p style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.08em', color: '#86868b', marginBottom: '24px', textTransform: 'uppercase' }}>
          Our Philosophy
        </p>
        <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '700', letterSpacing: '-0.025em', margin: '0 auto 36px', maxWidth: '640px', lineHeight: 1.1 }}>
          The standard, elevated.
        </h2>
        <p style={{ fontSize: '19px', color: '#444', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7, fontWeight: '400' }}>
          The personal care market has always been fragmented — products designed for one hair type, one skin tone, one standard. We built The Majorities to change that. Every formula, every bottle, engineered to perform at the highest level for every background.
        </p>
      </section>

      {/* Architecture */}
      <section style={{ padding: '120px 60px', background: '#000', color: '#fff', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.08em', color: '#86868b', marginBottom: '24px', textTransform: 'uppercase' }}>
          The Architecture
        </p>
        <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '700', letterSpacing: '-0.025em', margin: '0 auto 80px', maxWidth: '640px', lineHeight: 1.1 }}>
          Precision in every bottle.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', maxWidth: '960px', margin: '0 auto', textAlign: 'left' }}>
          {PILLARS.map((p) => (
            <div key={p.title} style={{ borderTop: '1px solid #333', paddingTop: '32px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '16px', letterSpacing: '-0.015em' }}>
                {p.title}
              </h3>
              <p style={{ fontSize: '15px', color: '#86868b', lineHeight: 1.7, margin: 0 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Essentials */}
      <section style={{ padding: '120px 60px', textAlign: 'center', background: '#fff' }}>
        <p style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.08em', color: '#86868b', marginBottom: '48px', textTransform: 'uppercase' }}>
          The Essentials
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', borderTop: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}>
          {PRODUCTS.map((product, i) => (
            <span
              key={product}
              style={{
                padding: '24px 32px',
                fontSize: '13px',
                fontWeight: '600',
                letterSpacing: '0.06em',
                color: '#000',
                borderRight: i < PRODUCTS.length - 1 ? '1px solid #e0e0e0' : 'none',
              }}
            >
              {product}
            </span>
          ))}
        </div>
      </section>

      {/* Origin */}
      <section style={{ padding: '140px 60px', background: '#f5f5f7', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.08em', color: '#86868b', marginBottom: '24px', textTransform: 'uppercase' }}>
          Origin
        </p>
        <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '700', letterSpacing: '-0.025em', margin: '0 auto 36px', maxWidth: '640px', lineHeight: 1.1 }}>
          Designed in Texas.<br />Built for everyone.
        </h2>
        <p style={{ fontSize: '19px', color: '#444', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7, fontWeight: '400' }}>
          Founded by Tony Ogwu in Fort Worth, The Majorities started with a simple conviction: the best personal care should belong to everyone. From the heart of Texas to every bathroom shelf.
        </p>
      </section>

      {/* Footer CTA */}
      <section style={{ padding: '140px 60px', textAlign: 'center', background: '#000', color: '#fff' }}>
        <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: '700', letterSpacing: '-0.03em', margin: '0 0 52px', lineHeight: 1.05 }}>
          Build your routine.
        </h2>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            background: '#fff',
            color: '#000',
            padding: '16px 42px',
            borderRadius: '980px',
            fontWeight: '600',
            fontSize: '17px',
            textDecoration: 'none',
            letterSpacing: '-0.01em',
          }}
        >
          View Bundles
        </Link>
        <div style={{ marginTop: '64px', display: 'flex', justifyContent: 'center', gap: '32px' }}>
          <Link to="/TermsofService" style={{ color: '#86868b', fontSize: '13px', textDecoration: 'none' }}>
            Terms of Service
          </Link>
          <Link to="/privacy" style={{ color: '#86868b', fontSize: '13px', textDecoration: 'none' }}>
            Privacy Policy
          </Link>
        </div>
      </section>
    </div>
  );
}
