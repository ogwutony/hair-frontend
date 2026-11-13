// src/pages/RecommendPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CredentialHeader } from '../components/CredentialHeader';
import { GuestSubmissionPrompt } from '../components/GuestSubmissionPrompt';
import { RankBadge } from '../components/RankBadge';
import { BACKEND_URL, POINTS } from '../utils/constants';
import { styles } from '../utils/styles';

export const RecommendPage = ({ addDumaItem, onAddPoints, userEmail, rankTitle, rankScore, authToken, userAvatar }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: "", 
    company: "", 
    productType: "",
    websiteLink: "",
    whyRecommend: "", 
    photo: null,
    video: null
  });
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setShowGuestPrompt(false);

    if (!formData.name || !formData.company || !formData.productType || !formData.websiteLink || !formData.whyRecommend) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (formData.whyRecommend.split(' ').length < 15) {
      setErrorMsg("Justification must be at least 2-3 sentences (15+ words).");
      return;
    }

    try {
      new URL(formData.websiteLink);
    } catch (err) {
      setErrorMsg("Website Link must be a valid URL starting with http:// or https://");
      return;
    }

    if (!authToken) {
      setShowGuestPrompt(true);
      return;
    }

    setIsLoading(true);
    try {
      // The backend takes JSON (name, brand, webLink, reason, mediaUrls), so upload any photo/video first
      const mediaUrls = [];
      for (const file of [formData.photo, formData.video].filter(Boolean)) {
        const upload = new FormData();
        upload.append('file', file);
        upload.append('type', file.type.startsWith('video/') ? 'video' : 'image');
        const uploadRes = await fetch(`${BACKEND_URL}/api/media/upload`, { method: 'POST', headers: { Authorization: `Bearer ${authToken}` }, body: upload });
        const uploadData = await uploadRes.json().catch(() => ({}));
        const url = uploadData.storageUrl || uploadData.secure_url || uploadData.url;
        if (!uploadRes.ok || !url) { setErrorMsg(uploadData.error || `Your ${file.type.startsWith('video/') ? 'video' : 'photo'} failed to upload, so the recommendation was not sent. Please try again.`); setIsLoading(false); return; }
        mediaUrls.push(url);
      }

      const res = await fetch(`${BACKEND_URL}/api/duma/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          name: formData.name.trim(),
          brand: formData.company.trim(),
          webLink: formData.websiteLink.trim(),
          reason: formData.whyRecommend.trim(),
          mediaUrls
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErrorMsg(data.error || `Submission failed (${res.status}). Please try again.`); setIsLoading(false); return; }

      // Use the server's copy (real _id) so votes and comments on it are saved too
      const savedItem = data.item;
      if (!savedItem || !/^[a-f0-9]{24}$/i.test(String(savedItem._id || savedItem.id || ''))) throw new Error('The server did not confirm the recommendation was saved.');
      addDumaItem({ name: formData.name, brand: formData.company, webLink: formData.websiteLink, reason: formData.whyRecommend, mediaUrls, comments: [], ...savedItem, id: savedItem._id || savedItem.id || Date.now(), submittedBy: savedItem.submittedBy || userEmail || "anonymous", submitterRank: savedItem.submitterRank || rankTitle || 'Comrade' });
      if (onAddPoints) onAddPoints(POINTS.RECOMMENDATION);
      setSubmitted(true);
    } catch (err) {
      setErrorMsg("We couldn't reach the server, so your recommendation was not saved. Please check your connection and try again.");
    }
    setIsLoading(false);
  };

  if (submitted) {
    return (
      <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ ...styles.dumaCard, textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}></div>
          <h2 style={{ marginBottom: '10px' }}>Recommendation Submitted!</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Your product recommendation has been sent to The Majorities' Duma Commerce section for community review and voting.</p>
          {rankTitle && <RankBadge rankTitle={rankTitle} />}
          <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/duma?view=recommendations" style={{ ...styles.authButton, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>View the Duma</Link>
            <button style={{ ...styles.authButton, background: '#f5f5f5', color: '#222' }} onClick={() => setSubmitted(false)}>Submit Another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2>Submit Product Recommendation</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>
        Submit products or ideas to The Duma for community review and voting.
      </p>

      {userEmail && rankTitle && <div style={{ marginBottom: '20px' }}><CredentialHeader email={userEmail} rankTitle={rankTitle} rankScore={rankScore} avatarUrl={userAvatar} /></div>}
      {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}
      {showGuestPrompt && <GuestSubmissionPrompt message="Log in or register to submit this recommendation to The Duma." />}

      <form style={styles.dumaCard} onSubmit={handleSubmit}>
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '15px', textTransform: 'uppercase', color: '#222' }}>1. Product Identification</h3>
          <input required placeholder="Product Name *" style={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input required placeholder="Company Name *" style={styles.input} value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '15px', textTransform: 'uppercase', color: '#222' }}>2. Categorization & Sourcing</h3>
          <input required placeholder="Product Type *" style={styles.input} value={formData.productType} onChange={e => setFormData({...formData, productType: e.target.value})} />
          <input required type="url" placeholder="Website Link *" style={styles.input} value={formData.websiteLink} onChange={e => setFormData({...formData, websiteLink: e.target.value})} />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '15px', textTransform: 'uppercase', color: '#222' }}>3. Justification & Evidence</h3>
          <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Why Recommend? (2-3 sentences) *</label>
          <textarea required placeholder="Focus on results..." style={{ ...styles.input, height: '100px' }} value={formData.whyRecommend} onChange={e => setFormData({...formData, whyRecommend: e.target.value})} />

          <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginTop: '15px', marginBottom: '8px' }}>Upload Product Photo</label>
          <input type="file" accept="image/*, image/heic, image/jpeg, image/png, image/webp" style={styles.input} onChange={e => setFormData({...formData, photo: e.target.files?.[0] || null})} />

          <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginTop: '15px', marginBottom: '8px' }}>Upload Product Video (under 60s)</label>
          <input type="file" accept="video/*, video/mp4, video/quicktime, video/webm" style={styles.input} onChange={e => setFormData({...formData, video: e.target.files?.[0] || null})} />
        </div>

        <button type="submit" style={styles.authButton} disabled={isLoading}>{isLoading ? "Submitting..." : "Submit to the Duma"}</button>
      </form>

      <div style={{ ...styles.dumaCard, background: '#f9f9f9', marginTop: '30px' }}>
        <h3 style={{ marginTop: 0, fontSize: '14px', fontWeight: '700' }}>Before You Submit:</h3>
        <ul style={{ fontSize: '13px', color: '#555', lineHeight: '1.8', marginLeft: '20px' }}>
          <li>Verify you are logged in with your profile to ensure points are tracked</li>
          <li>Double-check the Website Link for valid access before submitting</li>
          <li>Ensure product photo label is legible and high-resolution</li>
          <li>Keep video under 60 seconds</li>
          <li>Justification must be 2-3 sentences focused on results</li>
        </ul>
      </div>
    </div>
  );
};
