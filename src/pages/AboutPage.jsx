// src/pages/AboutPage.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const FONT = '-apple-system, "SF Pro Display", "Helvetica Neue", Inter, sans-serif';

const commitments = [
  { title: 'Sustainability', desc: 'Responsibly sourced, minimal waste.' },
  { title: 'Inclusive', desc: 'For every texture and type.' },
  { title: 'Cruelty-Free', desc: 'Never tested on animals.' },
  { title: 'Accessible', desc: 'Honest subscription pricing.' },
  ];

const testimonials = [
  { quote: 'The set makes my routine feel considered, not complicated.', name: 'Maya T.' },
  { quote: 'I love getting the products I use every month for less.', name: 'Jordan R.' },
  { quote: 'Finally, everyday care that works with my hair and my budget.', name: 'Alex P.' },
  ];

export function AboutPage() {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
        let t;
        const onResize = () => { clearTimeout(t); t = setTimeout(() => setIsMobile(window.innerWidth <= 768), 150); };
        window.addEventListener('resize', onResize);
        return () => { clearTimeout(t); window.removeEventListener('resize', onResize); };
  }, []);

  const s = {
        page: { fontFamily: FONT, background: '#ffffff', color: '#000000' },

        // Hero
        hero: {
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: isMobile ? '80px 28px' : '120px 60px',
                background: '#ffffff',
        },
        heroEyebrow: {
                fontSize: '13px',
                fontWeight: '600',
                letterSpacing: '0.06em',
                color: '#86868B',
                marginBottom: '24px',
                textTransform: 'uppercase',
        },
        heroH1: {
                fontSize: isMobile ? '42px' : '76px',
                fontWeight: '700',
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                color: '#000000',
                maxWidth: '820px',
                margin: '0 auto 28px',
        },
        heroSub: {
                fontSize: isMobile ? '17px' : '21px',
                fontWeight: '400',
                lineHeight: 1.55,
                color: '#86868B',
                maxWidth: '520px',
                margin: '0 auto 48px',
        },
        heroCta: {
                display: 'inline-block',
                padding: '16px 36px',
                background: '#000000',
                color: '#ffffff',
                borderRadius: '980px',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '600',
                letterSpacing: '0.01em',
        },

        // Mission
        mission: {
                background: '#F5F5F7',
                padding: isMobile ? '96px 28px' : '140px 60px',
                textAlign: 'center',
        },
        missionInner: { maxWidth: '600px', margin: '0 auto' },
        sectionLabel: {
                fontSize: '13px',
                fontWeight: '600',
                letterSpacing: '0.06em',
                color: '#86868B',
                textTransform: 'uppercase',
                marginBottom: '20px',
        },
        missionH2: {
                fontSize: isMobile ? '32px' : '52px',
                fontWeight: '700',
                lineHeight: 1.08,
                letterSpacing: '-0.025em',
                color: '#000000',
                margin: '0 0 28px',
        },
        missionP: {
                fontSize: '17px',
                lineHeight: 1.7,
                color: '#86868B',
                margin: 0,
        },

        // Commitments
        commitments: {
                background: '#ffffff',
                padding: isMobile ? '96px 28px' : '140px 60px',
        },
        commitmentsInner: { maxWidth: '1000px', margin: '0 auto' },
        commitmentsH2: {
                fontSize: isMobile ? '32px' : '52px',
                fontWeight: '700',
                lineHeight: 1.08,
                letterSpacing: '-0.025em',
                color: '#000000',
                textAlign: 'center',
                margin: '0 0 72px',
        },
        grid: {
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? '2px' : '2px',
        },
        gridCell: {
                borderTop: '1px solid #e0e0e5',
                padding: isMobile ? '36px 0' : '48px 40px 48px 0',
        },
        gridTitle: {
                fontSize: '19px',
                fontWeight: '700',
                color: '#000000',
                margin: '0 0 10px',
                letterSpacing: '-0.01em',
        },
        gridDesc: {
                fontSize: '15px',
                lineHeight: 1.6,
                color: '#86868B',
                margin: 0,
        },

        // Story
        story: {
                background: '#F5F5F7',
                padding: isMobile ? '96px 28px' : '140px 60px',
        },
        storyInner: { maxWidth: '680px', margin: '0 auto' },
        storyH2: {
                fontSize: isMobile ? '32px' : '52px',
                fontWeight: '700',
                lineHeight: 1.08,
                letterSpacing: '-0.025em',
                color: '#000000',
                margin: '0 0 32px',
        },
        storyP: {
                fontSize: '17px',
                lineHeight: 1.75,
                color: '#86868B',
                margin: '0 0 24px',
        },

        // Testimonials
        testimonials: {
                background: '#ffffff',
                padding: isMobile ? '96px 28px' : '140px 60px',
        },
        testimonialsInner: { maxWidth: '1000px', margin: '0 auto' },
        testimonialsH2: {
                fontSize: isMobile ? '32px' : '52px',
                fontWeight: '700',
                lineHeight: 1.08,
                letterSpacing: '-0.025em',
                color: '#000000',
                textAlign: 'center',
                margin: '0 0 72px',
        },
        testimonialGrid: {
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
                gap: '40px',
        },
        testimonialCard: {
                borderTop: '1px solid #e0e0e5',
                paddingTop: '32px',
        },
        quoteMark: {
                fontSize: '56px',
                lineHeight: 1,
                color: '#e0e0e5',
                fontFamily: 'Georgia, serif',
                marginBottom: '16px',
                display: 'block',
        },
        quoteText: {
                fontSize: '16px',
                lineHeight: 1.65,
                color: '#000000',
                margin: '0 0 20px',
                fontStyle: 'italic',
        },
        quoteName: {
                fontSize: '13px',
                fontWeight: '600',
                color: '#86868B',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
        },

        // Footer CTA
        footerCta: {
                background: '#F5F5F7',
                padding: isMobile ? '96px 28px' : '140px 60px',
                textAlign: 'center',
        },
        footerCtaH2: {
                fontSize: isMobile ? '36px' : '64px',
                fontWeight: '700',
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                color: '#000000',
                margin: '0 0 40px',
        },
        footerCtaBtn: {
                display: 'inline-block',
                padding: '16px 40px',
                background: '#000000',
                color: '#ffffff',
                borderRadius: '980px',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '600',
                marginBottom: '48px',
        },
        footerLinks: {
                display: 'flex',
                gap: '28px',
                justifyContent: 'center',
                flexWrap: 'wrap',
        },
        footerLink: {
                fontSize: '13px',
                color: '#86868B',
                textDecoration: 'none',
        },
  };

  return (
        <div style={s.page}>
                <Helmet>
                        <title>About | The Majorities</title>
                        <meta name="description" content="The Majorities — effective, inclusive everyday haircare. Our mission, commitments, and story." />
                        <link rel="canonical" href="https://themajorities.com/about" />
                </Helmet>
        
          {/* Hero */}
              <section style={s.hero}>
                      <p style={s.heroEyebrow}>The Majorities</p>
                      <h1 style={s.heroH1}>Better care for every hair story.</h1>
                      <p style={s.heroSub}>Effective, inclusive everyday haircare.</p>
                      <Link to="/" style={s.heroCta}>Build Your Set</Link>
              </section>
        
          {/* Mission */}
              <section style={s.mission}>
                      <div style={s.missionInner}>
                                <p style={s.sectionLabel}>Mission</p>
                                <h2 style={s.missionH2}>No compromise.</h2>
                                <p style={s.missionP}>
                                            We believe everyone deserves a set that actually works for them,
                                            without having to hunt across five brands or stretch a budget.
                                            That belief is the foundation — formula by formula, texture by texture.
                                </p>
                      </div>
              </section>
        
          {/* Commitments */}
              <section style={s.commitments}>
                      <div style={s.commitmentsInner}>
                                <h2 style={s.commitmentsH2}>What we stand for.</h2>
                                <div style={s.grid}>
                                  {commitments.map(({ title, desc }) => (
                        <div key={title} style={s.gridCell}>
                                        <h3 style={s.gridTitle}>{title}</h3>
                                        <p style={s.gridDesc}>{desc}</p>
                        </div>
                      ))}
                                </div>
                      </div>
              </section>
        
          {/* Story */}
              <section style={s.story}>
                      <div style={s.storyInner}>
                                <p style={s.sectionLabel}>Our Story</p>
                                <h2 style={s.storyH2}>Built for you.</h2>
                                <p style={s.storyP}>
                                            Most mainstream brands treat diverse hair as an edge case.
                                            We start with range as the foundation, testing formulas across all
                                            textures so your set is truly yours.
                                </p>
                                <p style={{ ...s.storyP, marginBottom: 0 }}>
                                            The Majorities means everyone. That&apos;s not a tagline — it&apos;s the spec
                                            every formula has to meet before it earns a place in your set.
                                </p>
                      </div>
              </section>
        
          {/* Testimonials */}
              <section style={s.testimonials}>
                      <div style={s.testimonialsInner}>
                                <h2 style={s.testimonialsH2}>What people are saying.</h2>
                                <div style={s.testimonialGrid}>
                                  {testimonials.map(({ quote, name }) => (
                        <div key={name} style={s.testimonialCard}>
                                        <span style={s.quoteMark}>&ldquo;</span>
                                        <p style={s.quoteText}>{quote}</p>
                                        <span style={s.quoteName}>{name}</span>
                        </div>
                      ))}
                                </div>
                      </div>
              </section>
        
          {/* Footer CTA */}
              <section style={s.footerCta}>
                      <h2 style={s.footerCtaH2}>Build your custom set.</h2>
                      <div>
                                <Link to="/" style={s.footerCtaBtn}>Get Started</Link>
                      </div>
                      <div style={s.footerLinks}>
                                <Link to="/TermsofService" style={s.footerLink}>Terms of Service</Link>
                                <Link to="/privacy" style={s.footerLink}>Privacy Policy</Link>
                      </div>
              </section>
        </div>
      );
}
