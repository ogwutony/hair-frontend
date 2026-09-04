// src/pages/ProfilePage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '../utils/useIsMobile';
import { Link, useNavigate } from 'react-router-dom';
import { LocationAutocomplete } from '../components/LocationAutocomplete';
import { RankBadge } from '../components/RankBadge';
import { SocialInputRow } from '../components/SocialInputRow';
import { BACKEND_URL, SOCIAL_FIELDS } from '../utils/constants';
import { getNextRankTitle, getPointsToNextRank, getRankProgress, getRankTitle, markPromptCompleted } from '../utils/helpers';
import { styles } from '../utils/styles';

export const ProfilePage = ({ userEmail, savedSets, rankTitle, rankScore, authToken, onAddPoints, onAvatarUpdate, userAvatar, tokens, addDumaItem }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [avatarUrl, setAvatarUrl] = useState(userAvatar || null);
  const [avatarSlots, setAvatarSlots] = useState(Array(6).fill(null)); 
  const [hadExistingAvatar, setHadExistingAvatar] = useState(false);
  
  const [backendRankScore, setBackendRankScore] = useState(rankScore || 1);
  const [backendRankTitle, setBackendRankTitle] = useState(rankTitle || "Comrade");
  const [isFeaturedContributor, setIsFeaturedContributor] = useState(false);
  const [, setAvatarSaveStatus] = useState("idle");

  const [displayName, setDisplayName] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [profileSaveStatus, setProfileSaveStatus] = useState({ name: "idle", location: "idle" });

  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    tiktok: "",
    snapchat: ""
  });
  
  const [socialSaveStatus, setSocialSaveStatus] = useState({ instagram: "idle", tiktok: "idle", snapchat: "idle" });

  const blobAvatarUrlRef = React.useRef(null);

  useEffect(() => {
    return () => {
      if (blobAvatarUrlRef.current) {
        URL.revokeObjectURL(blobAvatarUrlRef.current);
        blobAvatarUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const resolvedScore = rankScore || 1;
    setBackendRankScore(resolvedScore);
    setBackendRankTitle(getRankTitle(resolvedScore));
  }, [rankScore, rankTitle]);

  useEffect(() => {
    if (!authToken) return;
    fetch(`${BACKEND_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    }).then(r => { if (!r.ok) throw new Error('Failed to fetch profile'); return r.json(); }).then(data => {
      const resolvedScore = data.rank_score || 1;
      setBackendRankScore(resolvedScore);
      setBackendRankTitle(getRankTitle(resolvedScore));
      setIsFeaturedContributor(Boolean(data.featuredOnInstagram) || (data.socialEngagement || 0) >= 100);
      if (data.avatar) {
        setAvatarUrl(data.avatar);
        setHadExistingAvatar(true);
        if (onAvatarUpdate) onAvatarUpdate(data.avatar);
      }
      if (data.displayName) setDisplayName(data.displayName);
      if (data.location) setUserLocation(data.location);
      const localSlotsStr = (() => { try { return localStorage.getItem(`avatarSlots_${userEmail}`); } catch { return null; } })();
      const loadedSlotUrls = data.avatarSlots || (localSlotsStr ? JSON.parse(localSlotsStr) : null);
      if (loadedSlotUrls && Array.isArray(loadedSlotUrls)) {
        const mappedSlots = loadedSlotUrls.slice(0, 6).map((url) => {
          if (!url) return null;
          return { url, type: /\.(mp4|mov|webm)$/i.test(url) ? 'video' : 'image', file: null };
        });
        while (mappedSlots.length < 6) mappedSlots.push(null);
        setAvatarSlots(mappedSlots);
      }
      if (data.socialLinks) setSocialLinks(prev => ({ ...prev, ...data.socialLinks }));
    }).catch(err => console.error('Failed to load profile:', err));
  }, [authToken, onAvatarUpdate, userEmail]);

  const handleSaveProfileField = async (field, val) => {
    if (!authToken) return;
    setProfileSaveStatus(prev => ({ ...prev, [field]: "saving" }));
    try {
      const response = await fetch(`${BACKEND_URL}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ [field]: val })
      });
      if (response.ok) {
        setProfileSaveStatus(prev => ({ ...prev, [field]: "saved" }));
        setTimeout(() => setProfileSaveStatus(prev => ({ ...prev, [field]: "idle" })), 3000);
      } else {
        setProfileSaveStatus(prev => ({ ...prev, [field]: "error" }));
        setTimeout(() => setProfileSaveStatus(prev => ({ ...prev, [field]: "idle" })), 3000);
      }
    } catch {
      setProfileSaveStatus(prev => ({ ...prev, [field]: "error" }));
      setTimeout(() => setProfileSaveStatus(prev => ({ ...prev, [field]: "idle" })), 3000);
    }
  };

  const handleSocialChange = (key, value) => {
    setSocialLinks(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSocialLink = async (key, valueOverride) => {
    if (!authToken) return;
    const resolvedValue = typeof valueOverride === "string" ? valueOverride : socialLinks[key];
    if (typeof valueOverride === "string") {
      setSocialLinks(prev => ({ ...prev, [key]: valueOverride }));
    }
    setSocialSaveStatus(prev => ({ ...prev, [key]: "saving" }));
    try {
      const response = await fetch(`${BACKEND_URL}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ socialLinks: { [key]: resolvedValue } })
      });
      if (response.ok) {
        setSocialSaveStatus(prev => ({ ...prev, [key]: "saved" }));
        setTimeout(() => setSocialSaveStatus(prev => ({ ...prev, [key]: "idle" })), 3000);
      } else {
        setSocialSaveStatus(prev => ({ ...prev, [key]: "error" }));
        setTimeout(() => setSocialSaveStatus(prev => ({ ...prev, [key]: "idle" })), 3000);
      }
    } catch {
      setSocialSaveStatus(prev => ({ ...prev, [key]: "error" }));
      setTimeout(() => setSocialSaveStatus(prev => ({ ...prev, [key]: "idle" })), 3000);
    }
  };

  const avatarBatchInputRef = React.useRef(null);
  const dumaBatchInputRef = React.useRef(null);

  // --- Post About Anything States ---
  const [postDescription, setCultureResponse] = useState("");
  const [postLocation, setPostLocation] = useState("");
  const [dumaSlots, setDumaSlots] = useState(Array(6).fill(null)); 
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(null);
  const [postSubmitStatus, setCultureSubmitStatus] = useState("idle");
  const [postErrorMsg, setCultureErrorMsg] = useState("");

  const perspectivePrompts = [
    // Brand-Specific Beauty (The Majorities)
    { id: 1, text: "Share a photo or video of your results after using The Majorities products. What changed for your hair or skin?" },
    { id: 2, text: "Show us your before-and-after results with The Majorities. Which products were part of your routine?" },
    { id: 3, text: "Walk us through your wash-day routine using The Majorities shampoo, conditioner, or hair oil." },
    { id: 4, text: "What is your favorite way to layer The Majorities skincare products in your daily routine?" },
    { id: 5, text: "Which Majorities product has become your essential, and how do you use it?" },
    { id: 6, text: "Share your routine for dry, damaged, or frizz-prone hair using The Majorities products." },
    { id: 7, text: "Post a photo of your current Majorities set and tell us why you chose each product." },
    { id: 8, text: "What tips would you give someone trying The Majorities products for the first time?" },
    { id: 9, text: "How often do you use The Majorities shampoo, conditioner, hair oil, scrub, toner, or lotion?" },
    { id: 10, text: "Share the results you notice when you stay consistent with your Majorities routine." },
    
    // General Beauty & Personal Care
    { id: 11, text: "Team toner or straight to moisturizer?" },
    { id: 12, text: "How many days do you really go between shampooing?" },
    { id: 13, text: "Facial scrubs: love them or leave them?" },
    { id: 14, text: "What’s your emergency fix for a surprise pimple?" },
    { id: 15, text: "How do you instantly hide morning eye bags?" },
    { id: 16, text: "What’s the secret to preventing neck bumps after a fresh haircut?" },
    { id: 17, text: "What is your favorite unconventional use for baby oil?" },
    { id: 18, text: "Hair oil: split-end lifesaver or grease trap?" },
    { id: 19, text: "What is your holy grail daily moisturizing lotion?" },
    { id: 20, text: "What’s the worst DIY skincare trend you’ve ever tried?" },
    { id: 21, text: "Desert island: Shampoo, conditioner, or hair oil?" },
    { id: 22, text: "Drop your best hack for treating razor bumps!" },
    { id: 23, text: "What was the very first skincare product you ever bought?" },
    { id: 24, text: "What is your #1 tip for clearing up stubborn breakouts?" },

    // Fashion, Shopping & Personal Presentation
    { id: 25, text: "Splurge or save: Which product is always worth the money?" },
    { id: 26, text: "Show us your current OOTD (Outfit of the Day) or favorite wardrobe piece right now!" },
    { id: 27, text: "What is your favorite brand or boutique to shop at for quality clothes or accessories?" },
    { id: 28, text: "Drop your best budget fashion or shopping hack. How do you build killer looks for less?" }
  ];

  const syncAvatarSlotsToBackend = (slotsArray) => {
    const urls = slotsArray.map((slot) => (slot ? slot.url : null));
    try { localStorage.setItem(`avatarSlots_${userEmail}`, JSON.stringify(urls)); } catch {}
    if (!authToken) return;
    fetch(`${BACKEND_URL}/api/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ avatarSlots: urls })
    }).catch(err => console.error('Failed to sync avatar slots:', err));
  };

  const uploadFileToBackend = async (file, index, isMain) => {
    if (!authToken) return;
    try {
      setAvatarSaveStatus("saving");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", file.type.startsWith('video/') ? "video" : "avatar");
      const response = await fetch(`${BACKEND_URL}/api/media/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const cloudUrl = data.storageUrl || data.url || data.secure_url;
        if (cloudUrl) {
          setAvatarSlots((prev) => {
            const next = [...prev];
            if (next[index]) next[index] = { ...next[index], url: cloudUrl };
            syncAvatarSlotsToBackend(next);
            return next;
          });
          if (isMain) {
            setAvatarUrl(cloudUrl);
            if (onAvatarUpdate) onAvatarUpdate(cloudUrl);

            await fetch(`${BACKEND_URL}/api/profile`, {
              method: "PUT",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
              body: JSON.stringify({ avatar: cloudUrl })
            });

            if (!hadExistingAvatar && onAddPoints) {
              onAddPoints(25);
              setHadExistingAvatar(true);
            }
          }
        }
        setAvatarSaveStatus("saved");
        setTimeout(() => setAvatarSaveStatus("idle"), 3000);
      } else {
        setAvatarSaveStatus("error");
      }
    } catch {
      setAvatarSaveStatus("error");
    }
  };

  const handleAvatarBatchUpload = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const updatedSlots = [...avatarSlots];
    const newlyFilled = [];
    for (const file of files) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert('Please upload image or lideo files only (JPG, PNG, HEIC, WEBP, MP4, MOV).');
        continue;
      }
      if (file.size > 100 * 1024 * 1024) {
        alert('Files must be smaller than 100MB.');
        continue;
      }
      const emptyIdx = updatedSlots.findIndex((slot) => slot === null);
      if (emptyIdx === -1) break;
      const previewObj = {
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' : 'image',
        file
      };
      updatedSlots[emptyIdx] = previewObj;
      newlyFilled.push(emptyIdx);
    }
    setAvatarSlots(updatedSlots);

    const hadNoMain = !avatarUrl;
    if (hadNoMain && newlyFilled.length > 0) {
      const firstIdx = newlyFilled[0];
      const first = updatedSlots[firstIdx];
      setAvatarUrl(first.url);
      if (onAvatarUpdate) onAvatarUpdate(first.url);
      uploadFileToBackend(first.file, firstIdx, true);
    }
    newlyFilled.forEach((idx) => {
      if (!(hadNoMain && idx === newlyFilled[0])) {
        uploadFileToBackend(updatedSlots[idx].file, idx, false);
      }
    });
  };

  const handleAvatarSingleSlotUpload = (index, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Please upload image or video files only (JPG, PNG, HEIC, WEBP, MP4, MOV).');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      alert('Files must be smaller than 100MB.');
      return;
    }
    const wasMain = avatarSlots[index] && avatarSlots[index].url === avatarUrl;
    if (avatarSlots[index]?.url?.startsWith('blob:')) URL.revokeObjectURL(avatarSlots[index].url);
    const previewObj = {
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      file
    };
    const updatedSlots = [...avatarSlots];
    updatedSlots[index] = previewObj;
    setAvatarSlots(updatedSlots);

    const shouldBeMain = wasMain || !avatarUrl;
    if (shouldBeMain) {
      setAvatarUrl(previewObj.url);
      if (onAvatarUpdate) onAvatarUpdate(previewObj.url);
    }
    uploadFileToBackend(file, index, shouldBeMain);
  };

  const removeAvatarSlot = (index) => {
    const removedUrl = avatarSlots[index] ? avatarSlots[index].url : null;
    if (removedUrl && removedUrl.startsWith('blob:')) URL.revokeObjectURL(removedUrl);
    const updatedSlots = [...avatarSlots];
    updatedSlots[index] = null;
    setAvatarSlots(updatedSlots);

    if (removedUrl && removedUrl === avatarUrl) {
      const remaining = updatedSlots.find((slot) => slot !== null);
      const nextUrl = remaining ? remaining.url : null;
      setAvatarUrl(nextUrl);
      if (onAvatarUpdate) onAvatarUpdate(nextUrl);
    }
    syncAvatarSlotsToBackend(updatedSlots);
  };

  const handleDumaBatchUpload = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const updatedSlots = [...dumaSlots];
    files.forEach((file) => {
      const emptyIdx = updatedSlots.findIndex((slot) => slot === null);
      if (emptyIdx === -1) return;
      updatedSlots[emptyIdx] = {
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' : 'image',
        file
      };
    });
    setDumaSlots(updatedSlots);
  };

  const handleDumaSingleSlotUpload = (index, file) => {
    if (!file) return;
    if (dumaSlots[index]?.url?.startsWith('blob:')) URL.revokeObjectURL(dumaSlots[index].url);
    const updatedSlots = [...dumaSlots];
    updatedSlots[index] = {
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      file
    };
    setDumaSlots(updatedSlots);
  };

  const removeDumaSlot = (index) => {
    if (dumaSlots[index]?.url?.startsWith('blob:')) URL.revokeObjectURL(dumaSlots[index].url);
    const updatedSlots = [...dumaSlots];
    updatedSlots[index] = null;
    setDumaSlots(updatedSlots);
  };

  const handleCultureSubmit = async (e) => {
    e.preventDefault();
    if (!postDescription.trim()) {
      setCultureErrorMsg("Please write a description for your post.");
      return;
    }
    setCultureErrorMsg("");
    setCultureSubmitStatus("uploading");

    const activePrompt = selectedPromptIndex !== null ? perspectivePrompts[selectedPromptIndex] : null;
    const filledDumaSlots = dumaSlots.filter((slot) => slot !== null);

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
            response: postDescription,
            category: "Culture",
            location: postLocation,
            mediaUrls: uploadedMediaUrls
          })
        });
      }

      if (addDumaItem) {
        addDumaItem({
          id: Date.now(),
          type: "Culture",
          category: "Culture",
          prompt: activePrompt ? activePrompt.text : "General Post",
          response: postDescription,
          mediaUrls: uploadedMediaUrls.length > 0 ? uploadedMediaUrls : filledDumaSlots.map(s => s.url),
          submittedBy: userEmail,
          location: postLocation,
          submitterDisplayName: displayName,
          submitterRank: rankTitle || 'Comrade',
          submitterAvatar: avatarUrl || null,
          votes: { yes: 0 }
        });
      }

      const pointsEarned = activePrompt ? 150 : 100;
      if (onAddPoints) onAddPoints(pointsEarned);
      if (userEmail && activePrompt?.id) markPromptCompleted(userEmail, activePrompt.id);

      setCultureSubmitStatus("saved");
      setDumaSlots(Array(6).fill(null));
      setTimeout(() => { navigate("/duma"); }, 1500);
    } catch {
      setCultureSubmitStatus("error");
      setCultureErrorMsg("Server error processing your post.");
    }
  };

  const displayRankScore = backendRankScore || 1;
  const displayRankTitle = backendRankTitle || 'Comrade';
  const pointsToNextRank = getPointsToNextRank(displayRankScore, displayRankTitle);
  const nextRankTitle = getNextRankTitle(displayRankTitle);
  const { currentMin, nextMin, progressPercent } = getRankProgress(displayRankScore, displayRankTitle);

  return (
    <div style={{ padding: isMobile ? '25px 16px' : '40px 60px', maxWidth: '900px', margin: '0 auto' }}>

      {/* 1. WELCOME & RANK PROGRESS */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: '700' }}>Welcome</h1>
        {displayRankTitle && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <RankBadge rankTitle={displayRankTitle} />
              {isFeaturedContributor && <span style={{ background: '#f4d35e', color: '#222', borderRadius: '999px', padding: '4px 8px', fontSize: '10px', fontWeight: '800' }}>★ Featured on The Duma</span>}
              <span style={{ fontSize: '13px', color: '#666' }}>{displayRankScore.toLocaleString()} points</span>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                <span>RANK PROGRESS</span>
                <span>{progressPercent.toFixed(0)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#ececec', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #222 0%, #d4af37 100%)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', marginTop: '4px' }}>
                <span>{currentMin.toLocaleString()} pts</span>
                <span>{nextMin.toLocaleString()} pts</span>
              </div>
            </div>
            {nextRankTitle && (
              <div style={{ fontSize: '11px', color: '#888', marginTop: '6px' }}>
                <strong>{pointsToNextRank.toLocaleString()}</strong> points to your next rank ({nextRankTitle})
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. PROFILE PICTURES (UP TO 6) */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '6px', fontWeight: '600' }}>Profile Pictures (Up to 6)</h2>
        <p style={{ color: '#888', fontSize: '12px', marginBottom: '16px' }}>
          Batch-upload up to 6 files at once, or click individual terminal slots to set/replace specific pictures or videos.
        </p>

        <div style={{ border: '1px solid #e0e0e0', borderRadius: '16px', padding: '24px', backgroundColor: '#fff' }}>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            {avatarUrl ? (
              /\.(mp4|mov|webm)$/i.test(avatarUrl) ? (
                <video src={avatarUrl} style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #222' }} autoPlay loop muted />
              ) : (
                <img src={avatarUrl} alt="Main Avatar" style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #222' }} />
              )
            ) : (
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#eee', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', color: '#888' }}>👤</div>
            )}
          </div>

          <div
            style={{ border: '2px dashed #bbb', borderRadius: '12px', padding: '16px', backgroundColor: '#fafafa', cursor: 'pointer', textAlign: 'center', marginBottom: '20px' }}
            onClick={() => avatarBatchInputRef.current && avatarBatchInputRef.current.click()}
          >
            <span style={{ fontSize: '22px', display: 'block', marginBottom: '4px' }}>📁</span>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#222' }}>Batch Upload (Auto-fill Slots)</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#888' }}>Select up to 6 photos/videos from your library at once</p>
          </div>

          <input
            ref={avatarBatchInputRef}
            type="file"
            accept="image/*, image/heic, video/*, video/mp4, video/quicktime"
            multiple
            onChange={handleAvatarBatchUpload}
            style={{ display: 'none' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '12px' }}>
            {avatarSlots.map((slot, idx) => (
              <div
                key={idx}
                style={{
                  border: slot && avatarUrl === slot.url ? '3px solid #d4af37' : '2px dashed #ddd',
                  borderRadius: '12px',
                  height: '110px',
                  position: 'relative',
                  backgroundColor: '#fdfdfd',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {slot ? (
                  <>
                    {slot.type === 'video' ? (
                      <video src={slot.url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src={slot.url} alt={`Slot ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}

                    <button
                      type="button"
                      onClick={() => { setAvatarUrl(slot.url); if (onAvatarUpdate) onAvatarUpdate(slot.url); }}
                      style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '9px', padding: '2px 5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      {avatarUrl === slot.url ? '★ MAIN' : 'Set Main'}
                    </button>

                    <button
                      type="button"
                      onClick={() => removeAvatarSlot(idx)}
                      style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(231,76,60,0.85)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <label style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '18px', color: '#aaa' }}>+</span>
                    <span style={{ fontSize: '10px', color: '#666', fontWeight: '600', marginTop: '2px' }}>Slot #{idx + 1}</span>
                    <input
                      type="file"
                      accept="image/*, image/heic, video/*, video/mp4, video/quicktime"
                      style={{ display: 'none' }}
                      onChange={(e) => e.target.files[0] && handleAvatarSingleSlotUpload(idx, e.target.files[0])}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* NEW: PROFILE DETAILS */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>Profile Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#222', display: 'block' }}>Account / Display Name</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="text" placeholder="How you appear to others" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
              <button type="button" onClick={() => handleSaveProfileField("displayName", displayName)} disabled={profileSaveStatus.name === "saving"} style={{ padding: '10px 16px', backgroundColor: profileSaveStatus.name === "saved" ? '#27ae60' : profileSaveStatus.name === "error" ? '#e74c3c' : '#222', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', minWidth: '85px' }}>
                {profileSaveStatus.name === "saving" ? "Saving..." : profileSaveStatus.name === "saved" ? "Saved" : "Save"}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#222', display: 'block' }}>Your Location</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <LocationAutocomplete value={userLocation} onChange={setUserLocation} placeholder="City, State, or Country" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              <button type="button" onClick={() => handleSaveProfileField("location", userLocation)} disabled={profileSaveStatus.location === "saving"} style={{ padding: '10px 16px', backgroundColor: profileSaveStatus.location === "saved" ? '#27ae60' : profileSaveStatus.location === "error" ? '#e74c3c' : '#222', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', minWidth: '85px' }}>
                {profileSaveStatus.location === "saving" ? "Saving..." : profileSaveStatus.location === "saved" ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOCIALS */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>Socials</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
          {SOCIAL_FIELDS.map(social => (
            <SocialInputRow
              key={social.key}
              socialKey={social.key}
              label={social.label}
              placeholder={social.placeholder}
              initialValue={socialLinks[social.key]}
              saveStatus={socialSaveStatus[social.key]}
              onChangeGlobal={handleSocialChange}
              onSave={handleSaveSocialLink}
             />
          ))}
        </div>
      </section>

      {/* 4. POST ABOUT ANYTHING */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '4px', fontWeight: '600' }}>Post About Anything</h2>
        <p style={{ color: '#888', fontSize: '12px', marginBottom: '20px' }}>
          Share your thoughts or photos/videos directly to the Duma (+100 points). Address a product prompt below to earn 150 points!
        </p>
        <p style={{ color: '#2d6a4f', fontSize: '12px', fontWeight: '700', marginTop: '-12px', marginBottom: '20px' }}>Share your take here and on Instagram with #TheMajorities.</p>

        {postErrorMsg && <div style={{ color: 'red', fontSize: '13px', marginBottom: '10px' }}>{postErrorMsg}</div>}

        <form onSubmit={handleCultureSubmit} style={{ ...styles.dumaCard, border: '1px solid #e0e0e0', padding: '24px', borderRadius: '16px' }}>

          <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>Attach Photos or Videos (Up to 6)</label>
          <p style={{ fontSize: '11px', color: '#888', marginBottom: '10px' }}>Batch-upload multiple files at once, or an use individual terminal slot below.</p>

          <div
            style={{ border: '2px dashed #bbb', borderRadius: '12px', padding: '14px', backgroundColor: '#fafafa', cursor: 'pointer', textAlign: 'center', marginBottom: '14px' }}
            onClick={() => dumaBatchInputRef.current && dumaBatchInputRef.current.click()}
          >
            <span style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}>📁</span>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#222' }}>Batch Upload (Auto-fill Slots)</p>
          </div>

          <input
            ref={dumaBatchInputRef}
            type="file"
            accept="image/*, image/heic, video/*, video/mp4, video/quicktime, video/webm"
            multiple
            onChange={handleDumaBatchUpload}
            style={{ display: 'none' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px', margin: '12px 0' }}>
            {dumaSlots.map((slot, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  height: '90px',
                  position: 'relative',
                  backgroundColor: '#fdfdfd',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {slot ? (
                  <>
                    {slot.type === 'image' ? (
                      <img src={slot.url} alt={`Post media ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <video src={slot.url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    <button
                      type="button"
                      onClick={() => removeDumaSlot(idx)}
                      style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(231,76,60,0.85)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '9px', fontWeight: 'bold' }}
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <label style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '16px', color: '#aaa' }}>+</span>
                    <span style={{ fontSize: '9px', color: '#666', fontWeight: '600', marginTop: '2px' }}>Slot {idx + 1}</span>
                    <input
                      type="file"
                      accept="image/*, image/heic, video/*, video/mp4, video/quicktime, video/webm"
                      style={{ display: 'none' }}
                      onChange={(e) => e.target.files[0] && handleDumaSingleSlotUpload(idx, e.target.files[0])}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>

          <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginTop: '20px', marginBottom: '8px' }}>Location (Optional)</label>
          <LocationAutocomplete value={postLocation} onChange={setPostLocation} placeholder="Tag a location for this post..." style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '16px' }} />

          <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginTop: '16px', marginBottom: '8px' }}>Write a description *</label>
          <textarea
            required
            placeholder="Write your post details here..."
            style={{ ...styles.input, height: '100px', fontSize: '13px' }}
            value={postDescription}
            onChange={(e) => setCultureResponse(e.target.value)}
          />

          <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginTop: '16px', marginBottom: '8px' }}>
            ANSWER PROMPTS FOR EXTRA POINTS
          </label>
          <p style={{ fontSize: '11px', color: '#888', margin: '0 0 10px 0' }}>
            Select a product prompt to attach it to your post and earn 150 points.
          </p>

          <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '8px', marginBottom: '20px', backgroundColor: '#fafafa' }}>
            {perspectivePrompts.map((prompt, idx) => (
              <div
                key={prompt.id}
                onClick={() => setSelectedPromptIndex(selectedPromptIndex === idx ? null : idx)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: selectedPromptIndex === idx ? '2px solid #222' : '1px solid #e0e0e0',
                  backgroundColor: selectedPromptIndex === idx ? '#fff' : '#fff',
                  cursor: 'pointer',
                  marginBottom: '6px',
                  fontSize: '12px',
                  color: '#333'
                }}
              >
                {prompt.id}. {prompt.text}
              </div>
            ))}
          </div>

          <button type="submit" style={{ ...styles.authButton, background: '#222', color: '#fff', padding: '12px' }}>
            {postSubmitStatus === "uploading" ? "Publishing..." : "Submit Post to Duma"}
          </button>
        </form>
      </section>

      {/* 5. YOUR SAVED FORMULAS */}
      <section>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>Your Saved Formulas</h2>
        {savedSets.length === 0 ? (
          <div style={styles.dumaCard}>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>You haven't saved any custom sets yet. Head home to build your first one!</p>
            <Link to="/" style={{ ...styles.authButton, width: '200px', display: 'inline-block', textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}>Start Building</Link>
          </div>
        ) : (
          savedSets.map((set, index) => (
            <div key={index} style={styles.dumaCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ margin: 0 }}>Formula #{savedSets.length - index}</h4>
                <span style={{ fontSize: '12px', color: '#888' }}>{set.date}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                {set.items.map((item, i) => (
                  <div key={i} style={{ fontSize: '12px', padding: '10px', background: '#f9f9f9', borderRadius: '8px' }}>
                    <strong>{item.name}</strong>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

    </div>
  );
};
