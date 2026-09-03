// src/pages/CultureLabPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '../utils/useIsMobile';
import { useNavigate } from 'react-router-dom';
import { CredentialHeader } from '../components/CredentialHeader';
import { LocationAutocomplete } from '../components/LocationAutocomplete';
import { RankBadge } from '../components/RankBadge';
import { BACKEND_URL } from '../utils/constants';
import { markPromptCompleted, safeSocialUrl } from '../utils/helpers';
import { styles } from '../utils/styles';

export const CultureLabPage = ({ addDumaItem, userEmail, rankTitle, rankScore, authToken, onAddPoints, userAvatar }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const prompts = [
    { id: 1, text: "What's the best restaurant or local hidden gem you've eaten at recently? What should we order?" },
    { id: 2, text: "Share your top bar or cocktail lounge recommendation. What's the go-to drink there?" },
    { id: 3, text: "What is your absolute favorite brunch spot, and what makes it a must-visit?" },
    { id: 4, text: "What's the coolest coffee shop or late-night dessert place in your area?" },
    { id: 5, text: "If you could recommend one vacation destination for a quick weekend getaway, where are we going?" },
    { id: 6, text: "Drop your ultimate dream vacation spot or a past trip that blew your expectations away!" },
    { id: 7, text: "What's a fun local spot or unique activity in your city that tourists usually miss out on?" },
    { id: 8, text: "Share a photo or clip from your favorite travel memory or outdoor adventure." },
    { id: 9, text: "Show us your current OOTD (Outfit of the Day) or favorite wardrobe piece right now!" },
    { id: 10, text: "What is your favorite brand or boutique to shop at for quality clothes or accessories?" },
    { id: 11, text: "Drop your best budget fashion or shopping hack. How do you build killer looks for less?" },
    { id: 12, text: "What TV show or series are you currently binge-watching that everyone needs to check out?" },
    { id: 13, text: "What is a movie you can watch over and over again without ever getting tired of it?" },
    { id: 14, text: "Recommend an underrated movie or show that doesn't get enough hype!" },
    { id: 15, text: "Post Anything! Share whatever is on your mind today." }
  ];
  const [response, setResponse] = useState("");
  const [postLocation, setPostLocation] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [communitySocials, setCommunitySocials] = useState([]);
  const dumaBatchInputRef = React.useRef(null);
  const [dumaSlots, setDumaSlots] = useState(Array(6).fill(null));
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(null);
  const [postSubmitStatus, setCultureSubmitStatus] = useState("idle");

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/duma`)
      .then(r => { if (!r.ok) throw new Error('Failed to fetch duma'); return r.json(); })
      .then(data => {
        if (!Array.isArray(data)) return;
        const seen = new Set();
        const socials = [];
        data.forEach(item => {
          const email = item.submittedBy;
          const links = item.submitterSocialLinks;
          if (email && links && !seen.has(email) && (links.instagram || links.tiktok || links.snapchat)) {
            seen.add(email);
            socials.push({ email, links, avatar: item.submitterAvatar || null, rank: item.submitterRank || 'Comrade' });
          }
        });
        setCommunitySocials(socials);
      })
      .catch(err => console.error("Failed to load community socials:", err));

    if (authToken) {
      fetch(`${BACKEND_URL}/api/profile`, { headers: { Authorization: `Bearer ${authToken}` } })
        .then(r => r.json())
        .then(data => { if (data.displayName) setDisplayName(data.displayName); })
        .catch(err => console.error('Failed to load display name:', err));
    }
  }, [authToken]);

  const handleDumaBatchUpload = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const updatedSlots = [...dumaSlots];
    files.forEach((file) => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;
      if (file.size > 100 * 1024 * 1024) return;
      const emptyIdx = updatedSlots.findIndex((slot) => slot === null);
      if (emptyIdx === -1) return;
      updatedSlots[emptyIdx] = { url: URL.createObjectURL(file), type: file.type.startsWith('video/') ? 'video' : 'image', file };
    });
    setDumaSlots(updatedSlots);
  };

  const handleDumaSingleSlotUpload = (index, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;
    if (file.size > 100 * 1024 * 1024) return;
    if (dumaSlots[index]?.url?.startsWith('blob:')) URL.revokeObjectURL(dumaSlots[index].url);
    const updatedSlots = [...dumaSlots];
    updatedSlots[index] = { url: URL.createObjectURL(file), type: file.type.startsWith('video/') ? 'video' : 'image', file };
    setDumaSlots(updatedSlots);
  };

  const removeDumaSlot = (index) => {
    if (dumaSlots[index]?.url?.startsWith('blob:')) URL.revokeObjectURL(dumaSlots[index].url);
    const updatedSlots = [...dumaSlots];
    updatedSlots[index] = null;
    setDumaSlots(updatedSlots);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!response.trim()) { setErrorMsg("Please write a description for your post."); return; }
    setErrorMsg("");
    setCultureSubmitStatus("uploading");
    const activePrompt = selectedPromptIndex !== null ? prompts[selectedPromptIndex] : null;
    const filledDumaSlots = dumaSlots.filter((slot) => slot !== null);
    let userAvatarSlots = [];
    if (userEmail) {
      try {
        const localSlotsStr = localStorage.getItem(`avatarSlots_${userEmail}`);
        if (localSlotsStr) userAvatarSlots = JSON.parse(localSlotsStr);
      } catch (_) {}
    }
    try {
      let uploadedMediaUrls = [];
      if (filledDumaSlots.length > 0 && authToken) {
        for (const slot of filledDumaSlots) {
          const file = slot.file;
          const formData = new FormData();
          formData.append("file", file);
          formData.append("type", file.type.startsWith("video/") ? "video" : "image");
          const uploadRes = await fetch(`${BACKEND_URL}/api/media/upload`, {
            method: "POST",
            headers: { Authorization: `Bearer ${authToken}` },
            body: formData
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            const cloudUrl = uploadData.storageUrl || uploadData.secure_url || uploadData.url;
            if (cloudUrl) uploadedMediaUrls.push(cloudUrl);
          }
        }
      }
      if (authToken) {
        await fetch(`${BACKEND_URL}/api/duma/culture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({
            prompt: activePrompt ? activePrompt.text : "General Post",
            response: response,
            category: "Culture",
            location: postLocation,
            mediaUrls: uploadedMediaUrls,
            submitterAvatarSlots: userAvatarSlots
          })
        });
      }
      if (addDumaItem) {
        addDumaItem({
          id: Date.now(), type: "Culture", category: "Culture",
          prompt: activePrompt ? activePrompt.text : "General Post",
          response: response,
          mediaUrls: uploadedMediaUrls.length > 0 ? uploadedMediaUrls : filledDumaSlots.map(s => s.url),
          submittedBy: userEmail, location: postLocation, submitterDisplayName: displayName,
          submitterRank: rankTitle || 'Comrade', submitterAvatar: userAvatar || null,
          submitterAvatarSlots: userAvatarSlots, votes: { yes: 0 }
        });
      }
      const pointsEarned = activePrompt ? 150 : 100;
      if (onAddPoints) onAddPoints(pointsEarned);
      if (userEmail && activePrompt?.id) markPromptCompleted(userEmail, activePrompt.id);
      setCultureSubmitStatus("saved");
      setDumaSlots(Array(6).fill(null));
      setSubmitted(true);
      setTimeout(() => { navigate("/duma"); }, 1500);
    } catch {
      setErrorMsg("Server error processing your post.");
      setCultureSubmitStatus("error");
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: isMobile ? '25px 16px' : '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ ...styles.dumaCard, textAlign: 'center', padding: '50px' }}>
          <h2 style={{ marginBottom: '10px' }}>Perspective Shared!</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Your response has been submitted to The Majorities' Culture section.</p>
          <p style={{ fontSize: '12px', color: '#888' }}>You earned points!</p>
          {rankTitle && <RankBadge rankTitle={rankTitle} />}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? '25px 16px' : '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2>Share Your Perspective</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Contribute to our Culture section. Submit your response to the Duma and earn points!</p>
      {userEmail && rankTitle && (
        <div style={{ marginBottom: '30px' }}>
          <CredentialHeader email={userEmail} displayName={displayName} rankTitle={rankTitle} rankScore={rankScore} avatarUrl={userAvatar} />
        </div>
      )}
      {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}
      <form style={styles.dumaCard} onSubmit={handleSubmit}>
        <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>Attach Photos or Videos (Up to 6)</label>
        <div
          style={{ border: '2px dashed #bbb', borderRadius: '12px', padding: '14px', backgroundColor: '#fafafa', cursor: 'pointer', textAlign: 'center', marginBottom: '14px' }}
          onClick={() => dumaBatchInputRef.current && dumaBatchInputRef.current.click()}
        >
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#222' }}>Batch Upload (Auto-fill Slots)</p>
        </div>
        <input ref={dumaBatchInputRef} type="file" accept="image/*, image/heic, video/*, video/mp4, video/quicktime, video/webm" multiple onChange={handleDumaBatchUpload} style={{ display: 'none' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px', margin: '12px 0' }}>
          {dumaSlots.map((slot, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', borderRadius: '6px', height: '90px', position: 'relative', backgroundColor: '#fdfdfd', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {slot ? (
                <>
                  {slot.type === 'image' ? (
                    <img src={slot.url} alt={`Post media ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <video src={slot.url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  <button type="button" onClick={() => removeDumaSlot(idx)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(231,76,60,0.85)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '9px', fontWeight: 'bold' }}>x</button>
                </>
              ) : (
                <label style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '16px', color: '#aaa' }}>+</span>
                  <span style={{ fontSize: '9px', color: '#666', fontWeight: '600', marginTop: '2px' }}>Slot {idx + 1}</span>
                  <input type="file" accept="image/*, image/heic, video/*, video/mp4, video/quicktime, video/webm" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && handleDumaSingleSlotUpload(idx, e.target.files[0])} />
                </label>
              )}
            </div>
          ))}
        </div>
        <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginTop: '20px', marginBottom: '8px' }}>Location (Optional)</label>
        <LocationAutocomplete value={postLocation} onChange={setPostLocation} placeholder="Tag a location..." style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '16px' }} />
        <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>Your Response</h3>
        <textarea required placeholder="Type your response here..." style={{ ...styles.input, height: '140px' }} value={response} onChange={(e) => setResponse(e.target.value)} />
        <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginTop: '16px', marginBottom: '8px' }}>ANSWER PROMPTS FOR POINTS</label>
        <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '8px', marginBottom: '20px', backgroundColor: '#fafafa' }}>
          {prompts.map((prompt, idx) => (
            <div key={prompt.id} onClick={() => setSelectedPromptIndex(selectedPromptIndex === idx ? null : idx)} style={{ padding: '10px 12px', borderRadius: '6px', border: selectedPromptIndex === idx ? '2px solid #222' : '1px solid #e0e0e0', backgroundColor: '#fff', cursor: 'pointer', marginBottom: '6px', fontSize: '12px', color: '#333' }}>
              {prompt.id}. {prompt.text}
            </div>
          ))}
        </div>
        <button type="submit" style={styles.authButton}>
          {postSubmitStatus === "uploading" ? "Publishing..." : "Submit to the Duma (+100 points)"}
        </button>
      </form>
      <section style={{ marginTop: '50px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '8px', fontWeight: '600' }}>Community Social Links</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Connect with other members of The Majorities.</p>
        {communitySocials.length === 0 ? (
          <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888', padding: '30px' }}>No social links shared yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {communitySocials.map(member => (
              <div key={member.email} style={{ ...styles.dumaCard, padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {member.avatar ? (
                    <img src={member.avatar} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👤</div>
                  )}
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#222' }}>{member.email.split('@')[0]}</div>
                    <RankBadge rankTitle={member.rank} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {member.links.instagram && (
                    <a href={safeSocialUrl(member.links.instagram)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#c13584', textDecoration: 'none', fontWeight: '500' }}>Instagram</a>
                  )}
                  {member.links.tiktok && (
                    <a href={safeSocialUrl(member.links.tiktok)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#222', textDecoration: 'none', fontWeight: '500' }}>TikTok</a>
                  )}
                  {member.links.snapchat && (
                    <a href={safeSocialUrl(member.links.snapchat)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#000', textDecoration: 'none', fontWeight: '500' }}>Snapchat</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
