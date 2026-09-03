import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CredentialHeader } from '../components/CredentialHeader';
import { GuestSubmissionPrompt } from '../components/GuestSubmissionPrompt';
import { BACKEND_URL } from '../utils/constants';
import { styles } from '../utils/styles';

export const PartnerPage = ({ userEmail, rankTitle, rankScore, authToken, userAvatar }) => {
  const [formData, setFormData] = useState({ name: '', socialHandle: '', city: '', partnerType: 'Creator', whyFit: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!authToken) return setErrorMsg('Log in or register to apply.');
    try {
      const response = await fetch(`${BACKEND_URL}/api/duma/partner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + authToken },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Application failed');
      setSubmitted(true);
    } catch {
      setErrorMsg('We could not submit your application. Please try again.');
    }
  };

  if (submitted) return <div style={{ padding: '60px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
    <h2>Application received!</h2><p>We review applications weekly and will follow up within 7 days.</p>
    <Link to="/duma" style={styles.authButton}>Visit The Duma</Link>
  </div>;

  const tracks = [
    ['Creator / Influencer Partners', 'Beauty, grooming, and lifestyle creators who share honest routines and product experiences.'],
    ['Community / Venue Partners', 'Local Dallas spots, run clubs, barbershops, salons, and event organizers who bring people together.'],
    ['Brand & Retail Partners', 'Independent beauty and grooming brands seeking native sponsored placements and verified brand visibility in The Duma.']
  ];
  return <div style={{ padding: '40px 20px', maxWidth: '980px', margin: '0 auto' }}>
    <h1>Partner with The Majorities</h1>
    <p style={{ fontSize: '17px', lineHeight: 1.7, maxWidth: '760px' }}>We partner with creators, run clubs, barbershops, salons, and community organizers who already live the lifestyle. Authenticity and community alignment matter more than follower count.</p>
    {userEmail && rankTitle && <CredentialHeader email={userEmail} rankTitle={rankTitle} rankScore={rankScore} avatarUrl={userAvatar} />}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', margin: '30px 0' }}>
      {tracks.map(([title, text]) => <section key={title} style={styles.dumaCard}><h2 style={{ fontSize: '18px' }}>{title}</h2><p style={{ color: '#666', lineHeight: 1.6 }}>{text}</p></section>)}
    </div>
    <section style={{ ...styles.dumaCard, background: '#f4f9f4' }}><h2 style={{ fontSize: '18px' }}>Partner benefits</h2><p>Free product, a verified feature in The Duma Partners tab, an ambassador badge, and a custom referral code with 10–15% commission.</p></section>
    <section style={{ ...styles.dumaCard, marginTop: '16px' }}><strong>EcoHair Labs, existing Duma partner:</strong><p style={{ marginBottom: 0 }}>“The Majorities gives us a direct, authentic way to meet people who care about their routines.”</p></section>
    <section style={{ ...styles.dumaCard, marginTop: '16px' }}><strong>Sample brief:</strong><p style={{ marginBottom: 0 }}>We’ll send you a full set, you document your honest experience over 2 weeks, share one post/Reel with #TheMajorities, and we’ll feature your content on The Duma.</p></section>
    <section style={{ ...styles.dumaCard, marginTop: '30px' }}>
      <h2>Apply to partner</h2>
      <p style={{ color: '#666' }}>Tell us how you connect with your community.</p>
      {errorMsg && <p style={{ color: '#c0392b' }}>{errorMsg}</p>}
      {!authToken && <GuestSubmissionPrompt message="Log in or register to apply to partner with The Majorities." />}
      <form onSubmit={handleSubmit}>
        <input required placeholder="Name" style={styles.input} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
        <input required placeholder="Instagram/TikTok Handle" style={styles.input} value={formData.socialHandle} onChange={e => setFormData({ ...formData, socialHandle: e.target.value })} />
        <input required placeholder="City" style={styles.input} value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
        <select required style={styles.input} value={formData.partnerType} onChange={e => setFormData({ ...formData, partnerType: e.target.value })}><option>Creator</option><option>Community</option></select>
        <textarea required maxLength="280" placeholder="Why you're a fit (one sentence)" style={{ ...styles.input, height: '90px' }} value={formData.whyFit} onChange={e => setFormData({ ...formData, whyFit: e.target.value })} />
        <button type="submit" style={styles.authButton}>Apply to Partner</button>
        <p style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>We review applications weekly and will follow up within 7 days.</p>
      </form>
    </section>
  </div>;
};
