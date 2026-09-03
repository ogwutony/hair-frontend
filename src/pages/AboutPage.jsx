// src/pages/AboutPage.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export function AboutPage() {
const MOBILE_BREAKPOINT = 768;
const [isMobile, setIsMobile] = useState(() => window.innerWidth <= MOBILE_BREAKPOINT);

useEffect(() => {
let debounceTimer;
const handleResize = () => {
clearTimeout(debounceTimer);
debounceTimer = setTimeout(() => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT), 150);
};
window.addEventListener('resize', handleResize);
return () => { clearTimeout(debounceTimer); window.removeEventListener('resize', handleResize); };
}, []);

const values = [
{
icon: '🌿',
title: 'Sustainability First',
desc: 'Every formula is developed with the environment in mind — from responsibly sourced ingredients to packaging that minimizes waste. We believe good hair days shouldn\'t cost the planet.'
},
{
icon: '🤝',
title: 'Radically Inclusive',
desc: 'We make haircare that works for every texture, every type, every person. No asterisks, no exceptions. The Majorities means all of us.'
},
{
icon: '🐰',
title: 'Cruelty-Free, Always',
desc: 'Our products are never tested on animals. Full stop. We hold every ingredient and every supplier to that same standard.'
},
{
icon: '💰',
title: 'Accessible Pricing',
desc: 'Premium haircare shouldn\'t be a luxury. Our subscription model keeps costs honest so your routine stays consistent — month after month.'
},
];

const testimonials = [
['★★★★★', '"The set makes my routine feel considered, not complicated."', '— Maya T.'],
['★★★★★', '"I love being able to get the products I use every month for less."', '— Jordan R.'],
['★★★★★', '"Finally, everyday care that works with my hair and my budget."', '— Alex P.'],
];

return (
<div>
<Helmet>
<title>About Us | The Majorities</title>
<meta name="description" content="Learn about The Majorities — our mission, values, and commitment to inclusive, sustainable, cruelty-free haircare for everyone." />
<link rel="canonical" href="https://themajorities.com/about" />
</Helmet>

{/* Hero */}
<section style={{
background: '#f4f9f4',
padding: isMobile ? '60px 24px' : '80px 60px',
textAlign: 'center',
borderBottom: '1px solid #dce9dc'
}}>
<p style={{
margin: '0 0 14px',
fontSize: '12px',
fontWeight: '700',
letterSpacing: '1.8px',
textTransform: 'uppercase',
color: '#2d6a4f'
}}>
Haircare for every majority
</p>
<h1 style={{
maxWidth: '760px',
margin: '0 auto 20px',
fontSize: isMobile ? '34px' : '50px',
lineHeight: 1.1,
fontWeight: '800',
color: '#1a1a1a'
}}>
Better care for every hair story.
</h1>
<p style={{
maxWidth: '680px',
margin: '0 auto 32px',
fontSize: '17px',
lineHeight: 1.75,
color: '#444'
}}>
The Majorities makes effective, everyday haircare accessible to all. We champion inclusive self-care, thoughtful formulas, and more sustainable routines — so building a set that fits you feels simple and good.
</p>
<Link
to="/"
style={{
display: 'inline-block',
padding: '14px 32px',
background: '#222',
color: '#fff',
borderRadius: '8px',
textDecoration: 'none',
fontSize: '14px',
fontWeight: '700',
letterSpacing: '0.5px'
}}
>
Build Your Set →
</Link>
</section>

{/* Mission */}
<section style={{
padding: isMobile ? '52px 24px' : '72px 60px',
maxWidth: '900px',
margin: '0 auto',
textAlign: 'center'
}}>
<p style={{
margin: '0 0 12px',
fontSize: '12px',
fontWeight: '700',
letterSpacing: '1.5px',
textTransform: 'uppercase',
color: '#2d6a4f'
}}>
Our Mission
</p>
<h2 style={{
fontSize: isMobile ? '26px' : '36px',
fontWeight: '800',
color: '#1a1a1a',
margin: '0 0 20px',
lineHeight: 1.2
}}>
Care that doesn't ask you to compromise.
</h2>
<p style={{
fontSize: '16px',
lineHeight: 1.8,
color: '#555',
margin: 0
}}>
Too many haircare brands treat inclusivity as a marketing angle — a product line with "for coily hair" in small print, or a price point that makes building a real routine feel out of reach. The Majorities started from a different place: the belief that everyone deserves a set that actually works for them, without having to hunt across five brands or stretch a budget. We build our line around that commitment, and we hold it to account formula by formula.
</p>
</section>

{/* Values */}
<section style={{
background: '#fafafa',
borderTop: '1px solid #eee',
borderBottom: '1px solid #eee',
padding: isMobile ? '52px 24px' : '72px 60px'
}}>
<div style={{ maxWidth: '1100px', margin: '0 auto' }}>
<p style={{
margin: '0 0 12px',
fontSize: '12px',
fontWeight: '700',
letterSpacing: '1.5px',
textTransform: 'uppercase',
color: '#2d6a4f',
textAlign: 'center'
}}>
What we stand for
</p>
<h2 style={{
fontSize: isMobile ? '26px' : '34px',
fontWeight: '800',
color: '#1a1a1a',
margin: '0 0 40px',
textAlign: 'center',
lineHeight: 1.2
}}>
Our commitments, not just our claims.
</h2>
<div style={{
display: 'grid',
gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
gap: '24px'
}}>
{values.map(({ icon, title, desc }) => (
<div key={title} style={{
background: '#fff',
border: '1px solid #e8e8e8',
borderRadius: '14px',
padding: '28px 30px'
}}>
<div style={{ fontSize: '28px', marginBottom: '12px' }}>{icon}</div>
<h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>{title}</h3>
<p style={{ margin: 0, fontSize: '14px', lineHeight: 1.7, color: '#555' }}>{desc}</p>
</div>
))}
</div>
</div>
</section>

{/* Story */}
<section style={{
padding: isMobile ? '52px 24px' : '72px 60px',
maxWidth: '860px',
margin: '0 auto'
}}>
<p style={{
margin: '0 0 12px',
fontSize: '12px',
fontWeight: '700',
letterSpacing: '1.5px',
textTransform: 'uppercase',
color: '#2d6a4f'
}}>
The story
</p>
<h2 style={{
fontSize: isMobile ? '26px' : '34px',
fontWeight: '800',
color: '#1a1a1a',
margin: '0 0 24px',
lineHeight: 1.2
}}>
Built for the people who weren't the target market.
</h2>
<p style={{ fontSize: '16px', lineHeight: 1.8, color: '#555', margin: '0 0 18px' }}>
The name says it: The Majorities. Most people in this world have hair and skin that mainstream brands treat as an edge case. Dense, coily, fine, oily, sensitive — the routines that work for "everyone" rarely work for the everyone who actually exists.
</p>
<p style={{ fontSize: '16px', lineHeight: 1.8, color: '#555', margin: '0 0 18px' }}>
We set out to build something different. A product line that starts with range, not as an afterthought but as the foundation. Formulas tested across textures. Pricing structured so a subscription actually saves money. A set builder that treats your six products as yours — because they are.
</p>
<p style={{ fontSize: '16px', lineHeight: 1.8, color: '#555', margin: 0 }}>
This is still early. We're growing the line, deepening the formulas, and listening. If you've been underserved by haircare before — so have we. That's why we built this.
</p>
</section>

{/* Testimonials */}
<section style={{
background: '#f4f9f4',
borderTop: '1px solid #dce9dc',
padding: isMobile ? '52px 24px' : '72px 60px',
textAlign: 'center'
}}>
<p style={{
margin: '0 0 12px',
fontSize: '12px',
fontWeight: '700',
letterSpacing: '1.5px',
textTransform: 'uppercase',
color: '#2d6a4f'
}}>
From our customers
</p>
<h2 style={{
margin: '0 0 36px',
fontSize: isMobile ? '26px' : '34px',
fontWeight: '800',
color: '#1a1a1a'
}}>
What customers are saying
</h2>
<div style={{
display: 'flex',
flexDirection: isMobile ? 'column' : 'row',
gap: '20px',
maxWidth: '1000px',
margin: '0 auto 40px',
textAlign: 'left'
}}>
{testimonials.map(([rating, quote, name]) => (
<article key={name} style={{
flex: 1,
background: '#fff',
border: '1px solid #dce9dc',
borderRadius: '14px',
padding: '26px'
}}>
<div style={{ color: '#b8860b', marginBottom: '12px', fontSize: '16px' }}>{rating}</div>
<p style={{ margin: '0 0 16px', lineHeight: 1.7, fontSize: '15px', color: '#333' }}>{quote}</p>
<strong style={{ fontSize: '13px', color: '#555' }}>{name}</strong>
</article>
))}
</div>
<Link
to="/"
style={{
display: 'inline-block',
padding: '14px 32px',
background: '#2d6a4f',
color: '#fff',
borderRadius: '8px',
textDecoration: 'none',
fontSize: '14px',
fontWeight: '700',
letterSpacing: '0.5px'
}}
>
Build your custom set →
</Link>
</section>
</div>
);
}
