import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export const BANNER_ITEMS = [
  {
    id: 1,
    text: 'BUILD YOUR 6-BOTTLE CUSTOM SET — Mix and match any bottles for $54.99',
    tag: 'CUSTOM BUNDLE',
    cta: 'Build Yours',
    link: '#custom-set',
  },
  {
    id: 2,
    text: 'THE MAJORITIES: Made in Dallas, TX USA • A company of the people, by the people, for the people',
    tag: 'OUR MISSION',
    cta: 'Our Story',
    link: '/about',
  },
  {
    id: 3,
    text: 'Pre-Orders Open: Join the VIP waitlist for early drop access & special perks',
    tag: 'WAITLIST',
    cta: 'Get On List',
    action: 'openWaitlist',
  },
  {
    id: 4,
    text: 'Skin & hair care for every one of us. Subscribe for $14.99/bottle — 3 or 6-bottle bundles, delivered on your schedule. Pause or cancel anytime.',
    tag: 'SUBSCRIBE',
    cta: 'Shop Essentials',
    link: '#subscribe',
  },
];

const ROTATE_MS = 6000;

// Featured banner at the top of the shop. All slides share one grid cell so the
// banner keeps the height of the tallest slide and nothing jumps while rotating.
export function AnnouncementBanner({ onOpenWaitlist }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = BANNER_ITEMS.length;

  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, count]);

  const scrollTo = (hash) => {
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderCta = (item) => {
    const label = <>{item.cta} <span aria-hidden="true">→</span></>;
    if (item.action === 'openWaitlist') {
      return <button type="button" className="ms-btn ms-feature-cta" onClick={onOpenWaitlist}>{label}</button>;
    }
    if (item.link.startsWith('#')) {
      return <button type="button" className="ms-btn ms-feature-cta" onClick={() => scrollTo(item.link)}>{label}</button>;
    }
    return <Link to={item.link} className="ms-btn ms-feature-cta">{label}</Link>;
  };

  return (
    <section
      className="ms-feature"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <h1 className="ms-sr-only">Skin and hair care for every one of us.</h1>
      <div className="ms-feature-slides">
        {BANNER_ITEMS.map((item, i) => (
          <div
            key={item.id}
            className={`ms-feature-slide${i === index ? ' active' : ''}`}
            aria-hidden={i !== index}
          >
            <span className="ms-feature-tag">{item.tag}</span>
            <p className="ms-feature-text">{item.text}</p>
            {renderCta(item)}
          </div>
        ))}
      </div>
      <div className="ms-feature-nav">
        <div className="ms-feature-dots">
          {BANNER_ITEMS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={i === index ? 'active' : ''}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
            />
          ))}
        </div>
        <div className="ms-feature-arrows">
          <button type="button" onClick={() => setIndex((i) => (i - 1 + count) % count)} aria-label="Previous slide">&#8249;</button>
          <button type="button" onClick={() => setIndex((i) => (i + 1) % count)} aria-label="Next slide">&#8250;</button>
        </div>
      </div>
    </section>
  );
}
