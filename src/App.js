import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation, useParams } from "react-router-dom";
import AdMonetization, { trackEvent } from "./components/AdMonetization";

// --- 1. SHOPIFY CONFIGURATION ---
const SHOP_DOMAIN = "c0bqfe-z2.myshopify.com";
const DEFAULT_SELLING_PLAN_ID = "1467875506";

const PRODUCT_VARIANT_MAP = {
  "The Majorities Shampoo": { merchandiseId: "47555331358898", pricing: { oneTime: 7, subscription: 6 }, sellingPlanId: DEFAULT_SELLING_PLAN_ID },
  "The Majorities Conditioner": { merchandiseId: "47555331555506", pricing: { oneTime: 7, subscription: 6 }, sellingPlanId: DEFAULT_SELLING_PLAN_ID },
  "The Majorities Hair Oil": { merchandiseId: "47555331752114", pricing: { oneTime: 7, subscription: 6 }, sellingPlanId: DEFAULT_SELLING_PLAN_ID },
  "The Majorities Facial Scrub": { merchandiseId: "47555331948722", pricing: { oneTime: 7, subscription: 6 }, sellingPlanId: DEFAULT_SELLING_PLAN_ID },
  "The Majorities Face Toner": { merchandiseId: "47555332145330", pricing: { oneTime: 7, subscription: 6 }, sellingPlanId: DEFAULT_SELLING_PLAN_ID },
  "The Majorities Moisturizing Lotion": { merchandiseId: "47555332309170", pricing: { oneTime: 7, subscription: 6 }, sellingPlanId: DEFAULT_SELLING_PLAN_ID }
};

// --- 2. BACKEND CONFIGURATION ---
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://hair-backend-1.onrender.com";

// --- 3. RANK SYSTEM (51-Tier Hierarchy) ---
const RANK_TIERS = [
  { title: "Nice and Helpful", min: 75000000 },
  { title: "Servant of the People", min: 50000000 },
  { title: "Servant of the Majorities", min: 45000000 },
  { title: "General Secretary of The Majorities", min: 40000000 },
  { title: "Premier of The Majorities", min: 35000000 },
  { title: "Chairman of the Standing Committee of the Majorities Duma", min: 30000000 },
  { title: "Chairman of the National Committee of the Majorities Political Consultative", min: 25000000 },
  { title: "Director of the General Office of the Majorities", min: 20000000 },
  { title: "Secretary of the Central Commission for Discipline Inspection", min: 15000000 },
  { title: "Politburo Member of The Majorities", min: 10000000 },
  { title: "Secretary of Majorities Committees of Provinces", min: 5000000 },
  { title: "Champion of the The Majorities", min: 4500000 },
  { title: "Hero of the Majorities", min: 4000000 },
  { title: "Order of The Majorities", min: 3500000 },
  { title: "Order of the October Revolution", min: 3000000 },
  { title: "Order of the Red Banner of Labor", min: 2500000 },
  { title: "Order of Friendship of Peoples", min: 2000000 },
  { title: "Order of the Badge of Honor", min: 1500000 },
  { title: "the Salvation of the Drowning", min: 1000000 },
  { title: "Perun", min: 900000 },
  { title: "Veles", min: 800000 },
  { title: "Svarog", min: 700000 },
  { title: "Mokosh", min: 600000 },
  { title: "Dazhbog", min: 500000 },
  { title: "Stribog", min: 400000 },
  { title: "Rod", min: 300000 },
  { title: "Yarilo", min: 200000 },
  { title: "Lada", min: 100000 },
  { title: "Morana", min: 50000 },
  { title: "Belobog", min: 25000 },
  { title: "Chernobog", min: 10000 },
  { title: "Leshiy", min: 5000 },
  { title: "Vodyanoy", min: 2500 },
  { title: "Domovoi", min: 1500 },
  { title: "Rusalka", min: 1000 },
  { title: "Rugiaevit", min: 500 },
  { title: "Schout-bij-nacht", min: 250 },
  { title: "Crow", min: 100 },
  { title: "Comrade", min: 1 }
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
  return Math.max(0, RANK_TIERS[currentIndex - 1].min - currentScore);
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
  if (!nextTier) return { currentMin, nextMin: currentMin, progressPercent: 100 };
  const span = Math.max(1, nextTier.min - currentMin);
  const progressPercent = Math.min(100, Math.max(0, ((currentScore - currentMin) / span) * 100));
  return { currentMin, nextMin: nextTier.min, progressPercent };
};

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

const getProductCommerceConfig = (productName) => PRODUCT_VARIANT_MAP[productName] || { merchandiseId: "", pricing: { oneTime: 0, subscription: 0 }, sellingPlanId: null };

const calculateSetTotals = (items = []) => items.reduce((totals, item) => {
  const { pricing } = getProductCommerceConfig(item.name);
  return { oneTime: totals.oneTime + (pricing.oneTime || 0), subscription: totals.subscription + (pricing.subscription || 0) };
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
  const goldTier = ["Nice and Helpful", "Servant of the People", "Servant of the Majorities", "General Secretary of The Majorities", "Premier of The Majorities", "Chairman of the Standing Committee of the Majorities Duma", "Chairman of the National Committee of the Majorities Political Consultative", "Director of the General Office of the Majorities", "Secretary of the Central Commission for Discipline Inspection", "Politburo Member of The Majorities", "Secretary of Majorities Committees of Provinces", "Champion of the The Majorities", "Hero of the Majorities", "Order of The Majorities", "Order of the October Revolution", "Order of the Red Banner of Labor", "Order of Friendship of Peoples", "Order of the Badge of Honor", "the Salvation of the Drowning"];
  const silverTier = ["Perun", "Veles", "Svarog", "Mokosh", "Dazhbog", "Stribog", "Rod", "Yarilo"];
  if (goldTier.includes(rankTitle)) return '#FFD700';
  if (silverTier.includes(rankTitle)) return '#C0C0C0';
  return '#888';
};

const RankBadge = ({ rankTitle }) => {
  const color = getRankColor(rankTitle);
  const isTopRank = rankTitle === "Nice and Helpful";
  const isLongTitle = rankTitle && rankTitle.length > 20;
  return (
    <span style={{ fontSize: isLongTitle ? '9px' : '11px', fontWeight: '700', color: color, padding: '3px 8px', borderRadius: '4px', border: `1px solid ${color}`, textTransform: 'uppercase', letterSpacing: isLongTitle ? '0px' : '0.5px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', maxWidth: '200px', lineHeight: '1.3', ...(isTopRank ? styles.generalSecretaryBadge : {}) }}>
      {rankTitle}
    </span>
  );
};

const safeSocialUrl = (raw) => (!raw ? null : /^https?:\/\//i.test(raw) ? raw : `https://${raw}`);

const CredentialHeader = ({ email, rankTitle, rankScore, avatarUrl, socialLinks = {} }) => {
  const initial = (email || 'C')[0].toUpperCase();
  const color = getRankColor(rankTitle || 'Comrade');
  const isTopRank = rankTitle === "Nice and Helpful";
  const formattedRankTitle = getFormattedRankTitle(rankTitle || 'Comrade', getCompletedPromptIds(email).length);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#fff', flexWrap: 'wrap', marginBottom: '12px' }}>
      <div style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1.5px solid #1a1a1a', backgroundColor: avatarUrl ? 'transparent' : color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#fff', flexShrink: 0, overflow: 'hidden', ...(isTopRank && !avatarUrl ? { boxShadow: '0 0 12px rgba(255,215,0,0.8)' } : {}) }}>
        {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
      </div>
      <span style={{ fontWeight: '600', fontSize: '14px', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>{email}</span>
      <span style={{ fontSize: rankTitle && rankTitle.length > 20 ? '9px' : '11px', fontWeight: '700', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', backgroundColor: '#000', color: '#fff', whiteSpace: 'nowrap', letterSpacing: rankTitle && rankTitle.length > 20 ? '0px' : '0.5px', lineHeight: '1.3', ...(isTopRank ? styles.generalSecretaryBadge : {}) }}>
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
        <button type="button" onClick={() => { const sanitizedVal = localVal.trim(); if (onChangeGlobal) onChangeGlobal(socialKey, sanitizedVal); onSave(socialKey, sanitizedVal); }} disabled={isSocialSaveDisabled} style={{ padding: '10px 16px', backgroundColor: saveStatus === "saved" ? '#27ae60' : saveStatus === "error" ? '#e74c3c' : '#222', color: '#fff', border: 'none', borderRadius: '8px', cursor: isSocialSaveDisabled ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '12px', minWidth: '85px' }}>
          {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "✓ Linked" : "Save"}
        </button>
      </div>
    </div>
  );
};

const GuestSubmissionPrompt = ({ message = "Please log in or create an account before submitting." }) => {
  const navigate = useNavigate();
  return (
    <div style={{ ...styles.dumaCard, background: '#fff8e1', border: '1px solid #f1d78c', marginBottom: '20px' }}>
      <p style={{ marginTop: 0, marginBottom: '14px', color: '#5f4b00', fontSize: '13px' }}>{message}</p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button type="button" style={styles.authButton} onClick={() => navigate('/login')}>Log In</button>
        <button type="button" style={{ ...styles.authButton, background: '#fff', color: '#222', border: '1px solid #222' }} onClick={() => navigate('/signup')}>Register</button>
      </div>
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const productsData = {
  shampoos: [{ name: "The Majorities Shampoo", desc: <p>Reset and revive stressed hair with a salon-grade deep cleansing wash.</p> }],
  conditioners: [{ name: "The Majorities Conditioner", desc: <p>Rescue and restore dry hair with rich botanical therapy.</p> }],
  oils: [{ name: "The Majorities Hair Oil", desc: <p>Lightweight elixir for a sleek, high-gloss finish.</p> }],
  faceScrubs: [{ name: "The Majorities Facial Scrub", desc: <p>Dual-action polish to gently refine skin texture.</p> }],
  toners: [{ name: "The Majorities Face Toner", desc: <p>Refreshing hydration splash that tightens pores.</p> }],
  faceCreams: [{ name: "The Majorities Moisturizing Lotion", desc: <p>Nourishing lotion with Ceramides and Vitamin E.</p> }]
};

function LandingPage({ saveSetToProfile, onAddPoints, savedSets }) {
  const [selection, setSelection] = useState([]);
  const [focusedItem, setFocusedItem] = useState(null);
  const isSetComplete = selection.length === 6;
  const setTotals = calculateSetTotals(selection);

  const handleSelect = (item) => {
    setFocusedItem(item);
    setSelection(prev => (prev.some(i => i.name === item.name) ? prev.filter(i => i.name !== item.name) : prev.length >= 6 ? prev : [...prev, item]));
  };

  return (
    <div style={{ ...styles.layout, padding: '20px 60px' }}>
      <div style={{ ...styles.left, width: '70%' }}>
        {Object.keys(productsData).map(category => (
          <div key={category} style={styles.rowSection}>
            <h3 style={styles.rowLabel}>Pick {category}</h3>
            <div style={styles.scrollRow}>
              {productsData[category].map(item => (
                <div key={item.name} onClick={() => handleSelect(item)} style={{ ...styles.card, border: selection.some(i => i.name === item.name) ? "2px solid #222" : "1px solid #eee" }}>
                  <div style={styles.imagePlaceholder}>{item.name[0]}</div>
                  <div style={styles.itemName}>{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <aside style={{ ...styles.right, width: '30%' }}>
        <h4>Your Custom Set ({selection.length}/6)</h4>
        {isSetComplete && <button style={styles.checkoutBtn} onClick={() => submitShopifyCheckout(selection, "one-time")}>Checkout ({formatCurrency(setTotals.oneTime)})</button>}
      </aside>
    </div>
  );
}

const RecommendPage = ({ addDumaItem, userEmail, rankTitle, rankScore, authToken, userAvatar }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", company: "", productType: "", websiteLink: "", whyRecommend: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    addDumaItem({ ...formData, id: Date.now(), type: "Product Recommendation", submittedBy: userEmail || "anonymous", submitterRank: rankTitle || 'Comrade' });
    setSubmitted(true);
  };

  if (submitted) return <div style={{ padding: '50px', textAlign: 'center' }}><h2>Recommendation Submitted!</h2><button onClick={() => navigate("/duma")}>View Duma</button></div>;

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2>Submit Product Recommendation</h2>
      <form style={styles.dumaCard} onSubmit={handleSubmit}>
        <input required placeholder="Product Name *" style={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        <input required placeholder="Company Name *" style={styles.input} value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
        <input required placeholder="Product Type *" style={styles.input} value={formData.productType} onChange={e => setFormData({...formData, productType: e.target.value})} />
        <input required placeholder="Website Link *" style={styles.input} value={formData.websiteLink} onChange={e => setFormData({...formData, websiteLink: e.target.value})} />
        <textarea required placeholder="Why Recommend? *" style={{ ...styles.input, height: '100px' }} value={formData.whyRecommend} onChange={e => setFormData({...formData, whyRecommend: e.target.value})} />
        <button type="submit" style={styles.authButton}>Submit to Duma</button>
      </form>
    </div>
  );
};

const PartnerPage = ({ addDumaItem, userEmail, rankTitle, rankScore, authToken, userAvatar }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ company: "", productType: "", productDescription: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    addDumaItem({ ...formData, id: Date.now(), type: "Partner", submittedBy: userEmail || "anonymous", submitterRank: rankTitle || 'Comrade' });
    setSubmitted(true);
  };

  if (submitted) return <div style={{ padding: '50px', textAlign: 'center' }}><h2>Partner Application Submitted!</h2><button onClick={() => navigate("/duma")}>View Duma</button></div>;

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2>Partner with The Majorities</h2>
      <form style={styles.dumaCard} onSubmit={handleSubmit}>
        <input required placeholder="Company Name *" style={styles.input} value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
        <input required placeholder="Product Type *" style={styles.input} value={formData.productType} onChange={e => setFormData({...formData, productType: e.target.value})} />
        <textarea required placeholder="Product Description *" style={{ ...styles.input, height: '100px' }} value={formData.productDescription} onChange={e => setFormData({...formData, productDescription: e.target.value})} />
        <button type="submit" style={styles.authButton}>Submit Partnership</button>
      </form>
    </div>
  );
};

const CultureLabPage = ({ addDumaItem, userEmail, rankTitle, rankScore, authToken, onAddPoints, userAvatar }) => {
  const navigate = useNavigate();
  const [response, setResponse] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    addDumaItem({ id: Date.now(), type: "Culture", prompt: "Post My Anything", response, submittedBy: userEmail, submitterRank: rankTitle || 'Comrade' });
    if (onAddPoints) onAddPoints(100);
    navigate("/duma");
  };

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2>Share Your Perspective</h2>
      <form style={styles.dumaCard} onSubmit={handleSubmit}>
        <textarea required placeholder="Type your response here..." style={{ ...styles.input, height: '120px' }} value={response} onChange={(e) => setResponse(e.target.value)} />
        <button type="submit" style={styles.authButton}>Submit to Duma (+100 pts)</button>
      </form>
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
    fetch(`${BACKEND_URL}/api/profile`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(r => r.json())
      .then(data => {
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
      })
      .catch(() => {});
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
          body: JSON.stringify({ prompt: promptText, response: cultureResponse, category: "Culture", mediaUrls: uploadedMediaUrls })
        });
        if (!res.ok) {
          setCultureSubmitStatus("error");
          setCultureErrorMsg("Submission failed");
          return;
        }
      }

      if (selectedPrompt) markPromptCompleted(userEmail, selectedPrompt.id);

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

  const handleSaveSocialLink = async (key, valueOverride) => {
    if (!authToken) return;
    const resolvedValue = typeof valueOverride === "string" ? valueOverride : socialLinks[key];
    if (typeof valueOverride === "string") setSocialLinks(prev => ({ ...prev, [key]: valueOverride }));
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

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: '700' }}>Welcome</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <RankBadge rankTitle={displayRankTitle} />
          <span style={{ fontSize: '13px', color: '#666' }}>{displayRankScore.toLocaleString()} points</span>
        </div>
      </div>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '8px', fontWeight: '600' }}>Profile Pictures (Up to 6)</h2>
        <div style={styles.uploadBox}>
          {activeThumbnail && <img src={activeThumbnail} alt="Main Avatar" style={{ width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #222', marginBottom: '10px' }} />}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {profilePhotos.map((photo, index) => (
              <div key={index} style={{ border: photo === activeThumbnail ? '3px solid #27ae60' : '1px solid #ddd', padding: '4px' }}>
                <img src={photo} alt="Profile" style={{ width: '100%', height: '85px', objectFit: 'cover' }} />
                <button type="button" onClick={() => handleSelectThumbnail(photo)} style={{ width: '100%', fontSize: '10px', background: photo === activeThumbnail ? '#27ae60' : '#222', color: '#fff' }}>
                  {photo === activeThumbnail ? '✓ Selected' : 'Set as Main'}
                </button>
                <button type="button" onClick={() => handleRemovePhoto(photo)} style={{ fontSize: '10px' }}>Remove</button>
              </div>
            ))}
          </div>
          <input ref={photoInputRef} type="file" accept="image/jpeg,image/png" multiple onChange={handleProfilePhotosUpload} style={{ display: 'none' }} />
          <button type="button" disabled={profilePhotos.length >= 6} onClick={() => photoInputRef.current && photoInputRef.current.click()} style={styles.authButton}>
            + Add Profile Pictures
          </button>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>Socials</h2>
        <div style={styles.dumaCard}>
          {SOCIAL_FIELDS.map(social => (
            <SocialInputRow key={social.key} socialKey={social.key} label={social.label} placeholder={social.placeholder} initialValue={socialLinks[social.key]} saveStatus={socialSaveStatus[social.key]} onChangeGlobal={(k, v) => setSocialLinks(prev => ({ ...prev, [k]: v }))} onSave={handleSaveSocialLink} />
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '8px', fontWeight: '600' }}>Post My Anything</h2>
        <form onSubmit={handleCultureSubmit} style={styles.dumaCard}>
          {cultureErrorMsg && <div style={{ color: '#e74c3c' }}>{cultureErrorMsg}</div>}
          <input type="file" accept="image/*,video/*" multiple onChange={handleCultureMediaChange} style={styles.input} />
          <textarea required placeholder="Write your post details here..." style={{ ...styles.input, height: '100px' }} value={cultureResponse} onChange={e => setCultureResponse(e.target.value)} />

          <div style={{ marginTop: '24px' }}>
            <h3>Answer Prompts for Points (Optional)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '215px', overflowY: 'auto', border: '1px solid #eee', padding: '10px' }}>
              {perspectivePrompts.map((p) => (
                <button key={p.id} type="button" onClick={() => setSelectedPrompt(selectedPrompt?.id === p.id ? null : p)} style={{ textAlign: 'left', padding: '10px', background: selectedPrompt?.id === p.id ? '#f0f0f0' : '#fff', color: '#000' }}>
                  {p.id}. {p.text}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" style={{ ...styles.authButton, marginTop: '20px' }}>Submit Post to Duma</button>
        </form>
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
        [...data, ...items].forEach(item => { const id = item._id || item.id; if (id) uniqueMap.set(String(id), item); });
        setDumaItems(Array.from(uniqueMap.values()));
      }
    }).catch(() => {});
  }, [items]);

  const handleDeletePost = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      if (authToken) {
        await fetch(`${BACKEND_URL}/api/duma/${itemId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${authToken}` } });
      }
      setDumaItems(prev => prev.filter(item => (item._id || item.id) !== itemId));
    } catch { alert("Error deleting post."); }
  };

  const handleVote = async (itemId, voteType) => {
    if (!authToken) return alert("Please log in to vote.");
    if (userVotes[itemId]) return;
    setUserVotes(prev => ({ ...prev, [itemId]: voteType }));
    if (onAddPoints) onAddPoints(1);
    try {
      await fetch(`${BACKEND_URL}/api/duma/${itemId}/vote`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ vote: voteType }) });
    } catch {}
  };

  const culturalItems = dumaItems.filter(item => item.section === "Cultural" || item.category === "Culture" || item.type === "Video" || item.type === "Culture");
  const recommendationItems = dumaItems.filter(item => item.type === "Product Recommendation" || item.type === "Recommendation");
  const partnerItems = dumaItems.filter(item => item.type === "Partner");

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', minHeight: '80vh' }}>
      <aside style={{ width: '180px', padding: '20px 10px' }}><AdMonetization placement="duma_left_sidebar" /></aside>
      <main style={{ flex: 1, maxWidth: '850px', padding: '40px 20px' }}>
        <h2>The Majorities' Duma</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button onClick={() => setActiveSection("Culture")} style={{ padding: '10px 20px', background: activeSection === "Culture" ? '#222' : '#f5f5f5', color: activeSection === "Culture" ? '#fff' : '#222' }}>Culture ({culturalItems.length})</button>
          <button onClick={() => setActiveSection("Recommendations")} style={{ padding: '10px 20px', background: activeSection === "Recommendations" ? '#222' : '#f5f5f5', color: activeSection === "Recommendations" ? '#fff' : '#222' }}>Recommendations ({recommendationItems.length})</button>
          <button onClick={() => setActiveSection("Partners")} style={{ padding: '10px 20px', background: activeSection === "Partners" ? '#222' : '#f5f5f5', color: activeSection === "Partners" ? '#fff' : '#222' }}>Partners ({partnerItems.length})</button>
        </div>

        {activeSection === "Culture" && culturalItems.map(item => (
          <div key={item._id || item.id} style={styles.dumaCard}>
            {userEmail && item.submittedBy === userEmail && <button onClick={() => handleDeletePost(item._id || item.id)} style={{ color: '#e74c3c' }}>🗑 Delete</button>}
            <p>{item.response || item.desc}</p>
            {authToken && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleVote(item._id || item.id, 'yes')}>👍 Like</button>
                <button onClick={() => handleVote(item._id || item.id, 'abstain')}>Abstain</button>
              </div>
            )}
          </div>
        ))}

        {activeSection === "Recommendations" && recommendationItems.map(item => (
          <div key={item._id || item.id} style={styles.dumaCard}>
            {userEmail && item.submittedBy === userEmail && <button onClick={() => handleDeletePost(item._id || item.id)} style={{ color: '#e74c3c' }}>🗑 Delete</button>}
            <h3>{item.name} by {item.company}</h3>
            {authToken && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleVote(item._id || item.id, 'yes')}>👍 Up</button>
                <button onClick={() => handleVote(item._id || item.id, 'no')}>👎 Down</button>
                <button onClick={() => handleVote(item._id || item.id, 'abstain')}>Abstain</button>
              </div>
            )}
          </div>
        ))}

        {activeSection === "Partners" && partnerItems.map(item => (
          <div key={item.id || item._id} style={styles.dumaCard}>
            <h4>{item.productType} - {item.company}</h4>
            <p>{item.productDescription}</p>
          </div>
        ))}

        <div style={{ marginTop: '40px', textAlign: 'center' }}><AdMonetization placement="duma_bottom_banner" /></div>
      </main>
      <aside style={{ width: '180px', padding: '20px 10px' }}><AdMonetization placement="duma_right_sidebar" /></aside>
    </div>
  );
};

const PerspectivesPage = ({ items, userEmail, rankTitle, rankScore, userAvatar }) => {
  const [allItems, setAllItems] = useState(items);
  useEffect(() => { fetch(`${BACKEND_URL}/api/duma`).then(r => r.json()).then(data => { if (Array.isArray(data)) setAllItems(data); }).catch(() => {}); }, [items]);
  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', minHeight: '80vh' }}>
      <aside style={{ width: '180px', padding: '20px 10px' }}><AdMonetization placement="culture_left_sidebar" /></aside>
      <main style={{ flex: 1, maxWidth: '850px', padding: '40px 20px' }}>
        <h2>My Perspectives</h2>
        {allItems.map(item => <div key={item.id || item._id} style={styles.dumaCard}><p><strong>{item.submittedBy}</strong>: {item.response || item.desc}</p></div>)}
      </main>
      <aside style={{ width: '180px', padding: '20px 10px' }}><AdMonetization placement="culture_right_sidebar" /></aside>
    </div>
  );
};

// --- AUTH, PAGES, ROUTING ---
const ForgotPasswordPage = () => <div><h2>Forgot Password</h2></div>;
const ResetPasswordPage = () => <div><h2>Reset Password</h2></div>;
const LoginPage = () => <div><h2>Login Page</h2></div>;
const SignupPage = () => <div><h2>Sign Up Page</h2></div>;
const OAuthCallbackPage = () => <div><h2>Authenticating...</h2></div>;
const AdminOrdersPage = () => <div><h2>Fulfillment Dashboard</h2></div>;
const ModelFriendlyPage = () => <div><h1>The Majorities — Structured Site Data</h1></div>;
const TermsOfServicePage = () => <div><h1>Terms of Service</h1></div>;
const PrivacyPolicyPage = () => <div><h1>Privacy Policy</h1></div>;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [rankTitle, setRankTitle] = useState("Comrade");
  const [rankScore, setRankScore] = useState(1);
  const [savedSets, setSavedSets] = useState([]);
  const [userAvatar, setUserAvatar] = useState("");
  const [dumaItems, setDumaItems] = useState([]);

  const addDumaItem = (item) => setDumaItems(prev => [item, ...prev]);
  const addPoints = (points) => setRankScore(prev => prev + points);

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
            <Link to="/profile" style={styles.navLink}>Profile</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<LandingPage saveSetToProfile={(s) => setSavedSets([s, ...savedSets])} onAddPoints={addPoints} savedSets={savedSets} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/google/callback" element={<OAuthCallbackPage />} />
          <Route path="/auth/instagram/callback" element={<OAuthCallbackPage />} />
          <Route path="/auth/tiktok/callback" element={<OAuthCallbackPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/recommend" element={<RecommendPage addDumaItem={addDumaItem} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} userAvatar={userAvatar} />} />
          <Route path="/partner" element={<PartnerPage addDumaItem={addDumaItem} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} userAvatar={userAvatar} />} />
          <Route path="/culture" element={<CultureLabPage addDumaItem={addDumaItem} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} onAddPoints={addPoints} userAvatar={userAvatar} />} />
          <Route path="/duma" element={<DumaPage items={dumaItems} authToken={authToken} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} onAddPoints={addPoints} userAvatar={userAvatar} />} />
          <Route path="/perspectives" element={<PerspectivesPage items={dumaItems} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} userAvatar={userAvatar} />} />
          <Route path="/profile" element={<ProfilePage userEmail={userEmail} savedSets={savedSets} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} onAddPoints={addPoints} userAvatar={userAvatar} onAvatarUpdate={setUserAvatar} addDumaItem={addDumaItem} />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/model" element={<ModelFriendlyPage />} />
          <Route path="/TermsofService" element={<TermsOfServicePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
        </Routes>
      </div>
    </Router>
  );
}

const styles = {
  pageWrapper: { fontFamily: 'Inter, sans-serif', color: '#222' },
  header: { display: "flex", justifyContent: "space-between", padding: "15px 60px", borderBottom: "1px solid #eee" },
  logo: { fontSize: "18px", fontWeight: "700" },
  nav: { display: "flex", gap: "25px", fontSize: "13px" },
  navLink: { textDecoration: 'none', color: '#222' },
  layout: { display: "flex", padding: "20px 60px" },
  left: { width: "70%" },
  right: { width: "30%", padding: "20px", background: "#f9f9f9" },
  rowSection: { marginBottom: "20px" },
  rowLabel: { fontSize: "14px", color: "#666" },
  scrollRow: { display: "flex", gap: "12px", overflowX: "auto" },
  card: { minWidth: "140px", padding: "10px", borderRadius: "16px", backgroundColor: "#fff" },
  imagePlaceholder: { width: '100%', height: '60px', backgroundColor: '#f0f0f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: "12px" },
  checkoutBtn: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #222' },
  input: { width: '100%', padding: '12px', margin: '8px 0', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' },
  authButton: { width: '100%', padding: '12px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '8px' },
  uploadBox: { border: '2px dashed #ddd', borderRadius: '12px', padding: '20px', textAlign: 'center' },
  dumaCard: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '20px', marginBottom: '20px' },
  generalSecretaryBadge: { background: 'linear-gradient(90deg,#b8860b,#ffd700,#b8860b)', color: '#fff' }
};
