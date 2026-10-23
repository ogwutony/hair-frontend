import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export const BANNER_ITEMS = [
  {
    id: 1,
    text: 'BUILD YOUR 6-BOTTLE CUSTOM SET — Mix and match any bottles for $54.99',
    tag: 'CUSTOM BUNDLE',
    cta: 'Build Yours',
    link: '/#custom-set',
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
    text: 'Subscribe & Save: Get daily essentials delivered for $14.99/bottle',
    tag: 'SUBSCRIBE',
    cta: 'Shop All',
    link: '/#subscribe',
  },
];

const ROTATE_MS = 5000;

export function AnnouncementBanner({ onOpenWaitlist }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = BANNER_ITEMS.length;
  const current = BANNER_ITEMS[index];

  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, count]);

  const scrollToHash = () => {
    // Re-clicking the same hash link doesn't re-trigger the route's scroll effect
    const id = current.link.split('#')[1];
    if (id && window.location.pathname === '/') document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className="ms-promo"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="ms-promo-dots">
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
      <div className="ms-promo-body">
        <span className="ms-promo-tag">{current.tag}</span>
        <span className="ms-promo-text">{current.text}</span>
        {current.action === 'openWaitlist' ? (
          <button type="button" className="ms-promo-cta" onClick={onOpenWaitlist}>
            {current.cta} <span aria-hidden="true">→</span>
          </button>
        ) : (
          <Link to={current.link} className="ms-promo-cta" onClick={scrollToHash}>
            {current.cta} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
      <div className="ms-promo-arrows">
        <button type="button" onClick={() => setIndex((i) => (i - 1 + count) % count)} aria-label="Previous slide">&#8249;</button>
        <button type="button" onClick={() => setIndex((i) => (i + 1) % count)} aria-label="Next slide">&#8250;</button>
      </div>
    </div>
  );
}
