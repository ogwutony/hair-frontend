import React, { useState, useEffect, useCallback, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation, useParams } from "react-router-dom";
import { trackEvent } from "./components/AdMonetization";

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

// --- MOBILE RESPONSIVE HOOK ---
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

// --- LOCATION AUTOCOMPLETE COMPONENT (Google Places) ---
const LocationAutocomplete = ({ value, onChange, placeholder, style }) => {
  const inputRef = React.useRef(null);
  const autocompleteRef = React.useRef(null); 
  
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `.pac-container { z-index: 10000 !important; }`;
    document.head.appendChild(styleEl);
    return () => { if (document.head.contains(styleEl)) document.head.removeChild(styleEl); };
  }, []);

  useEffect(() => {
    let cancelled = false;

    function initAutocomplete() {
      if (cancelled || !window.google || !window.google.maps || !inputRef.current) return;
      if (autocompleteRef.current) return; 
      const autocomplete = autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ['formatted_address', 'name'],
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        let locationText = '';
        if (place.name && place.formatted_address && !place.formatted_address.includes(place.name)) {
          locationText = `${place.name}, ${place.formatted_address}`;
        } else {
          locationText = place.formatted_address || place.name || '';
        }
        onChange(locationText);
      });
      inputRef.current.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') e.preventDefault();
      });
    }

    if (typeof window !== 'undefined' && !window.google) {
      const existingScript = document.getElementById('google-places-script');
      if (existingScript) {
        existingScript.addEventListener('load', initAutocomplete);
      } else {
        const script = document.createElement('script');
        script.id = 'google-places-script';
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.onload = initAutocomplete;
        document.head.appendChild(script);
      }
    } else {
      initAutocomplete();
    }

    return () => { cancelled = true; };
  }, [onChange]);

  useEffect(() => {
    if (inputRef.current && value !== undefined && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);
  
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...style, width: '100%', boxSizing: 'border-box' }}
      />
    </div>
  );
};

// --- 3. RANK SYSTEM (50-Tier Hierarchy) ---
const RANK_TIERS = [
  { title: "Nice and Helpful", min: 75000000 },
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
  { title: "Champion of the The Majorities",                   min: 4500000 },
  { title: "Hero of the Majorities",                    min: 4000000 },
  { title: "Order of The Majorities",                   min: 3500000 },
  { title: "Order of the October Revolution",           min: 3000000 },
  { title: "Order of the Red Banner of Labor",          min: 2500000 },
  { title: "Order of Friendship of Peoples",            min: 2000000 },
  { title: "Order of the Badge of Honor",               min: 1500000 },
  { title: "the Salvation of the Drowning",             min: 1000000 },
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

const getRankTitle = (score) => {
  for (const tier of RANK_TIERS) {
    if (score >= tier.min) return tier.title;
  }
  return "Comrade";
};

const LOWER_HIERARCHY_TITLES = RANK_TIERS.slice(RANK_TIERS.findIndex(t => t.title === "Perun")).map(t => t.title);

const getFormattedRankTitle = (rankTitle, completedPromptsCount = 0) => {
  if (LOWER_HIERARCHY_TITLES.includes(rankTitle) && completedPromptsCount >= 15) {
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
  return {
    currentMin,
    nextMin: nextTier.min,
    progressPercent
  };
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
    const lineItems = items
      .map((item) => `${getProductCommerceConfig(item.name).merchandiseId}:1`)
      .join(",");
    window.location.href =
      `https://${SHOP_DOMAIN}/cart/${lineItems}` +
      `?checkout[shipping_address][country]=US`;
    return;
  }

  const subscriptionLineItems = items
    .map((item) => `${getProductCommerceConfig(item.name).merchandiseId}:1`)
    .join(",");

  const sellingPlanId = getProductCommerceConfig(items[0].name).sellingPlanId;

  window.location.href =
    `https://${SHOP_DOMAIN}/cart/${subscriptionLineItems}` +
    `?selling_plan=${sellingPlanId}&checkout[shipping_address][country]=US`;
};

const getRankColor = (rankTitle) => {
  const goldTier = [
    "Servant of the People", "Servant of the Majorities", "General Secretary of The Majorities",
    "Premier of The Majorities", "Chairman of the Standing Committee of the Majorities Duma",
    "Chairman of the National Committee of the Majorities Political Consultative",
    "Director of the General Office of the Majorities",
    "Secretary of the Central Commission for Discipline Inspection",
    "Politburo Member of The Majorities", "Secretary of Majorities Committees of Provinces",
    "Hero of Socialist Labor", "Hero of the Majorities", "Order of The Majorities",
    "Order of the October Revolution", "Order of the Red Banner of Labor",
    "Order of Friendship of Peoples", "Order of the Badge of Honor",
    "the Salvation of the Drowning"
  ];
  const silverTier = ["Perun", "Veles", "Svarog", "Mokosh", "Dazhbog", "Stribog", "Rod", "Yarilo"];
  if (goldTier.includes(rankTitle)) return '#FFD700';
  if (silverTier.includes(rankTitle)) return '#C0C0C0';
  return '#888';
};

// --- RANK BADGE COMPONENT ---
const RankBadge = ({ rankTitle, score }) => {
  const color = getRankColor(rankTitle);
  const isTopRank = rankTitle === "Servant of the People";
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

// --- CREDENTIAL HEADER COMPONENT ---
const safeSocialUrl = (raw) => {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
};

const isVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:video/') || url.startsWith('blob:')) return true;
  return /\.(mp4|mov|webm|m4v|ogv|3gp|mkv)($|\?)/i.test(url) || 
         url.includes('/video/upload/') || 
         url.includes('/f_mp4') || 
         (url.includes('cloudinary.com') && /\.(mov|webm|m4v)$/i.test(url));
};

const normalizeMediaVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  let normalized = url;
  
  if (normalized.includes('cloudinary.com')) {
    normalized = normalized.replace('/image/upload/', '/video/upload/');
    if (normalized.includes('/upload/') && !normalized.includes('/upload/f_mp4/') && !normalized.includes('/upload/f_auto/')) {
      normalized = normalized.replace('/upload/', '/upload/f_mp4,q_auto/');
    }
    normalized = normalized.replace(/\.(mov|webm|m4v)$/i, '.mp4');
  }
  return normalized;
};

const SnapchatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 448 418" fill="currentColor" style={{ marginRight: '6px', verticalAlign: 'text-bottom' }}>
<path d="M447.8 285.9c-2.3-4.3-6.2-7.2-11.8-8.8-19.3-5-38.3-8.8-49.8-10.7-3.9-.6-6.1-2.1-6.4-4.5-.4-3.5 1-6.1 4.2-7.6 15.6-7.4 30.6-16.1 44.9-26.2 6.6-4.7 9.8-11.8 9.5-21.2-.3-9.5-4-16.3-11.1-20.5-25.1-14.7-52.6-25-82.6-30.8-6.1-1.2-9.4-4-9.8-8.5-.3-3.1 1.4-5.6 5.1-7.5 18.2-8.3 33.7-20 46.5-35 8.1-9.5 10.3-21 6.8-34.6-3.4-13.6-11.7-22.3-24.9-26.1-20.5-5.9-42-8.9-64.4-8.9-22.4 0-43.9 3-64.4 8.9-13.2 3.8-21.5 12.5-24.9 26.1-3.5 13.6-1.2 25.1 6.8 34.6 12.8 15 28.3 26.7 46.5 35 3.7 1.9 5.4 4.4 5.1 7.5-.4 4.5-3.7 7.3-9.8 8.5-30 5.8-57.5 16.1-82.6 30.8-7.1 4.2-10.8 11-11.1 20.5-.3 9.4 2.9 16.5 9.5 21.2 14.3 10.1 29.3 18.8 44.9 26.2 3.2 1.5 4.6 4.1 4.2 7.6-.3 2.4-2.5 3.9-6.4 4.5-11.5 1.9-30.5 5.7-49.8 10.7-5.6 1.6-9.5 4.5-11.8 8.8-2.3 4.3-1.6 9.4 2.1 15.2 24.3 38 60 62.6 107.1 73.9 4.3 1 7.4 3.4 9.1 7.4 2.8 6.4 8 9.6 15.6 9.6h63c7.6 0 12.8-3.2 15.6-9.6 1.7-4 4.8-6.4 9.1-7.4 47.1-11.3 82.8-35.9 107.1-73.9 3.7-5.8 4.4-10.9 2.1-15.2z"/>
  </svg>
);

const CredentialHeader = ({ email, displayName, rankTitle, rankScore, avatarUrl, socialLinks = {} }) => {
  const nameToDisplay = displayName || (email ? email.split('@')[0] : 'Community Member');
  const initial = (nameToDisplay || 'C')[0].toUpperCase();
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
        {avatarUrl ? (
          isVideoUrl(avatarUrl) ? (
            <video src={normalizeMediaVideoUrl(avatarUrl)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay loop muted playsInline />
          ) : (
            <img
              src={avatarUrl}
              alt={nameToDisplay}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameToDisplay)}&background=333&color=fff`;
              }}
            />
          )
        ) : (
          initial
        )}
      </div>
      <span style={{ fontWeight: '600', fontSize: '14px', color: '#333', letterSpacing: '-0.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
        {nameToDisplay}
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
        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          padding: '4px 10px',
          borderRadius: '4px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          backgroundColor: '#f5f5f5',
          color: '#d4af37',
          border: '1px solid #e0e0e0',
          whiteSpace: 'nowrap',
          lineHeight: '1.3'
        }}>
          ★ {(rankScore || 1).toLocaleString()} pts
        </span>
      )}
      {socialLinks && (
        <>
          {socialLinks.instagram ? (
            <a
              href={safeSocialUrl(socialLinks.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', fontSize: '15px' }}
              title="Instagram"
            >{"\u{1F4F7}"}</a>
          ) : null}
          {socialLinks.tiktok ? (
            <a
              href={safeSocialUrl(socialLinks.tiktok)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', fontSize: '15px' }}
              title="TikTok"
            >{"\u{1F3B5}"}</a>
          ) : null}
          {socialLinks.snapchat ? (
            <a
              href={safeSocialUrl(socialLinks.snapchat)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', fontSize: '11px', color: '#000000', backgroundColor: '#FFFC00', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}
              title="Snapchat"
            ><SnapchatIcon /> Snapchat</a>
          ) : null}
        </>
      )}
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

// --- UI HELPERS ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const productsData = {
  shampoos: [
    { 
      name: "The Majorities Shampoo", 
      desc: (
        <>
          <p>Reset and revive stressed hair with a salon-grade, deep-cleansing wash designed for all hair types. This high-foaming, rinse-off shampoo creates a rich, decadent lather that effortlessly lifts away stubborn scalp buildup, excess oils, and environmental pollutants without stripping away natural moisture.</p>
          <p>Powered by Provitamin B5 (Panthenol) and advanced anti-frizz shields, it tames static, boosts elasticity, and wraps your hair in a luminous, mirror-like shine.</p>
          <p><strong>Hair Type:</strong> Perfect for daily use on natural or non-color treated hair.</p>
          <p><strong>Scent Experience:</strong> Infused with a premium, long-lasting signature fragrance.</p>
          <p><strong>Ingredients:</strong> Water, Sodium C14-16 Olefin Sulfonate, Cocamidopropyl Betaine, Ceteareth-60 Myristyl Glycol, Polysorbate 80, Lauramide DIPA, Polyquaternium-10, Polyquaternium-7, Panthenol, Fragrance, Caprylyl Glycol, Phenoxyethanol, Citric Acid, Tetrasodium Glutamate Diacetate, Blue 1</p>
        </>
      )
    }
  ],
  conditioners: [
    { 
      name: "The Majorities Conditioner", 
      desc: (
        <>
          <p>Rescue and restore chronically dry, brittle, or damaged hair with an intensive moisture therapy treatment. This ultra-rich, rinse-off conditioner melts into parched strands, delivering a powerful infusion of tropical Coconut Oil, liquid gold Argan Oil, and nourishing Olive Oil. It actively mends frayed cuticles, eliminates stubborn knots, and neutralizes static cling.</p>
          <p>Perfect for restoring natural bounce, strength, and resilience, it leaves hair effortlessly detangled, silky-smooth, and deeply repaired from root to tip.</p>
          <p><strong>Hair Benefits:</strong> Ultimate detangling, breakage defense, and extreme cuticle smoothing.</p>
          <p><strong>Ingredient Highlights:</strong> Pure Argan Oil, Coconut Oil, Olive Oil, and Provitamin B5.</p>
          <p><strong>Ingredients:</strong> Water, Stearyl Alcohol, Cetyl Alcohol, Glycine Soja (Soybean) Oil, Brassicamidopropyl Dimethylamine, Polysorbate 80, Cocos Nucifera (Coconut) Oil, Argania Spinosa (Argan) Kernel Oil, Olea Europaea (Olive) Fruit Oil, Panthenol, Fragrance, Benzyl Alcohol, Benzoic Acid, Sorbic Acid, Citric Acid, Tetrasodium Glutamate Diacetate, Sodium Hydroxide, Blue 1</p>
        </>
      )
    }
  ],
  oils: [
    { 
      name: "The Majorities Hair Oil", 
      desc: (
        <>
          <p>Transform dull, parched strands into sleek, high-gloss perfection with this ultra-lightweight botanical elixir. Just a few drops of this luxurious leave-on oil blend work to instantly seal split ends, smooth stubborn flyaways, and coat the hair cuticle in a brilliant, reflective shield.</p>
          <p>Packed with deeply conditioning Soybean, Castor, Safflower, and Sunflower seed oils, it provides heavy-duty nourishment with a weightless finish, while natural Peppermint Oil delivers an invigorating, tingling scalp refresh.</p>
          <p><strong>Performance:</strong> Seals, conditions, and protects without leaving a heavy, greasy buildup. Deeply conditions as an emollient while acting as an occlusive shield to lock in vital moisture.</p>
          <p><strong>Sensory Profile:</strong> Refreshing, cooling, and awakening peppermint aroma backed by natural antioxidants.</p>
          <p><strong>Ingredients:</strong> Glycine Soja (Soybean) Oil, Ricinus Communis (Castor) Seed Oil, Carthamus Tinctorius (Safflower) Seed Oil, Helianthus Annuus (Sunflower) Seed Oil, Mentha Piperita (Peppermint) Oil, Tocopheryl Acetate</p>
        </>
      )
    }
  ],
  faceScrubs: [
    { 
      name: "The Majorities Facial Scrub", 
      desc: (
        <>
          <p>Unveil your smoothest, most radiant complexion yet with this dual-action facial polish. This creamy, rinse-off scrub combines micro-fine Bambusa Arundinacea (Bamboo) Stem Powder to gently buff away dulling, dead skin cells, while deep-cleansing Salicylic Acid (BHA) dissolves pore-clogging impurities and targets oil buildup.</p>
          <p>Cushioned with melting Jojoba Esters and soothing hydrators, it intensely purifies and refines skin texture without scratching or drying, leaving your face feeling completely renewed, clear, and soft.</p>
          <p><strong>Target Concerns:</strong> Congestion, dullness, blemishes, and uneven skin texture.</p>
          <p><strong>Formula Type:</strong> A conditioning, non-stripping physical and chemical exfoliant.</p>
          <p><strong>Ingredients:</strong> Water, Glycerin, Stearic Acid, Cetyl Alcohol, Glyceryl Stearate, PEG-100 Stearate, Cetearyl Alcohol, Ceteareth-20, Bambusa Arundinacea Stem Powder, Polysorbate 80, Jojoba Esters, Tocopheryl Acetate, Acrylates/C10-30 Alkyl Acrylate Crosspolymer, Salicylic Acid, Fragrance, Caprylyl Glycol, Phenoxyethanol, Citric Acid, Tetrasodium Glutamate Diacetate, Blue 1</p>
        </>
      )
    }
  ],
  toners: [
    { 
      name: "The Majorities Face Toner", 
      desc: (
        <>
          <p>Elevate your daily skincare routine with a clean, revitalizing splash of weightless hydration. This advanced leave-on toner balances oil production, tightens the appearance of pores, and instantly calms the skin.</p>
          <p>Infused with clarifying Hamamelis Virginiana (Witch Hazel) and deep-binding moisture catchers, it sweeps away residual impurities while leaving your complexion perfectly prepped, velvety smooth, and radiantly balanced.</p>
          <p><strong>Skin Feel:</strong> Cool, refreshing, and instantly matte yet hydrated.</p>
          <p><strong>Visual Appeal:</strong> Beautifully tinted, crystal-clear blue formula that pops on the shelf.</p>
          <p><strong>Ingredients:</strong> Water, Hamamelis Virginiana (Witch Hazel) Water, SD Alcohol 40, Sodium PCA, Phenoxyethanol, Potassium Sorbate, Citric Acid, Blue 1</p>
        </>
      )
    }
  ],
  faceCreams: [
    { 
      name: "The Majorities Moisturizing Lotion", 
      desc: (
        <>
          <p>Wrap your skin in a comforting blanket of intense, barrier-repairing moisture. This ultra-nourishing daily body and hand lotion is formulated with a powerhouse blend of Ceramides, Hyaluronic Acid, and Vitamin E to instantly quench dehydrated skin.</p>
          <p>The fast-absorbing, non-greasy formula sinks in deep to lock out environmental dryness and rebuild your skin's natural moisture barrier, leaving hands and body touchably plush, supple, and healthy-looking all day long.</p>
          <p><strong>Application:</strong> A smooth, whipped leave-on lotion crafted for hands and body.</p>
          <p><strong>Key Ingredients to Feature:</strong> Ceramides, Sodium Hyaluronate, Glycerin, and Vitamin E.</p>
          <p><strong>Ingredients:</strong> Water, Caprylic/Capric Triglyceride, Glycerin, Cetearyl Alcohol, Propanediol, Palmitic Acid, Stearic Acid, Dimethicone, Sodium Hyaluronate, Distilled Monoglycerides, Ceteareth-20, Cetyl Esters, Cetyl Alcohol, Isocetyl Alcohol, Ceramide Np, Tocopherol, Carbomer, Fragrance, Caprylyl Glycol, Phenoxyethanol, Sodium Hydroxide, Tetrasodium Glutamate Diacetate</p>
        </>
      )
    }
  ]
};

const SOCIAL_FIELDS = [
  { key: 'instagram', label: '📷 Instagram', placeholder: 'instagram.com/yourprofile' },
  { key: 'tiktok', label: '🎵 TikTok', placeholder: 'tiktok.com/@yourprofile' },
  { key: 'snapchat', label: <span style={{ display: 'inline-flex', alignItems: 'center' }}><SnapchatIcon /> Snapchat</span>, placeholder: 'snapchat.com/add/yourprofile' },
];

const SocialInputRow = ({ socialKey, label, placeholder, initialValue, onSave, onChangeGlobal, saveStatus }) => {
  const [localVal, setLocalVal] = React.useState(initialValue || "");

  React.useEffect(() => {
    setLocalVal(initialValue || "");
  }, [initialValue]);

  const isSocialSaveDisabled = saveStatus === "saving" || !localVal.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: '600', color: '#222', display: 'block' }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder={placeholder}
          value={localVal}
          onChange={(e) => setLocalVal(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            boxSizing: 'border-box'
          }} />
        <button
          type="button"
          onClick={() => {
            const sanitizedVal = localVal.trim();
            if (onChangeGlobal) onChangeGlobal(socialKey, sanitizedVal);
            onSave(socialKey, sanitizedVal);
          }}
          disabled={isSocialSaveDisabled}
          style={{
            padding: '10px 16px',
            backgroundColor: saveStatus === "saved" ? '#27ae60' : saveStatus === "error" ? '#e74c3c' : '#222',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: isSocialSaveDisabled ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '12px',
            minWidth: '85px',
            transition: 'all 0.2s ease'
          }}>
          {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "✓ Linked" : "Save"}
        </button>
      </div>
    </div>
  );
};

// --- PROFILE PAGE COMPONENT ---
const ProfilePage = ({ userEmail, savedSets, rankTitle, rankScore, authToken, onAddPoints, onAvatarUpdate, userAvatar, tokens, addDumaItem }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [avatarUrl, setAvatarUrl] = useState(userAvatar || null);
  const [avatarSlots, setAvatarSlots] = useState(Array(6).fill(null)); 
  const [hadExistingAvatar, setHadExistingAvatar] = useState(false);
  
  const [backendRankScore, setBackendRankScore] = useState(rankScore || 1);
  const [backendRankTitle, setBackendRankTitle] = useState(rankTitle || "Comrade");
  const [avatarSaveStatus, setAvatarSaveStatus] = useState("idle");

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
    }).catch(() => {});
  }, [authToken, onAvatarUpdate]);

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

  const [postDescription, setCultureResponse] = useState("");
  const [postLocation, setPostLocation] = useState("");
  const [dumaSlots, setDumaSlots] = useState(Array(6).fill(null)); 
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(null);
  const [postSubmitStatus, setCultureSubmitStatus] = useState("idle");
  const [postErrorMsg, setCultureErrorMsg] = useState("");

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

  const syncAvatarSlotsToBackend = (slotsArray) => {
    const urls = slotsArray.map((slot) => (slot ? slot.url : null));
    try { localStorage.setItem(`avatarSlots_${userEmail}`, JSON.stringify(urls)); } catch {}
    if (!authToken) return;
    fetch(`${BACKEND_URL}/api/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ avatarSlots: urls })
    }).catch(() => {});
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
        alert('Please upload image or video files only (JPG, PNG, HEIC, WEBP, MP4, MOV).');
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
    const updatedSlots = [...dumaSlots];
    updatedSlots[index] = {
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      file
    };
    setDumaSlots(updatedSlots);
  };

  const removeDumaSlot = (index) => {
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

      const pointsEarned = activePrompt ? 120 : 100;
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
              isVideoUrl(avatarUrl) ? (
                <video src={normalizeMediaVideoUrl(avatarUrl)} style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #222' }} autoPlay loop muted playsInline />
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
                      <video src={normalizeMediaVideoUrl(slot.url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay loop muted playsInline />
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
          Share your thoughts or photos/videos directly to the Duma (+100 points). Optionally select a prompt below to earn bonus points (+120 points)!
        </p>

        {postErrorMsg && <div style={{ color: 'red', fontSize: '13px', marginBottom: '10px' }}>{postErrorMsg}</div>}

        <form onSubmit={handleCultureSubmit} style={{ ...styles.dumaCard, border: '1px solid #e0e0e0', padding: '24px', borderRadius: '16px' }}>

          <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>Attach Photos or Videos (Up to 6)</label>
          <p style={{ fontSize: '11px', color: '#888', marginBottom: '10px' }}>Batch-upload multiple files at once, or use an individual terminal slot below.</p>

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
            ANSWER PROMPTS FOR POINTS (COMPLETE ALL FOR SPECIAL REWARD)
          </label>
          <p style={{ fontSize: '11px', color: '#888', margin: '0 0 10px 0' }}>
            Click any prompt below to attach it to your post and earn 120 points! (Scroll to view all 15 prompts)
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
            <Link to="/"><button style={{ ...styles.authButton, width: '200px' }}>Start Building</button></Link>
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

// --- DUMA PAGE ---
const DumaPage = ({ items, authToken, userEmail, rankTitle, rankScore, onAddPoints, userAvatar, following, onFollowUser, onUnfollowUser }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [dumaItems, setDumaItems] = useState(items);
  const [userVotes, setUserVotes] = useState({});
  const [showScores, setShowScores] = useState({});
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [activeSection, setActiveSection] = useState("Culture");
  const [expandedImage, setExpandedImage] = useState(null); 

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

  const handleVote = async (itemId, voteType) => {
    if (!authToken) return alert("Please log in to vote.");
    if (userVotes[itemId]) return;

    setUserVotes(prev => ({ ...prev, [itemId]: voteType }));
    setShowScores(prev => ({ ...prev, [itemId]: true }));
    setShowComments(prev => ({ ...prev, [itemId]: true }));
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
    } catch (err) {}
  };

  const handleDeletePost = async (itemId) => {
    if (!authToken) return alert("Please log in to delete posts.");
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/duma/${itemId}`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        setDumaItems(prev => prev.filter(item => (item._id || item.id) !== itemId));
      } else {
        alert("Failed to delete post.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete post.");
    }
  };

  const handleCommentSubmit = (itemId) => {
    if (!commentText[itemId]?.trim()) return;
    setComments(prev => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), { author: userEmail, text: commentText[itemId], timestamp: new Date().toLocaleString() }]
    }));
    setCommentText(prev => ({ ...prev, [itemId]: '' }));
  };

  const culturalItems = dumaItems.filter(item => item.section === "Cultural" || item.category === "Culture" || item.type === "Video" || item.type === "Culture");
  const recommendationItems = dumaItems.filter(item => item.type === "Product Recommendation" || item.type === "Recommendation");
  const partnerItems = dumaItems.filter(item => item.type === "Partner");

  return (
      <div style={{ padding: isMobile ? '25px 16px' : '40px 60px', maxWidth: '1100px', margin: '0 auto', flex: '1 1 auto', minWidth: 0 }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '30px', gap: isMobile ? '15px' : '0' }}>
        <div>
          <h2 style={{ marginBottom: '6px' }}>The Majorities' Duma</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Community recommendations, partnerships, and cultural contributions - vote to shape The Majorities.</p>
        </div>
        {userEmail && rankTitle && <div style={{ width: isMobile ? '100%' : 'auto' }}><CredentialHeader email={userEmail} rankTitle={getRankTitle(rankScore)} rankScore={rankScore} avatarUrl={userAvatar} /></div>}
      </div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '15px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', whiteSpace: 'nowrap', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        <button onClick={() => setActiveSection("Culture")} style={{ padding: '10px 20px', backgroundColor: activeSection === "Culture" ? '#222' : '#f5f5f5', color: activeSection === "Culture" ? '#fff' : '#222', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', flexShrink: 0 }}>Culture ({culturalItems.length})</button>
        <button onClick={() => setActiveSection("Recommendations")} style={{ padding: '10px 20px', backgroundColor: activeSection === "Recommendations" ? '#222' : '#f5f5f5', color: activeSection === "Recommendations" ? '#fff' : '#222', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', flexShrink: 0 }}>Recommendations ({recommendationItems.length})</button>
        <button onClick={() => setActiveSection("Partners")} style={{ padding: '10px 20px', backgroundColor: activeSection === "Partners" ? '#222' : '#f5f5f5', color: activeSection === "Partners" ? '#fff' : '#222', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', flexShrink: 0 }}>Partners ({partnerItems.length})</button>
        <button onClick={() => window.location.href = authToken ? '/culture' : '/login'} style={{ padding: '8px 14px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', marginLeft: isMobile ? '0' : 'auto', flexShrink: 0 }}>{authToken ? '+ Share Your Perspective' : 'Log in to Share'}</button>
      </div>

      {activeSection === "Culture" && (
        <div>
          {culturalItems.length === 0 ? (
            <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888' }}>No perspectives shared yet. Share yours and contribute to our culture section!</div>
          ) : (
            culturalItems.map(item => {
              const itemId = item._id || item.id;
              const verifiedRank = item.rankScore ? getRankTitle(item.rankScore) : (item.submitterRank || "Comrade");

              return (
                <div key={itemId} style={styles.dumaCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span style={styles.typeTag}>Perspective</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RankBadge rankTitle={verifiedRank} />
                      {authToken && userEmail && item.submittedBy && item.submittedBy.toLowerCase() === userEmail.toLowerCase() && (
                        <button onClick={() => handleDeletePost(itemId)} style={{ border: '1px solid #e74c3c', color: '#e74c3c', background: '#fff', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                          Trash
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {item.submittedBy && (
                        <Link to={`/perspectives?person=${encodeURIComponent(item.submittedBy)}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                          <CredentialHeader email={item.submittedBy} displayName={item.submitterDisplayName || null} rankTitle={verifiedRank} rankScore={item.rankScore || null} avatarUrl={item.submitterAvatar || null} socialLinks={item.submitterSocialLinks || null} />
                        </Link>
                      )}
                    </div>
                    {authToken && item.submittedBy && userEmail && item.submittedBy.toLowerCase() !== userEmail.toLowerCase() && (
                      <button 
                        onClick={() => following?.includes(item.submittedBy) ? onUnfollowUser?.(item.submittedBy) : onFollowUser?.(item.submittedBy)} 
                        style={{ marginLeft: '10px', padding: '6px 14px', fontSize: '11px', fontWeight: 'bold', borderRadius: '20px', border: following?.includes(item.submittedBy) ? '1px solid #ccc' : 'none', backgroundColor: following?.includes(item.submittedBy) ? 'transparent' : '#222', color: following?.includes(item.submittedBy) ? '#666' : '#fff', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}
                      >
                        {following?.includes(item.submittedBy) ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>

                  {item.location && (
                    <div style={{ fontSize: '11px', color: '#555', backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', marginBottom: '10px', alignItems: 'center', gap: '4px' }}>
                      📍 {item.location}
                    </div>
                  )}

                  <h4 style={{ marginTop: '12px', marginBottom: '8px', color: '#555' }}>Prompt: "{item.prompt || 'What makes a person beautiful?'}"</h4>
                  <p style={{ color: '#222', fontSize: '14px', lineHeight: '1.6', marginBottom: '14px' }}>{item.response || item.reason || item.desc}</p>

                  {(() => {
                    const mediaList = Array.isArray(item.mediaUrls) && item.mediaUrls.length > 0 ? item.mediaUrls : item.mediaUrl ? [item.mediaUrl] : item.videoUrl ? [item.videoUrl] : [];
                    if (mediaList.length === 0) return null;
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: mediaList.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px', margin: '15px 0', background: '#fafafa', padding: '10px', borderRadius: '12px', border: '1px solid #eee' }}>
                        {mediaList.map((url, idx) => {
                          const isVideo = isVideoUrl(url);
                          return (
                            <div key={idx} style={{ textAlign: 'center' }}>
                              {isVideo ? (
                                <video
                                  src={normalizeMediaVideoUrl(url)}
                                  poster={url.includes('cloudinary.com') ? url.replace(/\.(mp4|mov|webm|m4v)$/i, '.jpg') : undefined}
                                  style={{ width: '100%', maxHeight: '400px', borderRadius: '8px', backgroundColor: '#000', objectFit: 'contain' }}
                                  controls playsInline preload="metadata"
                                />
                              ) : (
                                <img 
                                  src={url} 
                                  alt={`Attachment ${idx + 1}`} 
                                  onClick={() => setExpandedImage(url)}
                                  style={{ width: '100%', maxHeight: mediaList.length === 1 ? '400px' : '200px', borderRadius: '8px', objectFit: 'cover', cursor: 'zoom-in' }} 
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {authToken && (
                    <div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                        <button disabled={!!userVotes[itemId]} onClick={() => handleVote(itemId, 'yes')} style={{ ...styles.voteBtn, borderColor: '#27ae60', color: '#27ae60', opacity: userVotes[itemId] === 'yes' ? 1 : 0.7 }}>Yes</button>
                        <button disabled={!!userVotes[itemId]} onClick={() => handleVote(itemId, 'no')} style={{ ...styles.voteBtn, borderColor: '#e74c3c', color: '#e74c3c', opacity: userVotes[itemId] === 'no' ? 1 : 0.7 }}>No</button>
                        <button disabled={!!userVotes[itemId]} onClick={() => handleVote(itemId, 'abstain')} style={{ ...styles.voteBtn, borderColor: '#95a5a6', color: '#95a5a6', opacity: userVotes[itemId] === 'abstain' ? 1 : 0.7 }}>Abstain</button>
                      </div>

                      {showScores[itemId] && (
                        <div style={{ backgroundColor: '#f0f8ff', padding: '12px', borderRadius: '8px', marginBottom: '14px', borderLeft: '4px solid #3498db' }}>
                          <p style={{ fontSize: '12px', fontWeight: '600', color: '#2980b9', margin: '0' }}>Vote Results:</p>
                          <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
                            Yes: {item.votes?.yes || 0} | No: {item.votes?.no || 0} | Abstain: {item.votes?.abstain || 0}
                          </p>
                        </div>
                      )}

                      {showComments[itemId] && (
                        <div style={{ borderTop: '2px solid #eee', paddingTop: '12px' }}>
                          <h4 style={{ fontSize: '13px', color: '#555', marginBottom: '12px', fontWeight: '700' }}>Comments:</h4>
                          {comments[itemId]?.length > 0 && (
                            <div style={{ marginBottom: '12px' }}>
                              {comments[itemId].map((comment, idx) => (
                                <div key={idx} style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px', marginBottom: '8px', borderLeft: '3px solid #3498db' }}>
                                  <p style={{ fontSize: '11px', fontWeight: '600', color: '#222', margin: '0 0 4px 0' }}>{comment.author}</p>
                                  <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>{comment.text}</p>
                                  <p style={{ fontSize: '10px', color: '#aaa', margin: 0 }}>{comment.timestamp}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="text" placeholder="Add a comment..." style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px' }} value={commentText[itemId] || ''} onChange={(e) => setCommentText(prev => ({ ...prev, [itemId]: e.target.value }))} />
                            <button onClick={() => handleCommentSubmit(itemId)} style={{ padding: '8px 16px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Post</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeSection === "Recommendations" && !authToken && (
        <div style={{ padding: '20px 0' }}>
          <GuestSubmissionPrompt message="This section contains proprietary commerce ledger records, partner structures, and product recommendations. Please log in or register to view this data." />
        </div>
      )}

      {activeSection === "Recommendations" && authToken && (
        <div>
          {recommendationItems.length === 0 ? (
            <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888' }}>No product recommendations yet. Be the first to recommend a product!</div>
          ) : (
            recommendationItems.map(item => (
              <div key={item.id || item._id} style={styles.dumaCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={styles.typeTag}>{item.type}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.submitterRank && <RankBadge rankTitle={item.submitterRank} />}
                    {authToken && userEmail && item.submittedBy && item.submittedBy.toLowerCase() === userEmail.toLowerCase() && (
                      <button onClick={() => handleDeletePost(item._id || item.id)} style={{ border: '1px solid #e74c3c', color: '#e74c3c', background: '#fff', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        Trash
                      </button>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {item.submittedBy && (
                      <Link to={`/perspectives?person=${encodeURIComponent(item.submittedBy)}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <CredentialHeader email={item.submittedBy} displayName={item.submitterDisplayName || null} rankTitle={item.submitterRank || 'Comrade'} rankScore={null} avatarUrl={item.submitterAvatar || null} socialLinks={item.submitterSocialLinks || null} />
                      </Link>
                    )}
                  </div>
                  {authToken && item.submittedBy && userEmail && item.submittedBy.toLowerCase() !== userEmail.toLowerCase() && (
                    <button 
                      onClick={() => following?.includes(item.submittedBy) ? onUnfollowUser?.(item.submittedBy) : onFollowUser?.(item.submittedBy)} 
                      style={{ marginLeft: '10px', padding: '6px 14px', fontSize: '11px', fontWeight: 'bold', borderRadius: '20px', border: following?.includes(item.submittedBy) ? '1px solid #ccc' : 'none', backgroundColor: following?.includes(item.submittedBy) ? 'transparent' : '#222', color: following?.includes(item.submittedBy) ? '#666' : '#fff', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}
                    >
                      {following?.includes(item.submittedBy) ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>

                {item.location && (
                  <div style={{ fontSize: '11px', color: '#555', backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', marginBottom: '10px', alignItems: 'center', gap: '4px' }}>
                    📍 {item.location}
                  </div>
                )}
                <h3 style={{ marginTop: '8px', marginBottom: '6px' }}>{item.name || item.product} by {item.company}</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '14px' }}>{item.reason || item.desc}</p>
                
                {(() => {
                  const mediaList = Array.isArray(item.mediaUrls) && item.mediaUrls.length > 0 ? item.mediaUrls : item.mediaUrl ? [item.mediaUrl] : item.videoUrl ? [item.videoUrl] : [];
                  if (mediaList.length === 0) return null;
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: mediaList.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px', margin: '15px 0', background: '#fafafa', padding: '10px', borderRadius: '12px', border: '1px solid #eee' }}>
                      {mediaList.map((url, idx) => {
                        const isVideo = isVideoUrl(url);
                        return (
                          <div key={idx} style={{ textAlign: 'center' }}>
                            {isVideo ? (
                              <video
                                src={normalizeMediaVideoUrl(url)}
                                poster={url.includes('cloudinary.com') ? url.replace(/\.(mp4|mov|webm|m4v)$/i, '.jpg') : undefined}
                                style={{ width: '100%', maxHeight: '400px', borderRadius: '8px', backgroundColor: '#000', objectFit: 'contain' }}
                                controls playsInline preload="metadata"
                              />
                            ) : (
                              <img 
                                src={url} 
                                alt={`Attachment ${idx + 1}`} 
                                onClick={() => setExpandedImage(url)}
                                style={{ width: '100%', maxHeight: mediaList.length === 1 ? '400px' : '200px', borderRadius: '8px', objectFit: 'cover', cursor: 'zoom-in' }} 
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {authToken && (
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                      <button disabled={!!userVotes[item.id || item._id]} onClick={() => handleVote(item._id || item.id, 'yes')} style={{ ...styles.voteBtn, borderColor: '#27ae60', color: '#27ae60', opacity: userVotes[item.id || item._id] === 'yes' ? 1 : 0.7 }}>Yes</button>
                      <button disabled={!!userVotes[item.id || item._id]} onClick={() => handleVote(item._id || item.id, 'no')} style={{ ...styles.voteBtn, borderColor: '#e74c3c', color: '#e74c3c', opacity: userVotes[item.id || item._id] === 'no' ? 1 : 0.7 }}>No</button>
                      <button disabled={!!userVotes[item.id || item._id]} onClick={() => handleVote(item._id || item.id, 'abstain')} style={{ ...styles.voteBtn, borderColor: '#95a5a6', color: '#95a5a6', opacity: userVotes[item.id || item._id] === 'abstain' ? 1 : 0.7 }}>Abstain</button>
                    </div>
                    
                    {showScores[item.id || item._id] && (
                      <div style={{ backgroundColor: '#f0f8ff', padding: '12px', borderRadius: '8px', marginBottom: '14px', borderLeft: '4px solid #3498db' }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#2980b9', margin: '0' }}>Vote Results:</p>
                        <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
                          Yes: {item.votes?.yes || 0} | No: {item.votes?.no || 0} | Abstain: {item.votes?.abstain || 0}
                        </p>
                      </div>
                    )}
                    
                    {showComments[item.id || item._id] && (
                      <div style={{ borderTop: '2px solid #eee', paddingTop: '12px' }}>
                        <h4 style={{ fontSize: '13px', color: '#555', marginBottom: '12px', fontWeight: '700' }}>Comments:</h4>
                        
                        {comments[item.id || item._id]?.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            {comments[item.id || item._id].map((comment, idx) => (
                              <div key={idx} style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px', marginBottom: '8px', borderLeft: '3px solid #3498db' }}>
                                <p style={{ fontSize: '11px', fontWeight: '600', color: '#222', margin: '0 0 4px 0' }}>{comment.author}</p>
                                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>{comment.text}</p>
                                <p style={{ fontSize: '10px', color: '#aaa', margin: 0 }}>{comment.timestamp}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" placeholder="Add a comment..." style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px' }} value={commentText[item.id || item._id] || ''} onChange={(e) => setCommentText(prev => ({ ...prev, [item.id || item._id]: e.target.value }))} />
                          <button onClick={() => handleCommentSubmit(item.id || item._id)} style={{ padding: '8px 16px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Post</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeSection === "Partners" && !authToken && (
        <div style={{ padding: '20px 0' }}>
          <GuestSubmissionPrompt message="This section contains proprietary commerce ledger records, partner structures, and product recommendations. Please log in or register to view this data." />
        </div>
      )}

      {activeSection === "Partners" && authToken && (
        <div>
          {partnerItems.length === 0 ? (
            <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888' }}>No partner applications yet. Be the first to submit a partnership!</div>
          ) : (
            partnerItems.map(item => (
              <div key={item.id || item._id} style={styles.dumaCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={styles.typeTag}>{item.type}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.submitterRank && <RankBadge rankTitle={item.submitterRank} />}
                    {authToken && userEmail && item.submittedBy && item.submittedBy.toLowerCase() === userEmail.toLowerCase() && (
                      <button onClick={() => handleDeletePost(item._id || item.id)} style={{ border: '1px solid #e74c3c', color: '#e74c3c', background: '#fff', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        Trash
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {item.submittedBy && (
                      <Link to={`/perspectives?person=${encodeURIComponent(item.submittedBy)}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <CredentialHeader email={item.submittedBy} displayName={item.submitterDisplayName || null} rankTitle={item.submitterRank || 'Comrade'} rankScore={null} avatarUrl={item.submitterAvatar || null} socialLinks={item.submitterSocialLinks || null} />
                      </Link>
                    )}
                  </div>
                  {authToken && item.submittedBy && userEmail && item.submittedBy.toLowerCase() !== userEmail.toLowerCase() && (
                    <button 
                      onClick={() => following?.includes(item.submittedBy) ? onUnfollowUser?.(item.submittedBy) : onFollowUser?.(item.submittedBy)} 
                      style={{ marginLeft: '10px', padding: '6px 14px', fontSize: '11px', fontWeight: 'bold', borderRadius: '20px', border: following?.includes(item.submittedBy) ? '1px solid #ccc' : 'none', backgroundColor: following?.includes(item.submittedBy) ? 'transparent' : '#222', color: following?.includes(item.submittedBy) ? '#666' : '#fff', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}
                    >
                      {following?.includes(item.submittedBy) ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>

                {item.location && (
                  <div style={{ fontSize: '11px', color: '#555', backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', marginBottom: '10px', alignItems: 'center', gap: '4px' }}>
                    📍 {item.location}
                  </div>
                )}

                <h3 style={{ marginTop: '12px', marginBottom: '12px' }}>{item.productType} - {item.company}</h3>

                <h4 style={{ marginBottom: '6px', fontSize: '13px', color: '#555', fontWeight: '700' }}>Product Details:</h4>
                <p style={{ color: '#666', fontSize: '13px', marginBottom: '6px', lineHeight: '1.5' }}>
                  <strong>Type:</strong> {item.productType}
                </p>
                <p style={{ color: '#222', fontSize: '13px', marginBottom: '12px', lineHeight: '1.5' }}>
                  <strong>Description:</strong> {item.productDescription}
                </p>
                <p style={{ color: '#222', fontSize: '13px', marginBottom: '12px', lineHeight: '1.5' }}>
                  <strong>Partnership Rationale:</strong> {item.whyPartner}
                </p>

                {(item.hasPhoto || item.hasVideo) && (
                  <div style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px', borderLeft: '4px solid #9b59b6' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', color: '#555' }}>Media:</h4>
                    {item.hasPhoto && <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>Product photo included</p>}
                    {item.hasVideo && <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>Product video included</p>}
                  </div>
                )}

                <div style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px', borderLeft: '4px solid #27ae60' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', color: '#555' }}>Business Logistics:</h4>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                    <strong>EIN:</strong> {item.ein || 'N/A'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                    <strong>MOQ:</strong> 500 units (3.4 oz)
                  </p>
                  {item.desiredOrderQuantity && (
                    <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                      <strong>Desired Fulfillment:</strong> {item.desiredOrderQuantity} units
                    </p>
                  )}
                  {item.pricing5Gallon && (
                    <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                      <strong>5-Gallon Pricing:</strong> {item.pricing5Gallon}
                    </p>
                  )}
                </div>

                <div style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '14px', borderLeft: '4px solid #e67e22' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', color: '#555' }}>Pricing Models:</h4>
                  {item.standardUnitPrice && (
                    <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                      <strong>One Time Price:</strong> ${item.standardUnitPrice}
                    </p>
                  )}
                  {item.promotionalUnitPrice && (
                    <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                      <strong>Subscription Price:</strong> ${item.promotionalUnitPrice}
                    </p>
                  )}
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                    <strong>Commission:</strong> The Majorities take 25% | Partner receives 75%
                  </p>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                    <strong>Tier:</strong> {item.tier}
                  </p>
                </div>

                <div style={{ backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px', marginBottom: '14px', borderLeft: '4px solid #34495e' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', color: '#555' }}>Policy Checkboxes:</h4>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                    <strong>Customer Reward Program:</strong> {item.customerRewardAgreed ? 'Agreed' : 'Not specified'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                    <strong>25% Commission Agreement:</strong> {item.commission25AgreedTo ? 'Agreed' : 'Not specified'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                    <strong>Shipping & Returns Policy:</strong> {item.shippingReturnsAgreed ? 'Agreed' : 'Not specified'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                    <strong>Ownership & Title Policy:</strong> {item.ownershipTitleAgreed ? 'Agreed' : 'Not specified'}
                  </p>
                </div>

                {/* VOTING SECTION */}
                {authToken && (
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                      <button disabled={!!userVotes[item.id || item._id]} onClick={() => handleVote(item._id || item.id, 'yes')} style={{ ...styles.voteBtn, borderColor: '#27ae60', color: '#27ae60', opacity: userVotes[item.id || item._id] === 'yes' ? 1 : 0.7 }}>Yes</button>
                      <button disabled={!!userVotes[item.id || item._id]} onClick={() => handleVote(item._id || item.id, 'no')} style={{ ...styles.voteBtn, borderColor: '#e74c3c', color: '#e74c3c', opacity: userVotes[item.id || item._id] === 'no' ? 1 : 0.7 }}>No</button>
                      <button disabled={!!userVotes[item.id || item._id]} onClick={() => handleVote(item._id || item.id, 'abstain')} style={{ ...styles.voteBtn, borderColor: '#95a5a6', color: '#95a5a6', opacity: userVotes[item.id || item._id] === 'abstain' ? 1 : 0.7 }}>Abstain</button>
                    </div>

                    {/* VOTE SCORES - VISIBLE ONLY AFTER VOTING */}
                    {showScores[item.id || item._id] && (
                      <div style={{ backgroundColor: '#f0f8ff', padding: '12px', borderRadius: '8px', marginBottom: '14px', borderLeft: '4px solid #3498db' }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#2980b9', margin: '0' }}>Vote Results:</p>
                        <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
                          Yes: {item.votes?.yes || 0} | No: {item.votes?.no || 0} | Abstain: {item.votes?.abstain || 0}
                        </p>
                      </div>
                    )}

                    {/* COMMENTS SECTION - VISIBLE AFTER VOTING */}
                    {showComments[item.id || item._id] && (
                      <div style={{ borderTop: '2px solid #eee', paddingTop: '12px' }}>
                        <h4 style={{ fontSize: '13px', color: '#555', marginBottom: '12px', fontWeight: '700' }}>Comments:</h4>

                        {/* EXISTING COMMENTS */}
                        {comments[item.id || item._id]?.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            {comments[item.id || item._id].map((comment, idx) => (
                              <div key={idx} style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px', marginBottom: '8px', borderLeft: '3px solid #3498db' }}>
                                <p style={{ fontSize: '11px', fontWeight: '600', color: '#222', margin: '0 0 4px 0' }}>{comment.author}</p>
                                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>{comment.text}</p>
                                <p style={{ fontSize: '10px', color: '#aaa', margin: 0 }}>{comment.timestamp}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* ADD COMMENT */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" placeholder="Add a comment..." style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px' }} value={commentText[item.id || item._id] || ''} onChange={(e) => setCommentText(prev => ({ ...prev, [item.id || item._id]: e.target.value }))} />
                          <button onClick={() => handleCommentSubmit(item.id || item._id)} style={{ padding: '8px 16px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Post</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX */}
      {expandedImage && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
          onClick={() => setExpandedImage(null)}
        >
          <button style={{ position: 'absolute', top: '20px', right: '30px', background: 'transparent', color: '#fff', border: 'none', fontSize: '36px', cursor: 'pointer' }} onClick={() => setExpandedImage(null)}>✕</button>
          <img src={expandedImage} alt="Expanded" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '8px', objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
        </div>
      )}

    </div>
  );
};

// --- PERSPECTIVES PAGE (CULTURE FEED WITH SIDEBAR ADS) ---
const PerspectivesPage = ({ items, authToken, userEmail, rankTitle, rankScore, following, onFollowUser, onUnfollowUser, onAddPoints, userAvatar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [followingList, setFollowingList] = useState([]);
  const [selectedFollowing, setSelectedFollowing] = useState(following || []);
  const [filteredItems, setFilteredItems] = useState([]);
  const [allItems, setAllItems] = useState(items);
  const [followedAt, setFollowedAt] = useState({});
  const [avatarByUser, setAvatarByUser] = useState({});
  const [expandedImage, setExpandedImage] = useState(null); 

  useEffect(() => {
    if (!Array.isArray(following)) return;
    setSelectedFollowing(following);
    setFollowedAt(prev => {
      const next = { ...prev };
      following.forEach((person, idx) => {
        if (!next[person]) next[person] = idx + 1;
      });
      return next;
    });
  }, [following]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/duma`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setAllItems(data);
      })
      .catch(err => console.error("Failed to load perspectives:", err));
  }, []);

  useEffect(() => {
    const uniqueSubmitters = [...new Set(allItems.map(item => item.submittedBy))].filter(Boolean).filter(p => p !== userEmail);
    setFollowingList(uniqueSubmitters);

    const nextAvatarMap = {};
    allItems.forEach(item => {
      if (item?.submittedBy && item?.submitterAvatar) {
        nextAvatarMap[item.submittedBy] = item.submitterAvatar;
      }
    });
    setAvatarByUser(nextAvatarMap);
  }, [allItems, userEmail]);

  const handleFollowingToggle = (person) => {
    if (selectedFollowing.includes(person)) {
      onUnfollowUser?.(person);
      setSelectedFollowing(prev => prev.filter(p => p !== person));
      setFollowedAt(prev => {
        const next = { ...prev };
        delete next[person];
        return next;
      });
    } else {
      onFollowUser?.(person);
      setSelectedFollowing(prev => [...prev, person]);
      setFollowedAt(prev => ({ ...prev, [person]: Date.now() }));
    }
  };

  useEffect(() => {
    const person = new URLSearchParams(location.search).get("person");
    if (!person) return;
    setSelectedFollowing(prev => (prev.includes(person) ? prev : [...prev, person]));
    setFollowedAt(prev => (prev[person] ? prev : { ...prev, [person]: Date.now() }));
  }, [location.search]);

  const personParam = new URLSearchParams(location.search).get("person");
  const isPublicProfile = Boolean(personParam);
  const profileEmail = personParam;

  const profileInfo = useMemo(() => {
    if (!isPublicProfile) return null;
    const userPost = allItems.find(item => item.submittedBy === profileEmail);
    if (userPost) {
       return {
         email: userPost.submittedBy,
         displayName: userPost.submitterDisplayName,
         rankTitle: userPost.submitterRank,
         avatarUrl: userPost.submitterAvatar,
         socialLinks: userPost.submitterSocialLinks
       };
    }
    return { email: profileEmail, rankTitle: 'Comrade' }; 
  }, [isPublicProfile, profileEmail, allItems]);

  useEffect(() => {
    if (isPublicProfile) {
      setFilteredItems(allItems.filter(item => item.submittedBy === profileEmail).sort((a,b) => {
        const aTime = new Date(a.createdAt || a.updatedAt || a.timestamp || 0).getTime() || 0;
        const bTime = new Date(b.createdAt || b.updatedAt || b.timestamp || 0).getTime() || 0;
        return bTime - aTime;
      }));
    } else {
      const orderedFollowing = [...selectedFollowing].sort((a, b) => (followedAt[b] || 0) - (followedAt[a] || 0));
      const followingPriority = orderedFollowing.reduce((acc, person, idx) => {
        acc[person] = idx;
        return acc;
      }, {});

      const filtered = allItems
        .filter(item => selectedFollowing.includes(item.submittedBy) || item.submittedBy === userEmail)
        .sort((a, b) => {
          const aPriority = followingPriority[a.submittedBy] ?? Number.MAX_SAFE_INTEGER;
          const bPriority = followingPriority[b.submittedBy] ?? Number.MAX_SAFE_INTEGER;
          if (aPriority !== bPriority) return aPriority - bPriority;
          
          const aTime = new Date(a.createdAt || a.updatedAt || a.timestamp || 0).getTime() || 0;
          const bTime = new Date(b.createdAt || b.updatedAt || b.timestamp || 0).getTime() || 0;
          return bTime - aTime;
        });
        
      setFilteredItems(filtered);
    }
  }, [isPublicProfile, profileEmail, selectedFollowing, allItems, followedAt, userEmail]);

  const handleDeletePost = async (itemId) => {
    if (!authToken) return alert("Please log in to delete posts.");
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/duma/${itemId}`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        setAllItems(prev => prev.filter(item => (item._id || item.id) !== itemId));
        setFilteredItems(prev => prev.filter(item => (item._id || item.id) !== itemId));
      } else {
        alert("Failed to delete post.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete post.");
    }
  };

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        
        {isPublicProfile ? (
          <div style={{ marginBottom: '40px' }}>
            <button onClick={() => navigate('/perspectives')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '20px', fontSize: '13px', padding: 0 }}>← Back to My Feed</button>
            
            <div style={{ ...styles.dumaCard, padding: '40px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
               <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#eee', marginBottom: '15px', border: '3px solid #222' }}>
                  {profileInfo?.avatarUrl ? (
                    isVideoUrl(profileInfo.avatarUrl) ? (
                      <video src={normalizeMediaVideoUrl(profileInfo.avatarUrl)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay loop muted playsInline />
                    ) : (
                      <img src={profileInfo.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )
                  ) : (
                    <span style={{ fontSize: '36px', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>👤</span>
                  )}
               </div>
               <h2 style={{ margin: '0 0 10px 0' }}>{profileInfo?.displayName || profileEmail?.split('@')[0]}</h2>
               <RankBadge rankTitle={profileInfo?.rankTitle || 'Comrade'} />
               
               {authToken && userEmail && profileEmail !== userEmail && (
                  <button 
                    onClick={() => handleFollowingToggle(profileEmail)} 
                    style={{ marginTop: '25px', padding: '10px 24px', fontSize: '13px', fontWeight: 'bold', borderRadius: '24px', border: selectedFollowing.includes(profileEmail) ? '1px solid #ccc' : 'none', backgroundColor: selectedFollowing.includes(profileEmail) ? 'transparent' : '#222', color: selectedFollowing.includes(profileEmail) ? '#666' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    {selectedFollowing.includes(profileEmail) ? 'Following' : 'Follow'}
                  </button>
               )}
            </div>
            <h3 style={{ marginTop: '30px', marginBottom: '16px' }}>{profileInfo?.displayName || profileEmail?.split('@')[0]}'s Perspectives</h3>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ marginBottom: '6px' }}>My Perspectives</h2>
              <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                Follow people from The Duma to see their perspectives in your personalized feed. Earn +1 point for each person you follow!
              </p>
            </div>

            <div style={{ ...styles.dumaCard, marginBottom: '30px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Who You Follow ({selectedFollowing.length}/{followingList.length})</h3>
              {followingList.length === 0 ? (
                <p style={{ color: '#888', fontSize: '13px' }}>No people yet. Submit to the Duma to build your community!</p>
              ) : (
                <div style={{ maxHeight: '560px', overflowY: 'auto', paddingRight: '4px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                  {followingList.map(person => (
                    <div key={person} style={{ border: selectedFollowing.includes(person) ? '2px solid #222' : '1px solid #ddd', borderRadius: '8px', padding: '10px', backgroundColor: selectedFollowing.includes(person) ? '#f9f9f9' : '#fff', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#eee', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {avatarByUser[person] ? (
                            /\.(mp4|mov|webm)$/i.test(avatarByUser[person]) || avatarByUser[person].includes('/video/upload/') ? (
                              <video src={normalizeMediaVideoUrl(avatarByUser[person])} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay loop muted playsInline />
                            ) : (
                              <img src={avatarByUser[person]} alt={person} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )
                          ) : (
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#444' }}>{person[0]?.toUpperCase() || '?'}</span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleFollowingToggle(person)}
                          style={{ flex: 1, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: selectedFollowing.includes(person) ? '700' : '500', color: '#222', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: 0 }}
                        >
                          {person}
                        </button>
                      </div>

                      <button onClick={() => navigate(`/perspectives?person=${encodeURIComponent(person)}`)} style={{ width: '100%', border: '1px solid #ccc', borderRadius: '6px', padding: '6px 8px', background: '#fff', fontSize: '11px', cursor: 'pointer' }}>
                        View perspectives
                      </button>
                    </div>
                  ))}
                  </div>
                </div>
              )}
            </div>
            
            <h3 style={{ marginBottom: '16px' }}>Perspectives Feed ({filteredItems.length})</h3>
          </>
        )}

        <div>
          {filteredItems.length === 0 ? (
            <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888' }}>
              No perspectives yet. Follow people from the Duma or share your own perspective!
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id || item._id} style={styles.dumaCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={styles.typeTag}>Perspective</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.submitterRank && <RankBadge rankTitle={item.submitterRank} />}
                    {authToken && userEmail && item.submittedBy && item.submittedBy.toLowerCase() === userEmail.toLowerCase() && (
                      <button onClick={() => handleDeletePost(item._id || item.id)} style={{ border: '1px solid #e74c3c', color: '#e74c3c', background: '#fff', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        Trash
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {item.submittedBy && (
                      <Link to={`/perspectives?person=${encodeURIComponent(item.submittedBy)}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <CredentialHeader email={item.submittedBy} displayName={item.submitterDisplayName || null} rankTitle={item.submitterRank || 'Comrade'} rankScore={null} avatarUrl={item.submitterAvatar || null} socialLinks={item.submitterSocialLinks || null} />
                      </Link>
                    )}
                  </div>
                  {authToken && item.submittedBy && userEmail && item.submittedBy.toLowerCase() !== userEmail.toLowerCase() && (
                    <button 
                      onClick={() => following?.includes(item.submittedBy) ? onUnfollowUser?.(item.submittedBy) : onFollowUser?.(item.submittedBy)} 
                      style={{ marginLeft: '10px', padding: '6px 14px', fontSize: '11px', fontWeight: 'bold', borderRadius: '20px', border: following?.includes(item.submittedBy) ? '1px solid #ccc' : 'none', backgroundColor: following?.includes(item.submittedBy) ? 'transparent' : '#222', color: following?.includes(item.submittedBy) ? '#666' : '#fff', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}
                    >
                      {following?.includes(item.submittedBy) ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>

                {item.location && (
                  <div style={{ fontSize: '11px', color: '#555', backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', marginBottom: '10px', alignItems: 'center', gap: '4px' }}>
                    📍 {item.location}
                  </div>
                )}
                <h4 style={{ marginTop: '12px', marginBottom: '8px', color: '#555' }}>Prompt: "{item.prompt || 'What makes a person beautiful?'}"</h4>
                <p style={{ color: '#222', fontSize: '14px', lineHeight: '1.6' }}>{item.response || item.reason || item.desc}</p>

                {(() => {
                  const mediaList = Array.isArray(item.mediaUrls) && item.mediaUrls.length > 0 ? item.mediaUrls : item.mediaUrl ? [item.mediaUrl] : item.videoUrl ? [item.videoUrl] : [];
                  if (mediaList.length === 0) return null;
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: mediaList.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px', margin: '15px 0', background: '#fafafa', padding: '10px', borderRadius: '12px', border: '1px solid #eee' }}>
                      {mediaList.map((url, idx) => {
                        const isVideo = isVideoUrl(url);
                        return (
                          <div key={idx} style={{ textAlign: 'center' }}>
                            {isVideo ? (
                              <video
                                src={normalizeMediaVideoUrl(url)}
                                poster={url.includes('cloudinary.com') ? url.replace(/\.(mp4|mov|webm|m4v)$/i, '.jpg') : undefined}
                                style={{ width: '100%', maxHeight: '400px', borderRadius: '8px', backgroundColor: '#000', objectFit: 'contain' }}
                                controls playsInline preload="metadata"
                              />
                            ) : (
                              <img 
                                src={url} 
                                alt={`Attachment ${idx + 1}`} 
                                onClick={() => setExpandedImage(url)}
                                style={{ width: '100%', maxHeight: mediaList.length === 1 ? '400px' : '200px', borderRadius: '8px', objectFit: 'cover', cursor: 'zoom-in' }} 
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            ))
          )}
        </div>

        {/* FULLSCREEN IMAGE LIGHTBOX */}
        {expandedImage && (
          <div 
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
            onClick={() => setExpandedImage(null)}
          >
            <button style={{ position: 'absolute', top: '20px', right: '30px', background: 'transparent', color: '#fff', border: 'none', fontSize: '36px', cursor: 'pointer' }} onClick={() => setExpandedImage(null)}>✕</button>
            <img src={expandedImage} alt="Expanded" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '8px', objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
          </div>
        )}
    </div>
  );
};

// --- ADMIN ORDER TRACKING & FULFILLMENT SYSTEM ---
const AdminOrdersPage = ({ authToken, userEmail }) => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const isOwner = userEmail === "YOUR_EMAIL@domain.com";

  const fetchAllOrders = useCallback(async () => {
    if (!authToken) return;
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Error retrieving site orders:", err);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    if (isOwner) fetchAllOrders();
  }, [isOwner, fetchAllOrders]);

  const handleUpdateStatus = async (orderId, nextStatus) => {
    setUpdatingId(orderId);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (response.ok) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: nextStatus } : o));
      } else {
        alert("Server rejected status transition update.");
      }
    } catch (err) {
      alert("Network dropped during request.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isOwner) {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <h2>Access Restricted</h2>
          <p style={{ color: '#888' }}>This area is reserved for authorized personnel only.</p>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(o => filterStatus === "All" || o.status === filterStatus);

  const getStatusColor = (status) => {
    if (status === "Shipped") return { background: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb' };
    if (status === "Delivered") return { background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' };
    return { background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' };
  };

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>Fulfillment Dashboard</h2>
          <p style={{ color: '#666', marginTop: '4px', fontSize: '14px' }}>Monitor customized formulas, audit transactions, and update package lifecycles.</p>
        </div>
        <button onClick={fetchAllOrders} style={{ ...styles.authButton, width: 'auto', padding: '10px 20px', background: '#34495e' }}>
          🔄 Refresh Orders
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
        {["All", "Pending", "Shipped", "Delivered"].map(status => (
          <button key={status} onClick={() => setFilterStatus(status)}
            style={{
              padding: '8px 16px',
              backgroundColor: filterStatus === status ? '#222' : '#f5f5f5',
              color: filterStatus === status ? '#fff' : '#222',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#888' }}>Querying master business ledger...</p>
      ) : filteredOrders.length === 0 ? (
        <div style={{ ...styles.legislatureCard, textAlign: 'center', padding: '40px', color: '#888' }}>
          No recorded sales entries found matching status group: <strong>"{filterStatus}"</strong>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredOrders.map(order => (
            <div key={order._id} style={{ ...styles.legislatureCard, border: '1px solid #e0e0e0', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', fontWeight: '700' }}>Order Reference</span>
                  <h3 style={{ margin: '2px 0', fontSize: '15px', fontFamily: 'monospace' }}>#{order._id}</h3>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#666' }}>Processed: <strong>{new Date(order.createdAt).toLocaleDateString()}</strong></span>
                  <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '20px', ...getStatusColor(order.status) }}>
                    {order.status || "Pending"}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '15px' }}>
                <div style={{ background: '#f9f9f9', padding: '14px', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '12px', color: '#777', textTransform: 'uppercase' }}>Recipient</h4>
                  <p style={{ margin: '2px 0', fontSize: '13px' }}><strong>User Profile Email:</strong> {order.customerEmail}</p>
                </div>

                <div style={{ background: '#f9f9f9', padding: '14px', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '12px', color: '#777', textTransform: 'uppercase' }}>Selected Pack Items</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {order.items?.map((item, idx) => (
                      <span key={idx} style={{ fontSize: '11px', backgroundColor: '#fff', border: '1px solid #ddd', padding: '3px 8px', borderRadius: '4px' }}>
                        📦 {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>Workflow Controls:</span>
                <button disabled={updatingId === order._id || order.status === "Pending"} onClick={() => handleUpdateStatus(order._id, "Pending")}
                  style={{ ...styles.authButton, width: 'auto', padding: '6px 12px', fontSize: '12px', background: '#7f8c8d', opacity: order.status === "Pending" ? 0.4 : 1 }}
                >
                  Reset to Pending
                </button>
                <button disabled={updatingId === order._id || order.status === "Shipped"} onClick={() => handleUpdateStatus(order._id, "Shipped")}
                  style={{ ...styles.authButton, width: 'auto', padding: '6px 12px', fontSize: '12px', background: '#2980b9', opacity: order.status === "Shipped" ? 0.4 : 1 }}
                >
                  🚢 Ship Package
                </button>
                <button disabled={updatingId === order._id || order.status === "Delivered"} onClick={() => handleUpdateStatus(order._id, "Delivered")}
                  style={{ ...styles.authButton, width: 'auto', padding: '6px 12px', fontSize: '12px', background: '#27ae60', opacity: order.status === "Delivered" ? 0.4 : 1 }}
                >
                  ✅ Confirm Delivery
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- MODEL-FRIENDLY PAGE ---
const ModelFriendlyPage = () => {
  const products = Object.keys(PRODUCT_VARIANT_MAP).map(name => {
    const config = PRODUCT_VARIANT_MAP[name];
    let category = "Skin Care";
    if (name.includes("Shampoo")) category = "Hair Care - Shampoo";
    else if (name.includes("Conditioner")) category = "Hair Care - Conditioner";
    else if (name.includes("Oil")) category = "Hair Care - Treatment Oil";
    else if (name.includes("Scrub")) category = "Skin Care - Exfoliant";
    else if (name.includes("Toner")) category = "Skin Care - Toner";
    else if (name.includes("Lotion")) category = "Skin Care - Moisturizer";
    return {
      name: name,
      category: category,
      pricing: {
        oneTime: `$${config.pricing.oneTime}.00`,
        subscription: `$${config.pricing.subscription}.00/month`
      },
      merchandiseId: config.merchandiseId,
      keyIngredients: name.includes("Shampoo") ? ["Provitamin B5 (Panthenol)", "Polyquaternium-10"] : ["Premium Ingredients"],
      benefits: ["High-grade community formula"],
    };
  });

  const siteInfo = {
    name: "The Majorities",
    shopDomain: SHOP_DOMAIN,
    description: "The Majorities is a community-driven haircare and skincare brand offering a curated set of 6 products spanning hair and face care.",
    purchaseModel: "Custom 6-product set builder. Select one product from each category. Buy as a one-time purchase or subscribe monthly.",
    totalOneTimePrice: `$${Object.keys(PRODUCT_VARIANT_MAP).length * 7}.00 for full 6-product set`,
    totalSubscriptionPrice: `$${Object.keys(PRODUCT_VARIANT_MAP).length * 6}.00/month for full 6-product set`,
    subscriptionSavings: `$${Object.keys(PRODUCT_VARIANT_MAP).length * (7 - 6)}.00/month savings with subscription`
  };

  const routes = [
    { path: "/", label: "Home - Product Builder", description: "Select and purchase a custom 6-product set" },
    { path: "/recommend", label: "Recommend", description: "Submit product recommendations to the community Duma feed" },
    { path: "/partner", label: "Partner Program", description: "Apply to become a distribution partner (25% commission structure)" },
    { path: "/duma", label: "The Duma Ledger", description: "Community feed with Culture posts, product recommendations, and partner listings" },
    { path: "/profile", label: "Profile", description: "User profile with rank system, avatar, social links, and saved product formulas" },
    { path: "/login", label: "Login", description: "Email/password authentication" },
    { path: "/signup", label: "Sign Up", description: "Create a new account" },
    { path: "/model", label: "Model-Friendly View", description: "This page - structured data for AI models and crawlers" }
  ];

  const rankSystem = {
    description: "50-tier loyalty rank system. Users earn points through community participation. Ranks range from Comrade (1+ pts) up to Servant of the People (50,000,000+ pts).",
    lowestRank: { title: "Comrade", minPoints: 1 },
    highestRank: { title: "Servant of the People", minPoints: 50000000 },
    notableRanks: [
      { title: "Comrade", minPoints: 1 },
      { title: "Schout-bij-nacht", minPoints: 250 },
      { title: "Rusalka", minPoints: 1000 },
      { title: "Domovoi", minPoints: 1500 },
      { title: "Chernobog", minPoints: 10000 },
      { title: "Morana", minPoints: 50000 },
      { title: "Lada", minPoints: 100000 },
      { title: "Politburo Member of The Majorities", minPoints: 10000000 },
      { title: "Servant of the People", minPoints: 50000000 }
    ]
  };

  const containerStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "monospace",
    color: "#111",
    lineHeight: "1.7"
  };

  const sectionStyle = {
    marginBottom: "40px",
    borderTop: "2px solid #111",
    paddingTop: "20px"
  };

  const headingStyle = {
    fontSize: "16px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "2px",
    marginBottom: "16px"
  };

  const subHeadingStyle = {
    fontSize: "14px",
    fontWeight: "700",
    marginBottom: "8px",
    marginTop: "16px"
  };

  const labelStyle = {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "#666",
    display: "block",
    marginBottom: "2px"
  };

  const valueStyle = {
    fontSize: "13px",
    marginBottom: "8px",
    paddingLeft: "12px"
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: "40px", paddingBottom: "20px", borderBottom: "2px solid #111" }}>
        <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "#666", marginBottom: "8px" }}>
          AI / Model-Friendly View
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 8px 0" }}>The Majorities — Structured Site Data</h1>
        <p style={{ fontSize: "13px", color: "#444", margin: 0 }}>
          This page provides a clean, structured representation of The Majorities website for AI assistants,
          search crawlers, and accessibility tools. All product data, pricing, routes, and community features
          are listed below in a readable, machine-parseable format.
        </p>
      </div>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Site Overview</h2>
        <span style={labelStyle}>Brand Name</span>
        <div style={valueStyle}>{siteInfo.name}</div>
        <span style={labelStyle}>Description</span>
        <div style={valueStyle}>{siteInfo.description}</div>
        <span style={labelStyle}>Purchase Model</span>
        <div style={valueStyle}>{siteInfo.purchaseModel}</div>
        <span style={labelStyle}>Full Set — One-Time Price</span>
        <div style={valueStyle}>{siteInfo.totalOneTimePrice}</div>
        <span style={labelStyle}>Full Set — Subscription Price</span>
        <div style={valueStyle}>{siteInfo.totalSubscriptionPrice}</div>
        <span style={labelStyle}>Subscription Savings</span>
        <div style={valueStyle}>{siteInfo.subscriptionSavings}</div>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Products ({products.length} Total)</h2>
        {products.map((product, idx) => (
          <div key={product.merchandiseId} style={{ marginBottom: "28px", paddingLeft: "12px", borderLeft: "3px solid #eee" }}>
            <div style={subHeadingStyle}>{idx + 1}. {product.name}</div>
            <span style={labelStyle}>Category</span>
            <div style={valueStyle}>{product.category}</div>
            <span style={labelStyle}>One-Time Price</span>
            <div style={valueStyle}>{product.pricing.oneTime}</div>
            <span style={labelStyle}>Subscription Price</span>
            <div style={valueStyle}>{product.pricing.subscription}</div>
            <span style={labelStyle}>Key Ingredients</span>
            <div style={valueStyle}>{product.keyIngredients.join(", ")}</div>
            <span style={labelStyle}>Benefits</span>
            <div style={valueStyle}>{product.benefits.join(" · ")}</div>
            <span style={labelStyle}>Shopify Merchandise ID</span>
            <div style={valueStyle}>{product.merchandiseId}</div>
          </div>
        ))}
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Site Routes and Pages</h2>
        {routes.map(route => (
          <div key={route.path} style={{ marginBottom: "12px", paddingLeft: "12px", borderLeft: "3px solid #eee" }}>
            <div style={subHeadingStyle}>{route.label} — <span style={{ fontFamily: "monospace", fontWeight: "400" }}>{route.path}</span></div>
            <div style={{ fontSize: "13px", color: "#555" }}>{route.description}</div>
          </div>
        ))}
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Community Rank System</h2>
        <div style={valueStyle}>{rankSystem.description}</div>
        <span style={labelStyle}>Lowest Rank</span>
        <div style={valueStyle}>{rankSystem.lowestRank.title} (1+ points)</div>
        <span style={labelStyle}>Highest Rank</span>
        <div style={valueStyle}>{rankSystem.highestRank.title} (50,000,000+ points)</div>
        <span style={labelStyle}>Notable Ranks</span>
        <div style={{ paddingLeft: "12px" }}>
          {rankSystem.notableRanks.map(r => (
            <div key={r.title} style={{ fontSize: "13px", marginBottom: "4px" }}>
              <strong>{r.title}</strong> — {r.minPoints.toLocaleString()}+ pts
            </div>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Community Features</h2>
        <div style={subHeadingStyle}>The Duma Ledger</div>
        <div style={valueStyle}>A community feed with three sections: Culture (user perspective posts with prompts), Product Recommendations (community-submitted products), and Partners (business partnership applications).</div>
        <div style={subHeadingStyle}>Points and Rewards</div>
        <div style={valueStyle}>Users earn points for community actions (e.g., submitting a Culture post = 100 points, uploading a profile avatar = 25 points). Points determine rank tier.</div>
        <div style={subHeadingStyle}>Partner Program</div>
        <div style={valueStyle}>Businesses can apply for a distribution partnership. Minimum order: 500 units of 34oz. Commission structure: 25% distribution fee.</div>
        <div style={subHeadingStyle}>Social Profiles</div>
        <div style={valueStyle}>Users can link Instagram, TikTok, and Snapchat profiles to their Majorities account.</div>
      </section>

      <div style={{ borderTop: "2px solid #111", paddingTop: "20px", fontSize: "11px", color: "#888" }}>
        <p>This model-friendly page is provided by The Majorities to support AI assistants and accessibility tools.</p>
        <p>Shop domain: {siteInfo.shopDomain} · Backend: hair-backend-2.onrender.com</p>
        <p>For the interactive product builder, visit the <a href="/" style={{ color: "#111" }}>home page</a>.</p>
      </div>
    </div>
  );
};

// --- CULTURE LAB PAGE (Share Your Perspective) ---
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
        { id: 15, text: "Post Anything! Share whatever is on your mind today—a random thought, life update, or funny hot take." }
          ];
      const [activePromptIndex, setActivePromptIndex] = useState(0);
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
          .catch(() => {});
      }
    }, [authToken]);
    
      const activePrompt = prompts[activePromptIndex];
    
      const handleDumaBatchUpload = (e) => {
            if (!e.target.files || e.target.files.length === 0) return;
            const files = Array.from(e.target.files);
            const updatedSlots = [...dumaSlots];
            files.forEach((file) => {
                    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                              alert('Please upload image or video files only (JPG, PNG, HEIC, WEBP, MP4, MOV).');
                              return;
                    }
                    if (file.size > 100 * 1024 * 1024) return;
                    
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
            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                    alert('Please upload image or video files only (JPG, PNG, HEIC, WEBP, MP4, MOV).');
                    return;
            }
            if (file.size > 100 * 1024 * 1024) return;
            const updatedSlots = [...dumaSlots];
            updatedSlots[index] = {
                    url: URL.createObjectURL(file),
                    type: file.type.startsWith('video/') ? 'video' : 'image',
                    file
            };
            setDumaSlots(updatedSlots);
      };
    
      const removeDumaSlot = (index) => {
            const updatedSlots = [...dumaSlots];
            updatedSlots[index] = null;
            setDumaSlots(updatedSlots);
      };
    
      const handleSubmit = async (e) => {
            e.preventDefault();
            if (!response.trim()) {
                    setErrorMsg("Please write a description for your post.");
                    return;
            }
            setErrorMsg("");
            setCultureSubmitStatus("uploading");
            const activePrompt = selectedPromptIndex !== null ? prompts[selectedPromptIndex] : null;
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
                                                        response: response,
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
                                          response: response,
                                          mediaUrls: uploadedMediaUrls.length > 0 ? uploadedMediaUrls : filledDumaSlots.map(s => s.url),
                                          submittedBy: userEmail,
                                          location: postLocation,
                                          submitterDisplayName: displayName,
                                          submitterRank: rankTitle || 'Comrade',
                                          submitterAvatar: userAvatar || null,
                                          votes: { yes: 0 }
                              });
                    }
                    const pointsEarned = activePrompt ? 120 : 100;
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
          <div style={{ fontSize: '40px', marginBottom: '16px' }}></div>
            <h2 style={{ marginBottom: '10px' }}>Perspective Shared!</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
            Your response has been submitted to The Majorities' Culture section and appears in the Duma for community voting.
              </p>
                        <p style={{ fontSize: '12px', color: '#888' }}>You earned points!</p>
{rankTitle && <RankBadge rankTitle={rankTitle} />}
  </div>
  </div>
      );
}

  return (
          <div style={{ padding: isMobile ? '25px 16px' : '40px 60px', maxWidth: '1100px', margin: '0 auto', flex: '1 1 auto', minWidth: 0 }}>
      <h2>Share Your Perspective</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        Contribute to our Culture section by answering one of these prompts. 
                  Submit your response to the Duma for community voting and earn points!
          </p>
{userEmail && rankTitle && (
          <div style={{ marginBottom: '30px' }}>
          <CredentialHeader email={userEmail} displayName={displayName} rankTitle={rankTitle} rankScore={rankScore} avatarUrl={userAvatar} />
  </div>
        )}
          {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}
                <form style={styles.dumaCard} onSubmit={handleSubmit}>
                  
                   <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>Attach Photos or Videos (Up to 6)</label>
                  <p style={{ fontSize: '11px', color: '#888', marginBottom: '10px' }}>Batch-upload multiple files at once, or use an individual terminal slot below.</p>
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
          <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>Your Response</h3>
          <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px 0' }}>Share your thoughts (recommended: 45 seconds of speaking if recorded)</p>
          <textarea
            required
                        placeholder="Type your response here..."
                                    style={{ ...styles.input, height: '140px' }}
          value={response}
                      onChange={(e) => setResponse(e.target.value)}
                                />
                                <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginTop: '16px', marginBottom: '8px' }}>
          ANSWER PROMPTS FOR POINTS (COMPLETE ALL FOR SPECIAL REWARD)
            </label>
                    <p style={{ fontSize: '11px', color: '#888', margin: '0 0 10px 0' }}>
          Click any prompt below to attach it to your post and earn 120 points! (Scroll to view all 15 prompts)
            </p>
                    <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '8px', marginBottom: '20px', backgroundColor: '#fafafa' }}>
{prompts.map((prompt, idx) => (
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
          <button type="submit" style={styles.authButton}>
{postSubmitStatus === "uploading" ? "Publishing..." : "Submit to the Duma (+100 points)"}
  </button>
  </form>
        <section style={{ marginTop: '50px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '8px', fontWeight: '600' }}>Community Social Links</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Connect with other members of The Majorities.</p>
{communitySocials.length === 0 ? (
            <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888', padding: '30px' }}>
            No social links shared yet. Be the first — add yours in your Profile settings!
  </div>
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
                      <a href={safeSocialUrl(member.links.instagram)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#c13584', textDecoration: 'none', fontWeight: '500' }}>
                      📸 Instagram
                        </a>
                                          )}
{member.links.tiktok && (
                      <a href={safeSocialUrl(member.links.tiktok)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#222', textDecoration: 'none', fontWeight: '500' }}>
                      🎵 TikTok
                        </a>
                                          )}
{member.links.snapchat && (
            <a href={safeSocialUrl(member.links.snapchat)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', fontSize: '12px', color: '#000000', backgroundColor: '#FFFC00', padding: '2px 8px', borderRadius: '6px', textDecoration: 'none', fontWeight: '500' }}>
              <SnapchatIcon /> Snapchat
            </a>
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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [rankTitle, setRankTitle] = useState("Comrade");
  const [rankScore, setRankScore] = useState(1);
  const [tokens, setTokens] = useState(0);
  const [savedSets, setSavedSets] = useState([]);
  const [userAvatar, setUserAvatar] = useState("");
  const [dumaItems, setDumaItems] = useState([{ id: 1, type: "Partner", company: "EcoHair Labs", product: "Silk Serum", desc: "Organic serum for hair.", section: "Commerce", submitterRank: "Comrade" }]);
  const [following, setFollowing] = useState([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/health`, { method: "GET" }).catch(() => {});
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const email = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
    const storedSets = localStorage.getItem("savedSets");
    if (storedSets) { try { setSavedSets(JSON.parse(storedSets)); } catch (e) {} }
    const storedAvatar = localStorage.getItem("userAvatar") || sessionStorage.getItem("userAvatar");
    if (storedAvatar) setUserAvatar(storedAvatar);
    if (token) {
      fetch(`${BACKEND_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(data => {
        if (data.email) { setIsLoggedIn(true); setUserEmail(data.email); setAuthToken(token); const currentScore = data.rank_score || 1; setRankScore(currentScore); setRankTitle(getRankTitle(currentScore)); localStorage.removeItem("rankTitle"); localStorage.removeItem("rankScore"); sessionStorage.removeItem("rankTitle"); sessionStorage.removeItem("rankScore"); } else { localStorage.removeItem("authToken"); localStorage.removeItem("userEmail"); sessionStorage.removeItem("authToken"); sessionStorage.removeItem("userEmail"); }
      }).catch(() => { if (email) { setIsLoggedIn(true); setUserEmail(email); setAuthToken(token); const storedRank = localStorage.getItem("rankTitle") || sessionStorage.getItem("rankTitle"); const storedScore = parseInt(localStorage.getItem("rankScore") || sessionStorage.getItem("rankScore") || "1"); if (storedRank) setRankTitle(storedRank); setRankScore(storedScore); } });
    }
  }, []);

  const handleLoginSuccess = (email, token, rememberMe, rank, score) => {
    setIsLoggedIn(true); setUserEmail(email); setAuthToken(token); const resolvedScore = score || 1; const resolvedRank = getRankTitle(resolvedScore); setRankTitle(resolvedRank); setRankScore(resolvedScore);
    const storage = rememberMe ? localStorage : sessionStorage; storage.setItem("authToken", token); storage.setItem("userEmail", email); storage.setItem("rankTitle", resolvedRank); storage.setItem("rankScore", String(resolvedScore));
  };

  const handleLogout = () => {
    setIsLoggedIn(false); setUserEmail(""); setAuthToken(""); setRankTitle("Comrade"); setRankScore(1); setUserAvatar("");
    localStorage.removeItem("authToken"); localStorage.removeItem("userEmail"); localStorage.removeItem("rankTitle"); localStorage.removeItem("rankScore"); localStorage.removeItem("userAvatar");
    sessionStorage.removeItem("authToken"); sessionStorage.removeItem("userEmail"); sessionStorage.removeItem("rankTitle"); sessionStorage.removeItem("rankScore"); sessionStorage.removeItem("userAvatar");
  };

  const handleAvatarUpdate = (url) => {
    setUserAvatar(url);
    const storage = localStorage.getItem("authToken") ? localStorage : sessionStorage;
    if (url) { storage.setItem("userAvatar", url); } else { storage.removeItem("userAvatar"); }
  };

  const saveSetToProfile = (items) => { const newSet = { items, date: new Date().toLocaleDateString() }; const updatedSets = [newSet, ...savedSets]; setSavedSets(updatedSets); localStorage.setItem("savedSets", JSON.stringify(updatedSets)); };
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
      const storage = localStorage.getItem("authToken") ? localStorage : sessionStorage;
      storage.setItem("rankScore", String(newScore));
      storage.setItem("rankTitle", newRank);
      return newScore;
    });
  }, [authToken]);

  const followUser = useCallback((personEmail) => {
    if (!following.includes(personEmail)) {
      setFollowing(prev => [...prev, personEmail]);
      addPoints(1);
      if (authToken) {
        fetch(`${BACKEND_URL}/api/profile/follow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ followedEmail: personEmail })
        }).catch(err => console.error("Error notifying follow:", err));
      }
    }
  }, [following, addPoints, authToken]);

  const unfollowUser = (personEmail) => {
    setFollowing(prev => prev.filter(p => p !== personEmail));
  };

  return (
    <Router>
      <ScrollToTop />
      <div style={styles.pageWrapper}>
        <header style={{ ...styles.header, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '15px' : '0', padding: isMobile ? '15px 20px' : '15px 60px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}><div style={styles.logo}>The Majorities</div></Link>
          <nav style={{ ...styles.nav, flexWrap: 'wrap', justifyContent: 'center', gap: isMobile ? '12px' : '25px' }}>
            <Link to="/" style={styles.navLink}>Home</Link>
            <Link to="/recommend" style={styles.navLink}>Recommend</Link>
            <Link to="/partner" style={styles.navLink}>Partner</Link>
            <Link to="/duma" style={styles.navLink}>The Duma</Link>
            {isLoggedIn ? (
              <>
                <Link to="/perspectives" style={styles.navLink}>Perspectives</Link>
                {isLoggedIn && userEmail === "YOUR_EMAIL@domain.com" && (
                  <Link to="/admin/orders" style={{ ...styles.navLink, color: '#e74c3c', fontWeight: '700' }}>
                    ⚙️ Admin Control
                  </Link>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderLeft: isMobile ? 'none' : '1px solid #eee', paddingLeft: isMobile ? '0' : '15px', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'center' : 'flex-start', marginTop: isMobile ? '5px' : '0' }}>
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
          <Route path="/oauth/callback/:provider" element={<OAuthCallbackPage onLogin={handleLoginSuccess} provider="instagram" />} />
          <Route path="/auth/tiktok/callback" element={<OAuthCallbackPage onLogin={handleLoginSuccess} provider="tiktok" />} />
          <Route path="/signup" element={<SignupPage onLogin={handleLoginSuccess} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/recommend" element={<RecommendPage addDumaItem={addDumaItem} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} userAvatar={userAvatar} />} />
          <Route path="/partner" element={<PartnerPage addDumaItem={addDumaItem} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} userAvatar={userAvatar} />} />
          <Route path="/culture" element={isLoggedIn ? <CultureLabPage addDumaItem={addDumaItem} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} onAddPoints={addPoints} userAvatar={userAvatar} /> : <Navigate to="/login" />} />
          <Route path="/duma" element={<DumaPage items={dumaItems} authToken={authToken} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} onAddPoints={addPoints} userAvatar={userAvatar} following={following} onFollowUser={followUser} onUnfollowUser={unfollowUser} />} />
          <Route path="/perspectives" element={isLoggedIn ? <PerspectivesPage items={dumaItems} authToken={authToken} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} following={following} onFollowUser={followUser} onUnfollowUser={unfollowUser} onAddPoints={addPoints} userAvatar={userAvatar} /> : <Navigate to="/login" />} />
          <Route path="/legislature" element={<DumaPage items={dumaItems} authToken={authToken} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} onAddPoints={addPoints} userAvatar={userAvatar} following={following} onFollowUser={followUser} onUnfollowUser={unfollowUser} />} />
          <Route path="/profile" element={<ProfilePage userEmail={userEmail} savedSets={savedSets} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} onAddPoints={addPoints} userAvatar={userAvatar} onAvatarUpdate={handleAvatarUpdate} tokens={tokens} addDumaItem={addDumaItem} />} />
          <Route path="/orders" element={<div style={{ padding: '60px', textAlign: 'center' }}><h2>Payment Received!</h2><p>Your custom hair set is being prepared. Check your Profile to see your formula.</p><Link to="/profile">Go to Profile</Link></div>} />
          <Route path="/admin/orders" element={<AdminOrdersPage authToken={authToken} userEmail={userEmail} />} />
          <Route path="/model" element={<ModelFriendlyPage />} />
          <Route path="/TermsofService" element={<TermsOfServicePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
        </Routes>
        <footer style={{ marginTop: '60px', padding: '20px 60px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '12px' }}>
          <Link to="/TermsofService" style={{ color: '#666', textDecoration: 'none' }}>Terms of Service</Link>
          <Link to="/Privacy" style={{ color: '#666', textDecoration: 'none' }}>Privacy Policy</Link>
        </footer>
      </div>
    </Router>
  );
}

// ============================================================
// TERMS OF SERVICE PAGE
// ============================================================
const TermsOfServicePage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '60px 30px', fontFamily: 'Inter, sans-serif', color: '#222', lineHeight: 1.8 }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Terms of Service</h1>
      <p style={{ color: '#888', fontSize: '13px', marginBottom: '40px' }}>Last updated: June 22, 2026</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>1. Acceptance of Terms</h2>
      <p>By accessing or using The Majorities ecosystem, web interface, custom formulas, or network features (collectively, the "Service"), you explicitly agree to be bound by these Terms of Service. If you do not accept these conditions, you are prohibited from utilizing our custom product builder or participating in our governance structures.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>2. Custom Formulation E-Commerce</h2>
      <p>The Majorities provides an active custom assembly framework allowing users to choose exactly six (6) items across distinct hair and face categories to complete an authorized set.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>3. The Duma Ledger & Governance Tokens</h2>
      <p>Our platforms host a digital community ledger called the Duma. By interacting with the Duma, including uploading user avatars, publishing custom media context, following creators, or casting platform recommendations, you gain experience points that directly adjust your community tier.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>4. Partner Distribution Marketplace</h2>
      <p>Third-party manufacturing groups applying for official platform retail listings must adhere to our global logistics rules.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>5. User-Submitted Media and Content Rights</h2>
      <p>When you post a video view snippet, custom hair profile, or feedback justification to the Duma, you grant The Majorities an unrestricted, global, royalty-free license to host, display, and analyze that file.</p>
    </div>
  );
};

// ============================================================
// PRIVACY POLICY PAGE
// ============================================================
const PrivacyPolicyPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '60px 30px', fontFamily: 'Inter, sans-serif', color: '#222', lineHeight: 1.8 }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Privacy Policy</h1>
      <p style={{ color: '#888', fontSize: '13px', marginBottom: '40px' }}>Last updated: June 22, 2026</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>1. Information We Collect Natively</h2>
      <p>To safely fulfill custom cosmetic selections and compute user tier algorithms, we process and log account email addresses, unique password configurations, custom profile avatars, user points tallies, and logged system formulas.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>2. How Your Private Records are Handled</h2>
      <p>We restrict utilization of logged variables strictly to core operational mechanics: To execute fast delivery packaging metrics through third-party optimization services like ShipBob.</p>
    </div>
  );
};

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
  legislatureCard: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '24px', padding: '30px', marginBottom: '20px' },
  typeTag: { background: '#222', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '10px' },
  perspectiveBox: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '20px', marginBottom: '20px', position: 'relative' },
  socialButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '10px', transition: 'opacity 0.2s', boxSizing: 'border-box' },
  generalSecretaryBadge: { boxShadow: '0 0 8px rgba(255,215,0,0.7)', background: 'linear-gradient(90deg,#b8860b,#ffd700,#b8860b)', color: '#fff', border: 'none' },
};
