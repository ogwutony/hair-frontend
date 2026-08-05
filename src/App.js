import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation, useParams } from "react-router-dom";
import AdMonetization, { trackEvent } from "./components/AdMonetization";

// --- 1. SHOPIFY CONFIGURATION ---
const SHOP_DOMAIN = "c0bqfe-z2.myshopify.com";

const DEFAULT_SELLING_PLAN_ID = "1467875506";

const PRODUCT_VARIANT_MAP = {
  "The Majorities Shampoo": {
    merchandiseId: "47555331358898",
    pricing: { oneTime: 7, subscription: 6 },
    sellingPlanId: DEFAULT_SELLING_PLAN_ID
  },
  "The Majorities Conditioner": {
    merchandiseId: "47555331555506",
    pricing: { oneTime: 7, subscription: 6 },
    sellingPlanId: DEFAULT_SELLING_PLAN_ID
  },
  "The Majorities Hair Oil": {
    merchandiseId: "47555331752114",
    pricing: { oneTime: 7, subscription: 6 },
    sellingPlanId: DEFAULT_SELLING_PLAN_ID
  },
  "The Majorities Facial Scrub": {
    merchandiseId: "47555331948722",
    pricing: { oneTime: 7, subscription: 6 },
    sellingPlanId: DEFAULT_SELLING_PLAN_ID
  },
  "The Majorities Face Toner": {
    merchandiseId: "47555332145330",
    pricing: { oneTime: 7, subscription: 6 },
    sellingPlanId: DEFAULT_SELLING_PLAN_ID
  },
  "The Majorities Moisturizing Lotion": {
    merchandiseId: "47555332309170",
    pricing: { oneTime: 7, subscription: 6 },
    sellingPlanId: DEFAULT_SELLING_PLAN_ID
  }
};

// --- 2. BACKEND CONFIGURATION ---
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://hair-backend-1.onrender.com";

// --- 3. RANK SYSTEM (51-Tier Hierarchy) ---
const RANK_TIERS = [
  // --- SUPREME COMMAND ---  
  { title: "Nice and Helpful",                              min: 75000000 },

  // --- EXECUTIVE COMMAND (5M Point Increments) ---
  { title: "Servant of the People",                         min: 50000000 },
  { title: "Servant of the Majorities",                     min: 45000000 },
  { title: "General Secretary of The Majorities",           min: 40000000 },
  { title: "Premier of The Majorities",                     min: 35000000 },
  { title: "Chairman of the Standing Committee of the Majorities Duma", min: 30000000 },
  { title: "Chairman of the National Committee of the Majorities Political Consultative", min: 25000000 },
  { title: "Director of the General Office of the Majorities", min: 20000000 },
  { title: "Secretary of the Central Commission for Discipline Inspection", min: 15000000 },
  { title: "Politburo Member of The Majorities",            min: 10000000 },
  { title: "Secretary of Majorities Committees of Provinces", min: 5000000  },

  // --- HEROIC ORDERS & LABOR TITLES ---
  { title: "Champion of the The Majorities",                min: 4500000 },
  { title: "Hero of the Majorities",                    min: 4000000 },
  { title: "Order of The Majorities",                   min: 3500000 },
  { title: "Order of the October Revolution",           min: 3000000 },
  { title: "Order of the Red Banner of Labor",          min: 2500000 },
  { title: "Order of Friendship of Peoples",            min: 2000000 },
  { title: "Order of the Badge of Honor",               min: 1500000 },
  { title: "the Salvation of the Drowning",             min: 1000000 },

  // --- LOWER HIERARCHY (Russian Gods) ---
  { title: "Perun",             min: 900000  },
  { title: "Veles",             min: 800000  },
  { title: "Svarog",            min: 700000  },
  { title: "Mokosh",            min: 600000  },
  { title: "Dazhbog",           min: 500000  },
  { title: "Stribog",           min: 400000  },
  { title: "Rod",               min: 300000  },
  { title: "Yarilo",            min: 200000  },
  { title: "Lada",              min: 100000  },
  { title: "Morana",            min: 50000   },
  { title: "Belobog",           min: 25000   },
  { title: "Chernobog",         min: 10000   },
  { title: "Leshiy",            min: 5000    },
  { title: "Vodyanoy",          min: 2500    },
  { title: "Domovoi",           min: 1500    },
  { title: "Rusalka",           min: 1000    },
  { title: "Rugiaevit",         min: 500     },
  { title: "Schout-bij-nacht",  min: 250     },
  { title: "Crow",              min: 100     },
  { title: "Comrade",           min: 1       },
];

const LOWER_HIERARCHY_RANKS = [
  "Perun", "Veles", "Svarog", "Mokosh", "Dazhbog", "Stribog", "Rod", "Yarilo",
  "Lada", "Morana", "Belobog", "Chernobog", "Leshiy", "Vodyanoy", "Domovoi",
  "Rusalka", "Rugiaevit", "Schout-bij-nacht", "Crow", "Comrade"
];

const getRankTitle = (score) => {
  for (const tier of RANK_TIERS) {
    if (score >= tier.min) return tier.title;
  }
  return "Comrade";
};

const getFormattedRankTitle = (rankTitle, completedPromptsCount = 0) => {
  if (!rankTitle) return "Comrade";
  if (completedPromptsCount >= 15 && LOWER_HIERARCHY_RANKS.includes(rankTitle)) {
    return `Lord ${rankTitle}`;
  }
  return rankTitle;
};

const COMPLETED_PROMPTS_KEY = "majorities_completed_prompts";
const getCompletedPromptIds = (userEmail) => {
  if (typeof window === "undefined" || !userEmail) return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(COMPLETED_PROMPTS_KEY) || "{}");
    return stored[userEmail] || [];
  } catch {
    return [];
  }
};

const markPromptCompleted = (userEmail, promptId) => {
  if (typeof window === "undefined" || !userEmail || !promptId) return getCompletedPromptIds(userEmail);
  try {
    const stored = JSON.parse(window.localStorage.getItem(COMPLETED_PROMPTS_KEY) || "{}");
    const existing = new Set(stored[userEmail] || []);
    existing.add(promptId);
    stored[userEmail] = Array.from(existing);
    window.localStorage.setItem(COMPLETED_PROMPTS_KEY, JSON.stringify(stored));
    return stored[userEmail];
  } catch {
    return getCompletedPromptIds(userEmail);
  }
};

const isPolitburoOrHigher = (score) => score >= 10000000;

const getPointsToNextRank = (currentScore, currentRankTitle) => {
  const currentIndex = RANK_TIERS.findIndex(r => r.title === currentRankTitle);
  if (currentIndex <= 0) return 0;
  const nextRank = RANK_TIERS[currentIndex - 1];
  return Math.max(0, nextRank.min - currentScore);
};

const getNextRankTitle = (currentRankTitle) => {
  const currentIndex = RANK_TIERS.findIndex(r => r.title === currentRankTitle);
  if (currentIndex <= 0) return null;
  return RANK_TIERS[currentIndex - 1].title;
};

const getRankProgress = (currentScore, currentRankTitle) => {
  const currentIndex = RANK_TIERS.findIndex(r => r.title === currentRankTitle);
  const currentTier = RANK_TIERS[currentIndex] || RANK_TIERS[RANK_TIERS.length - 1];
  const nextTier = currentIndex > 0 ? RANK_TIERS[currentIndex - 1] : null;
  const currentMin = currentTier?.min || 1;
  if (!nextTier) {
    return { currentMin, nextMin: currentMin, progressPercent: 100 };
  }

  const span = Math.max(1, nextTier.min - currentMin);
  const progressPercent = Math.min(100, Math.max(0, ((currentScore - currentMin) / span) * 100));
  return { currentMin, nextMin: nextTier.min, progressPercent };
};

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

const getProductCommerceConfig = (productName) => PRODUCT_VARIANT_MAP[productName] || {
  merchandiseId: "",
  pricing: { oneTime: 0, subscription: 0 },
  sellingPlanId: null
};

const calculateSetTotals = (items = []) => items.reduce((totals, item) => {
  const { pricing } = getProductCommerceConfig(item.name);
  return {
    oneTime: totals.oneTime + (pricing.oneTime || 0),
    subscription: totals.subscription + (pricing.subscription || 0)
  };
}, { oneTime: 0, subscription: 0 });

const submitShopifyCheckout = (items, purchaseType = "one-time") => {
  if (!items.length) return;
  if (purchaseType === "one-time") {
    const lineItems = items.map((item) => `${getProductCommerceConfig(item.name).merchandiseId}:1`).join(",");
    window.location.href = `https://${SHOP_DOMAIN}/cart/${lineItems}?checkout[shipping_address][country]=US`;
    return;
  }
  const subscriptionLineItems = items.map((item) => `${getProductCommerceConfig(item.name).merchandiseId}:1`).join(",");
  const sellingPlanId = getProductCommerceConfig(items[0].name).sellingPlanId;
  window.location.href = `https://${SHOP_DOMAIN}/cart/${subscriptionLineItems}?selling_plan=${sellingPlanId}&checkout[shipping_address][country]=US`;
};

const getRankColor = (rankTitle) => {
  const goldTier = [
    "Nice and Helpful", "Servant of the People", "Servant of the Majorities", "General Secretary of The Majorities",
    "Premier of The Majorities", "Chairman of the Standing Committee of the Majorities Duma",
    "Chairman of the National Committee of the Majorities Political Consultative",
    "Director of the General Office of the Majorities",
    "Secretary of the Central Commission for Discipline Inspection",
    "Politburo Member of The Majorities", "Secretary of Majorities Committees of Provinces",
    "Champion of the The Majorities", "Hero of the Majorities", "Order of The Majorities",
    "Order of the October Revolution", "Order of the Red Banner of Labor",
    "Order of Friendship of Peoples", "Order of the Badge of Honor", "the Salvation of the Drowning"
  ];
  const silverTier = ["Perun", "Veles", "Svarog", "Mokosh", "Dazhbog", "Stribog", "Rod", "Yarilo"];
  if (goldTier.includes(rankTitle)) return '#FFD700';
  if (silverTier.includes(rankTitle)) return '#C0C0C0';
  return '#888';
};

// --- RANK BADGE COMPONENT ---
const RankBadge = ({ rankTitle }) => {
  const color = getRankColor(rankTitle);
  const isTopRank = rankTitle === "Nice and Helpful";
  const isLongTitle = rankTitle && rankTitle.length > 20;
  return (
    <span style={{
      fontSize: isLongTitle ? '9px' : '11px',
      fontWeight: '700',
      color: color,
      padding: '3px 8px',
      borderRadius: '4px',
      border: `1px solid ${color}`,
      textTransform: 'uppercase',
      letterSpacing: isLongTitle ? '0px' : '0.5px',
      whiteSpace: 'nowrap',
      display: 'inline-flex',
      alignItems: 'center',
      maxWidth: '200px',
      lineHeight: '1.3',
      ...(isTopRank ? styles.generalSecretaryBadge : {})
    }}>
      {rankTitle}
    </span>
  );
};

const safeSocialUrl = (raw) => {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
};

const CredentialHeader = ({ email, rankTitle, rankScore, avatarUrl, socialLinks = {} }) => {
  const initial = (email || 'C')[0].toUpperCase();
  const color = getRankColor(rankTitle || 'Comrade');
  const isTopRank = rankTitle === "Nice and Helpful";
  const formattedRankTitle = getFormattedRankTitle(rankTitle || 'Comrade', getCompletedPromptIds(email).length);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#fff', flexWrap: 'wrap', marginBottom: '12px' }}>
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        border: '1.5px solid #1a1a1a',
        backgroundColor: avatarUrl ? 'transparent' : color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: '700',
        color: '#fff',
        flexShrink: 0,
        overflow: 'hidden',
        ...(isTopRank && !avatarUrl ? { boxShadow: '0 0 12px rgba(255,215,0,0.8)' } : {})
      }}>
        {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
      </div>
      <span style={{ fontWeight: '600', fontSize: '14px', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
        {email}
      </span>
      <span style={{
        fontSize: rankTitle && rankTitle.length > 20 ? '9px' : '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        padding: '4px 10px',
        borderRadius: '4px',
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: '#000',
        color: '#fff',
        whiteSpace: 'nowrap',
        letterSpacing: rankTitle && rankTitle.length > 20 ? '0px' : '0.5px',
        lineHeight: '1.3',
        ...(isTopRank ? styles.generalSecretaryBadge : {})
      }}>
        {formattedRankTitle}
      </span>
      {rankScore != null && (
        <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px', backgroundColor: '#f5f5f5', color: '#d4af37', border: '1px solid #e0e0e0', whiteSpace: 'nowrap' }}>
          ★ {(rankScore || 1).toLocaleString()} pts
        </span>
      )}
      {socialLinks && (
        <>
          {socialLinks.instagram && <a href={safeSocialUrl(socialLinks.instagram)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', fontSize: '15px' }} title="Instagram">📷</a>}
          {socialLinks.tiktok && <a href={safeSocialUrl(socialLinks.tiktok)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', fontSize: '15px' }} title="TikTok">🎵</a>}
          {socialLinks.facebook && <a href={safeSocialUrl(socialLinks.facebook)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', fontSize: '11px', color: '#1877F2', fontWeight: '600' }} title="Facebook">Facebook</a>}
        </>
      )}
    </div>
  );
};

const SOCIAL_FIELDS = [
  { key: 'instagram', label: '📷 Instagram', placeholder: 'instagram.com/yourprofile' },
  { key: 'tiktok', label: '🎵 TikTok', placeholder: 'tiktok.com/@yourprofile' },
  { key: 'facebook', label: '📘 Facebook', placeholder: 'facebook.com/yourprofile' },
];

const SocialInputRow = ({ socialKey, label, placeholder, initialValue, onSave, onChangeGlobal, saveStatus }) => {
  const [localVal, setLocalVal] = React.useState(initialValue || "");

  React.useEffect(() => { setLocalVal(initialValue || ""); }, [initialValue]);

  const isSocialSaveDisabled = saveStatus === "saving" || !localVal.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: '600', color: '#222', display: 'block' }}>{label}</label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input type="text" placeholder={placeholder} value={localVal} onChange={(e) => setLocalVal(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
        <button
          type="button"
          onClick={() => {
            const sanitizedVal = localVal.trim();
            if (onChangeGlobal) onChangeGlobal(socialKey, sanitizedVal);
            onSave(socialKey, sanitizedVal);
          }}
          disabled={isSocialSaveDisabled}
          style={{ padding: '10px 16px', backgroundColor: saveStatus === "saved" ? '#27ae60' : saveStatus === "error" ? '#e74c3c' : '#222', color: '#fff', border: 'none', borderRadius: '8px', cursor: isSocialSaveDisabled ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '12px', minWidth: '85px' }}
        >
          {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "✓ Linked" : "Save"}
        </button>
      </div>
    </div>
  );
};

// --- PROFILE PAGE COMPONENT ---
const ProfilePage = ({ userEmail, savedSets, rankTitle, rankScore, authToken, onAddPoints, onAvatarUpdate, userAvatar, tokens, addDumaItem }) => {
  const navigate = useNavigate();
  const [profilePhotos, setProfilePhotos] = useState(userAvatar ? [userAvatar] : []);
  const [activeThumbnail, setActiveThumbnail] = useState(userAvatar || null);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const photoInputRef = React.useRef(null);

  const [backendRankScore, setBackendRankScore] = useState(rankScore || 1);
  const [backendRankTitle, setBackendRankTitle] = useState(rankTitle || "Comrade");

  const [cultureResponse, setCultureResponse] = useState("");
  const [cultureMediaFiles, setCultureMediaFiles] = useState([]);
  const [cultureMediaPreviews, setCultureMediaPreviews] = useState([]);
  const [cultureSubmitStatus, setCultureSubmitStatus] = useState("idle");
  const [cultureErrorMsg, setCultureErrorMsg] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  const perspectivePrompts = [
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
    { id: 15, text: "Post Anything! Share whatever is on your mind today—a random thought, life update, or funny hot take." }
  ];

  const [socialLinks, setSocialLinks] = useState({ instagram: "", tiktok: "", facebook: "" });
  const [socialSaveStatus, setSocialSaveStatus] = useState({ instagram: "idle", tiktok: "idle", facebook: "idle" });

  useEffect(() => {
    const resolvedScore = rankScore || 1;
    setBackendRankScore(resolvedScore);
    const rawRank = getRankTitle(resolvedScore);
    const promptCount = getCompletedPromptIds(userEmail).length;
    setBackendRankTitle(getFormattedRankTitle(rawRank, promptCount));
  }, [rankScore, rankTitle, userEmail]);

  useEffect(() => {
    if (!authToken) return;
    fetch(`${BACKEND_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    }).then(r => { if (!r.ok) throw new Error('Failed to fetch profile'); return r.json(); }).then(data => {
      const resolvedScore = data.rank_score || 1;
      setBackendRankScore(resolvedScore);
      const rawRank = getRankTitle(resolvedScore);
      const promptCount = getCompletedPromptIds(userEmail).length;
      setBackendRankTitle(getFormattedRankTitle(rawRank, promptCount));

      if (data.profilePhotos?.length > 0) setProfilePhotos(data.profilePhotos.slice(0, 6));
      else if (data.avatar) setProfilePhotos([data.avatar]);

      if (data.avatar) {
        setActiveThumbnail(data.avatar);
        if (onAvatarUpdate) onAvatarUpdate(data.avatar);
      }
      if (data.socialLinks) setSocialLinks(prev => ({ ...prev, ...data.socialLinks }));
    }).catch(() => {});
  }, [authToken, onAvatarUpdate, userEmail]);

  const handleProfilePhotosUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files).slice(0, 6 - profilePhotos.length);
    e.target.value = "";
    setUploadStatus("uploading");
    const uploadedUrls = [];

    try {
      for (const file of selectedFiles) {
        if (!['image/jpeg', 'image/png'].includes(file.type)) continue;
        if (file.size > 5 * 1024 * 1024) continue;

        if (authToken) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("type", "avatar");

          const response = await fetch(`${BACKEND_URL}/api/media/upload`, {
            method: "POST",
            headers: { Authorization: `Bearer ${authToken}` },
            body: formData
          });
          if (response.ok) {
            const data = await response.json();
            const cloudUrl = data.storageUrl || data.url || data.secure_url;
            if (cloudUrl) uploadedUrls.push(cloudUrl);
          }
        } else {
          uploadedUrls.push(URL.createObjectURL(file));
        }
      }

      if (uploadedUrls.length > 0) {
        const newGallery = [...profilePhotos, ...uploadedUrls].slice(0, 6);
        setProfilePhotos(newGallery);
        const newMain = activeThumbnail || newGallery[0];
        setActiveThumbnail(newMain);
        if (onAvatarUpdate) onAvatarUpdate(newMain);

        if (authToken) {
          await fetch(`${BACKEND_URL}/api/profile`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
            body: JSON.stringify({ avatar: newMain, profilePhotos: newGallery })
          });
        }
        setUploadStatus("saved");
        setTimeout(() => setUploadStatus("idle"), 3000);
      } else {
        setUploadStatus("error");
        setTimeout(() => setUploadStatus("idle"), 3000);
      }
    } catch {
      setUploadStatus("error");
      setTimeout(() => setUploadStatus("idle"), 3000);
    }
  };

  const handleSelectThumbnail = async (photoUrl) => {
    setActiveThumbnail(photoUrl);
    if (onAvatarUpdate) onAvatarUpdate(photoUrl);
    if (authToken) {
      await fetch(`${BACKEND_URL}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ avatar: photoUrl, profilePhotos })
      });
    }
  };

  const handleRemovePhoto = async (photoUrl) => {
    const updatedGallery = profilePhotos.filter(p => p !== photoUrl);
    setProfilePhotos(updatedGallery);
    let nextMain = activeThumbnail;
    if (activeThumbnail === photoUrl) {
      nextMain = updatedGallery[0] || null;
      setActiveThumbnail(nextMain);
      if (onAvatarUpdate) onAvatarUpdate(nextMain);
    }
    if (authToken) {
      await fetch(`${BACKEND_URL}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ avatar: nextMain, profilePhotos: updatedGallery })
      });
    }
  };

  const handleCultureMediaChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).slice(0, 6);
      setCultureMediaFiles(selectedFiles);
      setCultureMediaPreviews(selectedFiles.map(file => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" : "image"
      })));
    }
  };

  const handleCultureSubmit = async (e) => {
    e.preventDefault();
    if (!cultureResponse.trim()) {
      setCultureErrorMsg("Please write a description for your post.");
      return;
    }
    setCultureErrorMsg("");
    setCultureSubmitStatus("uploading");

    try {
      let uploadedMediaUrls = [];

      if (cultureMediaFiles.length > 0 && authToken) {
        for (const file of cultureMediaFiles) {
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

      const promptText = selectedPrompt ? selectedPrompt.text : "Post My Anything";

      if (authToken) {
        const res = await fetch(`${BACKEND_URL}/api/duma/culture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({
            prompt: promptText,
            response: cultureResponse,
            category: "Culture",
            mediaUrls: uploadedMediaUrls
          })
        });
        if (!res.ok) {
          setCultureSubmitStatus("error");
          setCultureErrorMsg("Submission failed");
          return;
        }
      }

      if (selectedPrompt) {
        markPromptCompleted(userEmail, selectedPrompt.id);
      }

      if (addDumaItem) {
        addDumaItem({
          id: Date.now(),
          type: "Culture",
          category: "Culture",
          prompt: promptText,
          response: cultureResponse,
          mediaUrls: uploadedMediaUrls.length > 0 ? uploadedMediaUrls : cultureMediaPreviews.map(p => p.url),
          submittedBy: userEmail,
          submitterRank: backendRankTitle,
          submitterAvatar: activeThumbnail || null,
          votes: { yes: 0 }
        });
      }

      if (onAddPoints) onAddPoints(100);
      setCultureSubmitStatus("saved");
      setTimeout(() => { navigate("/duma"); }, 2000);
    } catch {
      setCultureSubmitStatus("error");
      setCultureErrorMsg("Server error trying to process submission.");
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

  const displayRankScore = backendRankScore || 1;
  const displayRankTitle = backendRankTitle || 'Comrade';
  const pointsToNextRank = getPointsToNextRank(displayRankScore, displayRankTitle);
  const nextRankTitle = getNextRankTitle(displayRankTitle);
  const { currentMin, nextMin, progressPercent } = getRankProgress(displayRankScore, displayRankTitle);

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* HEADER SECTION */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: '700' }}>Welcome</h1>
        {displayRankTitle && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <RankBadge rankTitle={displayRankTitle} />
              <span style={{ fontSize: '13px', color: '#666' }}>{displayRankScore.toLocaleString()} points</span>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '11px', color: '#666', marginBottom: '6px', textTransform: 'uppercase' }}>
                <span>Rank progress</span>
                <span>{progressPercent.toFixed(0)}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#ececec', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #222 0%, #d4af37 100%)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', marginTop: '6px' }}>
                <span>{currentMin.toLocaleString()} pts</span>
                <span>{nextRankTitle ? `${nextMin.toLocaleString()} pts` : 'Top rank reached'}</span>
              </div>
            </div>
            {nextRankTitle && (
              <div style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                <strong>{pointsToNextRank.toLocaleString()}</strong> points to your next rank ({nextRankTitle})
              </div>
            )}
          </div>
        )}
      </div>

      {/* 1. PROFILE PICTURES (UP TO 6) */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '8px', fontWeight: '600' }}>Profile Pictures (Up to 6)</h2>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>
          Upload up to 6 pictures and select your active main avatar thumbnail.
        </p>

        <div style={styles.uploadBox}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            {activeThumbnail ? (
              <div>
                <img src={activeThumbnail} alt="Main Avatar" style={{ width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #222', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', marginBottom: '10px' }} />
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#222', color: '#fff', padding: '4px 10px', borderRadius: '12px' }}>
                    ★ Active Thumbnail
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px', color: '#888' }}>
                <span style={{ fontSize: '40px', display: 'block' }}>👤</span>
                <p style={{ fontSize: '13px', margin: 0 }}>No profile picture selected yet.</p>
              </div>
            )}
          </div>

          <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#555', marginBottom: '12px' }}>
            Your Pictures ({profilePhotos.length}/6)
          </h4>

          {profilePhotos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {profilePhotos.map((photo, index) => {
                const isSelected = photo === activeThumbnail;
                return (
                  <div key={index} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: isSelected ? '3px solid #27ae60' : '1px solid #ddd', background: '#fff', padding: '4px', textAlign: 'center' }}>
                    <img src={photo} alt={`Profile ${index + 1}`} style={{ width: '100%', height: '85px', objectFit: 'cover', borderRadius: '6px' }} />
                    <button type="button" onClick={() => handleSelectThumbnail(photo)} style={{ width: '100%', marginTop: '4px', padding: '4px 0', fontSize: '10px', fontWeight: '700', border: 'none', borderRadius: '4px', backgroundColor: isSelected ? '#27ae60' : '#222', color: '#fff', cursor: 'pointer' }}>
                      {isSelected ? '✓ Selected' : 'Set as Main'}
                    </button>
                    <button type="button" onClick={() => handleRemovePhoto(photo)} style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '11px' }}>
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <input ref={photoInputRef} type="file" accept="image/jpeg,image/png" multiple onChange={handleProfilePhotosUpload} style={{ display: 'none' }} />
            <button type="button" disabled={profilePhotos.length >= 6 || uploadStatus === "uploading"} onClick={() => photoInputRef.current && photoInputRef.current.click()} style={{ ...styles.authButton, width: 'auto', padding: '10px 20px', opacity: profilePhotos.length >= 6 ? 0.5 : 1 }}>
              {uploadStatus === "uploading" ? "Uploading..." : profilePhotos.length >= 6 ? "Max 6 Photos Reached" : "+ Add Profile Pictures (JPG/PNG, Max 6)"}
            </button>
          </div>
        </div>
      </section>

      {/* 2. SOCIALS SECTION (MOVED DIRECTLY BELOW PROFILE PICTURES) */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>Socials</h2>
        <div style={styles.dumaCard}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
            {SOCIAL_FIELDS.map(social => (
              <SocialInputRow key={social.key} socialKey={social.key} label={social.label} placeholder={social.placeholder} initialValue={socialLinks[social.key]} saveStatus={socialSaveStatus[social.key]} onChangeGlobal={(k, v) => setSocialLinks(prev => ({ ...prev, [k]: v }))} onSave={handleSaveSocialLink} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. POST MY ANYTHING SECTION */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '8px', fontWeight: '600' }}>Post My Anything</h2>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>
          Share your thoughts or photos/videos directly to the Duma. Optionally select a prompt below to earn extra points!
        </p>

        {cultureSubmitStatus === "saved" ? (
          <div style={{ ...styles.dumaCard, textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>✅</div>
            <h2>Post Shared!</h2>
            <p style={{ color: '#666' }}>Your entry was published to the Duma. Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleCultureSubmit} style={styles.dumaCard}>
            {cultureErrorMsg && <div style={{ color: '#e74c3c', marginBottom: '12px', fontSize: '13px' }}>{cultureErrorMsg}</div>}

            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
              Attach Photos or Videos (Up to 6)
            </label>
            <input type="file" accept="image/*,video/*" multiple onChange={handleCultureMediaChange} style={{ ...styles.input, padding: '8px' }} />

            {cultureMediaPreviews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', margin: '12px 0' }}>
                {cultureMediaPreviews.map((p, i) => (
                  <div key={i} style={{ height: '80px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #ddd' }}>
                    {p.type === "image" ? <img src={p.url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <video src={p.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                ))}
              </div>
            )}

            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginTop: '16px', marginBottom: '6px' }}>
              Write a description *
            </label>
            <textarea required placeholder="Write your post details here..." style={{ ...styles.input, height: '100px' }} value={cultureResponse} onChange={e => setCultureResponse(e.target.value)} />

            {/* Answer Prompts for Points */}
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#000', textTransform: 'uppercase', marginBottom: '4px' }}>
                Answer Prompts for Points (Optional)
              </h3>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                Click any prompt below to attach it to your post and earn bonus points! (Scroll to view all 15 prompts)
              </p>

              {/* SCROLLABLE CONTAINER (FITS 4 PROMPTS AT A TIME) */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                height: '215px',          // Displays ~4 prompt items simultaneously
                overflowY: 'auto',        // Allows scrolling through all 15 prompts
                paddingRight: '6px',
                border: '1px solid #eee',
                borderRadius: '10px',
                padding: '10px',
                backgroundColor: '#fafafa'
              }}>
                {perspectivePrompts.map((p) => {
                  const isSelected = selectedPrompt?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPrompt(isSelected ? null : p)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #222' : '1px solid #ddd',
                        backgroundColor: isSelected ? '#f0f0f0' : '#fff',
                        color: '#000',
                        fontWeight: isSelected ? '700' : '400',
                        cursor: 'pointer',
                        fontSize: '13px',
                        lineHeight: '1.4',
                        flexShrink: 0
                      }}
                    >
                      {p.id}. {p.text}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" style={{ ...styles.authButton, marginTop: '20px' }}>
              {cultureSubmitStatus === "uploading" ? "Publishing..." : "Submit Post to Duma"}
            </button>
          </form>
        )}
      </section>

      {/* SAVED FORMULAS SECTION */}
      <section>
        <h2 style={{ fontSize: '20px', marginBottom: '20px', fontWeight: '600' }}>Your Saved Formulas</h2>
        {savedSets.length === 0 ? (
          <div style={styles.dumaCard}>
            <p style={{ color: '#888' }}>You haven't saved any custom sets yet.</p>
          </div>
        ) : (
          savedSets.map((set, index) => (
            <div key={index} style={styles.dumaCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ margin: 0 }}>Formula #{savedSets.length - index}</h4>
                <span style={{ fontSize: '12px', color: '#888' }}>{set.date}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {set.items.map((item, i) => (
                  <div key={i} style={{ fontSize: '12px', padding: '8px', background: '#f9f9f9', borderRadius: '6px' }}>
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

// --- DUMA PAGE COMPONENT ---
const DumaPage = ({ items, authToken, userEmail, rankTitle, rankScore, onAddPoints, userAvatar }) => {
  const [dumaItems, setDumaItems] = useState(items);
  const [userVotes, setUserVotes] = useState({});
  const [activeSection, setActiveSection] = useState("Culture");

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/duma`).then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const uniqueMap = new Map();
        [...data, ...items].forEach(item => {
          const id = item._id || item.id;
          if (id) uniqueMap.set(String(id), item);
        });
        setDumaItems(Array.from(uniqueMap.values()));
      }
    }).catch(() => {});
  }, [items]);

  const handleDeletePost = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      if (authToken) {
        const response = await fetch(`${BACKEND_URL}/api/duma/${itemId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!response.ok) {
          alert("Could not delete post.");
          return;
        }
      }
      setDumaItems(prev => prev.filter(item => (item._id || item.id) !== itemId));
    } catch {
      alert("Error deleting post.");
    }
  };

  const handleVote = async (itemId, voteType) => {
    if (!authToken) return alert("Please log in to vote.");
    if (userVotes[itemId]) return;

    setUserVotes(prev => ({ ...prev, [itemId]: voteType }));
    if (onAddPoints) onAddPoints(1);

    try {
      const response = await fetch(`${BACKEND_URL}/api/duma/${itemId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ vote: voteType })
      });
      if (response.ok) {
        const data = await response.json();
        setDumaItems(prev => prev.map(item => item.id === itemId || item._id === itemId ? { ...item, votes: data.votes || item.votes } : item));
      }
    } catch {}
  };

  const culturalItems = dumaItems.filter(item => item.section === "Cultural" || item.category === "Culture" || item.type === "Video" || item.type === "Culture");
  const recommendationItems = dumaItems.filter(item => item.type === "Product Recommendation" || item.type === "Recommendation");
  const partnerItems = dumaItems.filter(item => item.type === "Partner");

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', minHeight: '80vh' }}>
      {/* LEFT AD SIDEBAR */}
      <aside style={{ width: '180px', padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <AdMonetization placement="duma_left_sidebar" />
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, maxWidth: '850px', padding: '40px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
          <div>
            <h2 style={{ marginBottom: '6px' }}>The Majorities' Duma</h2>
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Community recommendations, partnerships, and cultural contributions.</p>
          </div>
          {userEmail && rankTitle && <CredentialHeader email={userEmail} rankTitle={rankTitle} rankScore={rankScore} avatarUrl={userAvatar} />}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
          <button onClick={() => setActiveSection("Culture")} style={{ padding: '10px 20px', backgroundColor: activeSection === "Culture" ? '#222' : '#f5f5f5', color: activeSection === "Culture" ? '#fff' : '#222', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Culture ({culturalItems.length})</button>
          <button onClick={() => setActiveSection("Recommendations")} style={{ padding: '10px 20px', backgroundColor: activeSection === "Recommendations" ? '#222' : '#f5f5f5', color: activeSection === "Recommendations" ? '#fff' : '#222', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Recommendations ({recommendationItems.length})</button>
          <button onClick={() => setActiveSection("Partners")} style={{ padding: '10px 20px', backgroundColor: activeSection === "Partners" ? '#222' : '#f5f5f5', color: activeSection === "Partners" ? '#fff' : '#222', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Partners ({partnerItems.length})</button>
        </div>

        {/* CULTURE FEED */}
        {activeSection === "Culture" && (
          <div>
            {culturalItems.map(item => {
              const itemId = item._id || item.id;
              const isOwner = userEmail && item.submittedBy === userEmail;

              return (
                <div key={itemId} style={styles.dumaCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={styles.typeTag}>Perspective</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <RankBadge rankTitle={item.submitterRank || "Comrade"} />
                      {isOwner && (
                        <button onClick={() => handleDeletePost(itemId)} style={{ background: '#fff0f0', border: '1px solid #e74c3c', color: '#e74c3c', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                          🗑 Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {item.submittedBy && <CredentialHeader email={item.submittedBy} rankTitle={item.submitterRank || 'Comrade'} avatarUrl={item.submitterAvatar || null} />}
                  <h4 style={{ marginTop: '12px', marginBottom: '8px', color: '#555' }}>Prompt: "{item.prompt || 'Post My Anything'}"</h4>
                  <p style={{ color: '#222', fontSize: '14px', lineHeight: '1.6' }}>{item.response || item.desc}</p>

                  {item.mediaUrls?.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', margin: '12px 0' }}>
                      {item.mediaUrls.map((url, idx) => (
                        <img key={idx} src={url} alt="Attachment" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                      ))}
                    </div>
                  )}

                  {/* CULTURE VOTING: LIKE & ABSTAIN ONLY */}
                  {authToken && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                      <button disabled={!!userVotes[itemId]} onClick={() => handleVote(itemId, 'yes')} style={{ ...styles.voteBtn, borderColor: '#27ae60', color: '#27ae60', opacity: userVotes[itemId] === 'yes' ? 1 : 0.7 }}>
                        👍 Like
                      </button>
                      <button disabled={!!userVotes[itemId]} onClick={() => handleVote(itemId, 'abstain')} style={{ ...styles.voteBtn, borderColor: '#95a5a6', color: '#95a5a6', opacity: userVotes[itemId] === 'abstain' ? 1 : 0.7 }}>
                        Abstain
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* RECOMMENDATIONS FEED */}
        {activeSection === "Recommendations" && (
          <div>
            {recommendationItems.map(item => {
              const itemId = item._id || item.id;
              const isOwner = userEmail && item.submittedBy === userEmail;

              return (
                <div key={itemId} style={styles.dumaCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={styles.typeTag}>Recommendation</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {item.submitterRank && <RankBadge rankTitle={item.submitterRank} />}
                      {isOwner && (
                        <button onClick={() => handleDeletePost(itemId)} style={{ background: '#fff0f0', border: '1px solid #e74c3c', color: '#e74c3c', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                          🗑 Delete
                        </button>
                      )}
                    </div>
                  </div>

                  <h3>{item.name || item.product} by {item.company}</h3>
                  <p style={{ color: '#666', fontSize: '14px' }}>{item.reason || item.desc}</p>

                  {/* RECOMMENDATION VOTING: THUMBS UP & THUMBS DOWN */}
                  {authToken && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                      <button disabled={!!userVotes[itemId]} onClick={() => handleVote(itemId, 'yes')} style={{ ...styles.voteBtn, borderColor: '#27ae60', color: '#27ae60', opacity: userVotes[itemId] === 'yes' ? 1 : 0.7 }}>
                        👍 Up
                      </button>
                      <button disabled={!!userVotes[itemId]} onClick={() => handleVote(itemId, 'no')} style={{ ...styles.voteBtn, borderColor: '#e74c3c', color: '#e74c3c', opacity: userVotes[itemId] === 'no' ? 1 : 0.7 }}>
                        👎 Down
                      </button>
                      <button disabled={!!userVotes[itemId]} onClick={() => handleVote(itemId, 'abstain')} style={{ ...styles.voteBtn, borderColor: '#95a5a6', color: '#95a5a6', opacity: userVotes[itemId] === 'abstain' ? 1 : 0.7 }}>
                        Abstain
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* PARTNER HIGHLIGHTS / FEED (MOVED TO VERY BOTTOM) */}
        {activeSection === "Partners" && (
          <div>
            {partnerItems.length === 0 ? (
              <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888' }}>No partner listings available.</div>
            ) : (
              partnerItems.map(item => (
                <div key={item.id || item._id} style={styles.dumaCard}>
                  <h4>{item.productType} - {item.company}</h4>
                  <p style={{ fontSize: '13px', color: '#555' }}>{item.productDescription}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* AD SPACE IN MIDDLE AT VERY BOTTOM */}
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <AdMonetization placement="duma_bottom_banner" />
        </div>
      </main>

      {/* RIGHT AD SIDEBAR */}
      <aside style={{ width: '180px', padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <AdMonetization placement="duma_right_sidebar" />
      </aside>
    </div>
  );
};

// --- PERSPECTIVES / CULTURE PAGE (WITH LEFT & RIGHT AD SIDEBARS) ---
const PerspectivesPage = ({ items, authToken, userEmail, rankTitle, rankScore, following, onFollowUser, onUnfollowUser, userAvatar }) => {
  const [allItems, setAllItems] = useState(items);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/duma`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setAllItems(data); })
      .catch(() => {});
  }, [items]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', minHeight: '80vh' }}>
      {/* CULTURE LEFT AD SIDEBAR */}
      <aside style={{ width: '180px', padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <AdMonetization placement="culture_left_sidebar" />
      </aside>

      {/* MAIN CULTURE CONTENT */}
      <main style={{ flex: 1, maxWidth: '850px', padding: '40px 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ marginBottom: '6px' }}>My Perspectives</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Follow people from The Duma to see their perspectives in your personalized feed.
          </p>
        </div>

        {userEmail && rankTitle && (
          <div style={{ marginBottom: '20px' }}>
            <CredentialHeader email={userEmail} rankTitle={rankTitle} rankScore={rankScore} avatarUrl={userAvatar} />
          </div>
        )}

        <div>
          {allItems.map(item => (
            <div key={item.id || item._id} style={styles.dumaCard}>
              <p><strong>{item.submittedBy}</strong>: {item.response || item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* CULTURE RIGHT AD SIDEBAR */}
      <aside style={{ width: '180px', padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <AdMonetization placement="culture_right_sidebar" />
      </aside>
    </div>
  );
};

// --- ADMIN ORDER TRACKING PAGE ---
const AdminOrdersPage = ({ authToken, userEmail }) => {
  const isOwner = userEmail === "YOUR_EMAIL@domain.com";
  if (!isOwner) return <div style={{ padding: '40px', textAlign: 'center' }}>Access Restricted</div>;

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Fulfillment Dashboard</h2>
    </div>
  );
};

// --- MODEL-FRIENDLY PAGE ---
const ModelFriendlyPage = () => (
  <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
    <h1>The Majorities — Structured Site Data</h1>
  </div>
);

// --- MAIN APP COMPONENT ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [rankTitle, setRankTitle] = useState("Comrade");
  const [rankScore, setRankScore] = useState(1);
  const [tokens, setTokens] = useState(0);
  const [savedSets, setSavedSets] = useState([]);
  const [userAvatar, setUserAvatar] = useState("");
  const [dumaItems, setDumaItems] = useState([{ id: 1, type: "Partner", company: "EcoHair Labs", product: "Silk Serum", desc: "Organic hair serum.", section: "Commerce", submitterRank: "Comrade" }]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/health`, { method: "GET" }).catch(() => {});
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const email = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
    if (token) {
      fetch(`${BACKEND_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(data => {
        if (data.email) {
          setIsLoggedIn(true);
          setUserEmail(data.email);
          setAuthToken(token);
          const currentScore = data.rank_score || 1;
          setRankScore(currentScore);
          setRankTitle(getRankTitle(currentScore));
        }
      }).catch(() => {
        if (email) {
          setIsLoggedIn(true);
          setUserEmail(email);
          setAuthToken(token);
        }
      });
    }
  }, []);

  const handleLoginSuccess = (email, token, rememberMe, rank, score) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setAuthToken(token);
    const resolvedScore = score || 1;
    const resolvedRank = getRankTitle(resolvedScore);
    setRankTitle(resolvedRank);
    setRankScore(resolvedScore);
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("authToken", token);
    storage.setItem("userEmail", email);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    setAuthToken("");
    setRankTitle("Comrade");
    setRankScore(1);
    setUserAvatar("");
    localStorage.clear();
    sessionStorage.clear();
  };

  const handleAvatarUpdate = (url) => {
    setUserAvatar(url);
  };

  const saveSetToProfile = (items) => {
    const newSet = { items, date: new Date().toLocaleDateString() };
    const updatedSets = [newSet, ...savedSets];
    setSavedSets(updatedSets);
  };

  const addDumaItem = (item) => setDumaItems(prev => [item, ...prev]);

  const addPoints = useCallback((points) => {
    setRankScore(prevScore => {
      const newScore = prevScore + points;
      const oldRank = getRankTitle(prevScore);
      const newRank = getRankTitle(newScore);
      if (newRank !== oldRank) {
        const oldMin = RANK_TIERS.find(t => t.title === oldRank)?.min ?? 1;
        const newMin = RANK_TIERS.find(t => t.title === newRank)?.min ?? 1;
        if (newMin > oldMin) {
          setTokens(prev => prev + 1);
        }
      }
      setRankTitle(newRank);
      return newScore;
    });
  }, []);

  const followUser = useCallback((personEmail) => {
    if (!following.includes(personEmail)) {
      setFollowing(prev => [...prev, personEmail]);
      addPoints(1);
    }
  }, [following, addPoints]);

  const unfollowUser = (personEmail) => {
    setFollowing(prev => prev.filter(p => p !== personEmail));
  };

  return (
    <Router>
      <ScrollToTop />
      <div style={styles.pageWrapper}>
        <header style={styles.header}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}><div style={styles.logo}>The Majorities</div></Link>
          <nav style={styles.nav}>
            <Link to="/" style={styles.navLink}>Home</Link>
            <Link to="/recommend" style={styles.navLink}>Recommend</Link>
            <Link to="/partner" style={styles.navLink}>Partner</Link>
            <Link to="/duma" style={styles.navLink}>The Duma</Link>
            {isLoggedIn ? (
              <>
                <Link to="/perspectives" style={styles.navLink}>Culture</Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid #eee', paddingLeft: '15px' }}>
                  <Link to="/profile" style={{ ...styles.navLink, fontWeight: '700' }}>Profile</Link>
                  {rankTitle && <RankBadge rankTitle={rankTitle} />}
                  <span style={styles.auth} onClick={handleLogout}>Logout</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Link to="/signup" style={styles.auth}>Sign Up</Link>
                <Link to="/login" style={styles.auth}>Login</Link>
              </div>
            )}
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<LandingPage saveSetToProfile={saveSetToProfile} onAddPoints={addPoints} savedSets={savedSets} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLoginSuccess} />} />
          <Route path="/auth/google/callback" element={<OAuthCallbackPage onLogin={handleLoginSuccess} provider="google" />} />
          <Route path="/auth/instagram/callback" element={<OAuthCallbackPage onLogin={handleLoginSuccess} provider="instagram" />} />
          <Route path="/auth/tiktok/callback" element={<OAuthCallbackPage onLogin={handleLoginSuccess} provider="tiktok" />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/recommend" element={<RecommendPage addDumaItem={addDumaItem} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} userAvatar={userAvatar} />} />
          <Route path="/partner" element={<PartnerPage addDumaItem={addDumaItem} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} userAvatar={userAvatar} />} />
          <Route path="/culture" element={isLoggedIn ? <CultureLabPage addDumaItem={addDumaItem} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} onAddPoints={addPoints} userAvatar={userAvatar} /> : <Navigate to="/login" />} />
          <Route path="/duma" element={<DumaPage items={dumaItems} authToken={authToken} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} onAddPoints={addPoints} userAvatar={userAvatar} />} />
          <Route path="/perspectives" element={isLoggedIn ? <PerspectivesPage items={dumaItems} authToken={authToken} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} following={following} onFollowUser={followUser} onUnfollowUser={unfollowUser} onAddPoints={addPoints} userAvatar={userAvatar} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={<ProfilePage userEmail={userEmail} savedSets={savedSets} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} onAddPoints={addPoints} userAvatar={userAvatar} onAvatarUpdate={handleAvatarUpdate} tokens={tokens} addDumaItem={addDumaItem} />} />
          <Route path="/admin/orders" element={<AdminOrdersPage authToken={authToken} userEmail={userEmail} />} />
          <Route path="/model" element={<ModelFriendlyPage />} />
          <Route path="/TermsofService" element={<TermsOfServicePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
        </Routes>

        <footer style={{ marginTop: '60px', padding: '20px 60px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '12px' }}>
          <Link to="/TermsofService" style={{ color: '#666', textDecoration: 'none' }}>Terms of Service</Link>
          <Link to="/privacy" style={{ color: '#666', textDecoration: 'none' }}>Privacy Policy</Link>
        </footer>
      </div>
    </Router>
  );
}

// --- TERMS OF SERVICE PAGE ---
const TermsOfServicePage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '60px 30px', fontFamily: 'Inter, sans-serif', color: '#222', lineHeight: 1.8 }}>
      <h1>Terms of Service</h1>
      <p style={{ color: '#888', fontSize: '13px' }}>Last updated: August 4, 2026</p>
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing or using The Majorities ecosystem, you agree to be bound by these Terms.</p>
    </div>
  );
};

// --- PRIVACY POLICY PAGE ---
const PrivacyPolicyPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '60px 30px', fontFamily: 'Inter, sans-serif', color: '#222', lineHeight: 1.8 }}>
      <h1>Privacy Policy</h1>
      <p style={{ color: '#888', fontSize: '13px' }}>Last updated: August 4, 2026</p>
      <h2>1. Information We Collect</h2>
      <p>We log data to fulfill custom cosmetic orders and handle account interactions.</p>
    </div>
  );
};

// --- STYLES OBJECT ---
const styles = {
  pageWrapper: { fontFamily: 'Inter, sans-serif', color: '#222' },
  header: { display: "flex", justifyContent: "space-between", padding: "15px 60px", borderBottom: "1px solid #eee", alignItems: 'center' },
  logo: { fontSize: "18px", fontWeight: "700" },
  nav: { display: "flex", gap: "25px", fontSize: "13px", alignItems: 'center' },
  navLink: { textDecoration: 'none', color: '#222', fontWeight: '500' },
  auth: { fontWeight: "600", textDecoration: 'none', color: '#222', cursor: 'pointer' },
  layout: { display: "flex", padding: "20px 60px" },
  left: { width: "70%", paddingRight: "40px" },
  right: { width: "30%", padding: "20px", borderRadius: "24px", backgroundColor: "#f9f9f9", height: "fit-content", position: 'sticky', top: '20px' },
  rowSection: { marginBottom: "20px" },
  rowLabel: { fontSize: "14px", color: "#666", fontWeight: "600", marginBottom: "10px" },
  scrollRow: { display: "flex", gap: "12px", overflowX: "auto", paddingBottom: '10px' },
  card: { minWidth: "140px", padding: "10px", borderRadius: "16px", textAlign: "center", cursor: "pointer", backgroundColor: "#fff" },
  imagePlaceholder: { width: '100%', height: '60px', backgroundColor: '#f0f0f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: "12px", marginTop: "6px" },
  summaryContainer: { backgroundColor: '#fff', padding: '15px', borderRadius: '20px', border: '1px solid #eee' },
  checkoutBtn: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #222', background: '#fff', cursor: 'pointer', marginBottom: '10px', fontWeight: '600' },
  authContainer: { display: 'flex', justifyContent: 'center', minHeight: '70vh', alignItems: 'center' },
  authCard: { width: '380px', padding: '30px', border: '1px solid #eee', borderRadius: '24px', textAlign: 'center' },
  input: { width: '100%', padding: '12px', margin: '8px 0', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' },
  authButton: { width: '100%', padding: '12px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  formSectionTitle: { fontSize: '13px', fontWeight: '800', marginTop: '20px', borderBottom: '1px solid #eee', paddingBottom: '5px', textTransform: 'uppercase' },
  uploadBox: { border: '2px dashed #ddd', borderRadius: '12px', padding: '20px', textAlign: 'center', backgroundColor: '#fafafa' },
  dumaCard: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '20px', marginBottom: '20px' },
  typeTag: { background: '#222', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '10px' },
  voteBtn: { padding: '6px 14px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  generalSecretaryBadge: { boxShadow: '0 0 8px rgba(255,215,0,0.7)', background: 'linear-gradient(90deg,#b8860b,#ffd700,#b8860b)', color: '#fff', border: 'none' }
};
