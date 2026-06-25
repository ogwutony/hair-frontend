import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams } from "react-router-dom";
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

// --- 3. RANK SYSTEM (50-Tier Hierarchy) ---
const RANK_TIERS = [
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
  { title: "Hero of Socialist Labor",                   min: 4500000 },
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

const getRankTitle = (score) => {
  for (const tier of RANK_TIERS) {
    if (score >= tier.min) return tier.title;
  }
  return "Comrade";
};

const isPolitburoOrHigher = (score) => score >= 10000000; // "Politburo Member of The Majorities" and above

// --- CALCULATE POINTS TO NEXT RANK ---
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

  // Subscription: use Shopify Cart Permalink with selling_plan query param
  // Format: /cart/variantId1:qty1,variantId2:qty2?selling_plan=planId
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

const CredentialHeader = ({ email, rankTitle, rankScore, avatarUrl, socialLinks = {} }) => {
  const initial = (email || 'C')[0].toUpperCase();
  const color = getRankColor(rankTitle || 'Comrade');
  const isTopRank = rankTitle === "Servant of the People";
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#fff', flexWrap: 'wrap', marginBottom: '12px' }}>
      {/* Avatar */}
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
        {avatarUrl
          ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : initial}
      </div>
      {/* Email */}
      <span style={{ fontWeight: '600', fontSize: '14px', color: '#333', letterSpacing: '-0.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
        {email}
      </span>
      {/* Rank badge */}
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
        {rankTitle || 'Comrade'}
      </span>
      {/* Points badge */}
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
      {/* Social links */}
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
          {socialLinks.facebook ? (
            <a
              href={safeSocialUrl(socialLinks.facebook)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', fontSize: '11px', color: '#1877F2', fontWeight: '600' }}
              title="Facebook"
            >Facebook</a>
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

// --- 3. UI HELPERS ---
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
  { key: 'facebook', label: '📘 Facebook', placeholder: 'facebook.com/yourprofile' },
];

// Add this helper component to manage local, non-lagging text entry
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
// --- PROFILE PAGE COMPONENT - Enhanced with Photo & Video Features ---
const ProfilePage = ({ userEmail, savedSets, rankTitle, rankScore, authToken, onAddPoints, onAvatarUpdate, userAvatar, tokens, addDumaItem }) => {
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState(userAvatar || null);
  const [backendRankScore, setBackendRankScore] = useState(rankScore || 1);
  const [backendRankTitle, setBackendRankTitle] = useState(rankTitle || "Comrade");
  const [avatarSaveStatus, setAvatarSaveStatus] = useState("idle"); // idle | saving | saved | error
  const [hadExistingAvatar, setHadExistingAvatar] = useState(false);
  const avatarInputRef = React.useRef(null);

  // --- NEW: Share Your Perspective Media States ---
  const [cultureResponse, setCultureResponse] = useState("");
  const [cultureMediaFile, setCultureMediaFile] = useState(null);
  const [cultureMediaType, setCultureMediaType] = useState(null);
  const [cultureMediaPreview, setCultureMediaPreview] = useState(null);
  const [cultureSubmitStatus, setCultureSubmitStatus] = useState("idle");
  const [cultureErrorMsg, setCultureErrorMsg] = useState("");

  const perspectivePrompts = [
    { id: 1, text: "Drop a photo of your current view right now—no filtering, no cleaning up. Where are you working or relaxing from today?" },
    { id: 2, text: "If you had to describe your week so far using only one word, what would it be? Share it below!" },
    { id: 3, text: "Give a quick shout-out to a tool, a life hack, or a person that saved you time this week. What was it?" },
    { id: 4, text: "What is a completely harmless 'hill you are willing to die on'? (e.g., 'Cereal is soup,' 'Defrosting the car is the worst chore'). Let's hear your hot takes!" },
    { id: 5, text: "What was your very first job, and what is the most important (or hilarious) lesson you learned from it?" },
    { id: 6, text: "Let's celebrate the small stuff. What is one thing you accomplished this week—big or small—that you're proud of?" },
    { id: 7, text: "What is a project you are working on right now that has you genuinely excited?" },
    { id: 8, text: "Open your phone's photo library, go to the 5th most recent photo, and post it with zero context. Let the comments guess the story." },
    { id: 9, text: "If you could go back and give your 20-year-old self one piece of advice about life or career, what would it be?" },
    { id: 10, text: "Whats a more fun sport to watch Basketball or Football? Whats more fun to play?" },
    { id: 11, text: "Celebrity crush?" },
    { id: 12, text: "What is one morning ritual or habit that completely flips your mindset for a successful day?" },
    { id: 13, text: "Show or tell us about a 'blind buy' (product, book, or gadget) that actually exceeded your expectations." },
    { id: 14, text: "What is the best piece of advice you've received about avoiding burnout?" },
    { id: 15, text: "What's a small, mundane task you've completely optimized or automated in your life?" },
    { id: 16, text: "Describe your ultimate, no-compromise Sunday routine in three words or a quick clip." },
    { id: 17, text: "What does 'unplugging' look like for you when you need a digital detox?" },
    { id: 18, text: "What is a recent small win or personal milestone you're celebrating this week?" },
    { id: 19, text: "What is one ingredient, scent, or product you absolutely cannot live without right now?" },
    { id: 20, text: "Who is someone in your local community or online space making a quiet but massive impact? Give them a shout-out!" },
    { id: 21, text: "What is a cultural tradition or family custom you've actively chosen to keep alive?" },
    { id: 22, text: "Describe a time a stranger's small act of kindness completely turned your week around." },
    { id: 23, text: "What does the word 'community' mean to you in today's world?" },
    { id: 24, text: "What is a book, podcast, or documentary that completely altered how you view a certain topic?" },
    { id: 25, text: "Show or tell us about a passion project you are working on purely for the joy of it." },
    { id: 26, text: "If you could instantly master any creative skill or craft overnight, what would it be?" },
    { id: 27, text: "What is a common piece of conventional wisdom that you completely disagree with?" },
    { id: 28, text: "What is something you are deeply optimistic about looking into the next year?" },
    { id: 29, text: "If you could send a 30-second voice note to yourself from five years ago, what would you say?" },
    { id: 30, text: "What is a new hobby or topic you've suddenly become obsessed with learning about?" },
    { id: 31, text: "What is one thing you did this week that your future self will thank you for?" },
    { id: 32, text: "Show us your current hair routine in 3 steps or less. What are the non-negotiables you swear by?" },
    { id: 33, text: "What is your go-to protective style right now, and how long do you keep it in? Drop a pic or description!" },
    { id: 34, text: "What is the one hair product that completely transformed your hair health? Brand, type, and why—spill it all!" },
    { id: 35, text: "Let's talk shrinkage! How do you embrace or manage your natural curl pattern day-to-day?" },
    { id: 36, text: "What is the biggest hair care myth you used to believe that turned out to be totally wrong?" },
    { id: 37, text: "Show us your current OOTD (Outfit of the Day)! What inspired today's look—mood, weather, or something else?" },
    { id: 38, text: "What is one fashion rule you were taught that you have completely thrown out? What rule do you live by instead?" },
    { id: 39, text: "If you could only shop at one store or brand for an entire year, which would it be and why?" },
    { id: 40, text: "Drop your best budget fashion hack. How do you build great outfits without breaking the bank?" },
    { id: 41, text: "What's a wardrobe staple that every person should own regardless of their personal style?" },
    { id: 42, text: "Share your number one beauty hack that most people don't know about. The tip that genuinely changed your routine!" },
    { id: 43, text: "What is a skincare or beauty ingredient you recently discovered and can't stop recommending to everyone?" },
    { id: 44, text: "Describe your 5-minute 'I'm running late' beauty routine. What are the absolute essentials you never skip?" },
    { id: 45, text: "What is the best drugstore beauty dupe you've found for a high-end product? Let the community save some money!" },
    { id: 46, text: "Night routine check! Walk us through your wind-down skincare or beauty ritual before bed." }
  ]
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  const rotatePrompt = (direction) => {
    setActivePromptIndex((prev) => {
      if (direction === "random") {
        if (perspectivePrompts.length <= 1) return prev;
        let nextIndex = prev;
        while (nextIndex === prev) { nextIndex = Math.floor(Math.random() * perspectivePrompts.length); }
        return nextIndex;
      }
      return (prev + direction + perspectivePrompts.length) % perspectivePrompts.length;
    });
  };

  const handleCultureMediaChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCultureMediaFile(file);
      if (file.type.startsWith("image/")) {
        setCultureMediaType("image");
        setCultureMediaPreview(URL.createObjectURL(file));
      } else if (file.type.startsWith("video/")) {
        setCultureMediaType("video");
        setCultureMediaPreview(URL.createObjectURL(file));
      } else {
        alert("Please upload an image or video file only.");
      }
    }
  };

  const handleCultureSubmit = async (e) => {
    e.preventDefault();
    const selectedPrompt = perspectivePrompts[activePromptIndex]?.text || "";
    if (!selectedPrompt || !cultureResponse.trim()) {
      setCultureErrorMsg("Please select a prompt and provide your response.");
      return;
    }
    setCultureErrorMsg("");
    setCultureSubmitStatus("uploading");

    try {
      let uploadedMediaUrl = null;

      if (cultureMediaFile && authToken) {
        const formData = new FormData();
        formData.append("file", cultureMediaFile);
        formData.append("type", cultureMediaType);
        const uploadRes = await fetch(`${BACKEND_URL}/api/media/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${authToken}` },
          body: formData
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedMediaUrl = uploadData.storageUrl || uploadData.secure_url || uploadData.url;
        }
      }

      if (authToken) {
        const res = await fetch(`${BACKEND_URL}/api/duma/culture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({
            prompt: selectedPrompt,
            response: cultureResponse,
            category: "Culture",
            mediaUrl: uploadedMediaUrl,
            mediaType: cultureMediaType
          })
        });
        const data = await res.json();
        if (!res.ok) {
          setCultureErrorMsg(data.error || 'Submission failed');
          setCultureSubmitStatus("error");
          return;
        }
      }

      if (addDumaItem) {
        addDumaItem({
          id: Date.now(),
          type: "Culture",
          category: "Culture",
          prompt: selectedPrompt,
          response: cultureResponse,
          mediaUrl: cultureMediaPreview,
          mediaType: cultureMediaType,
          submittedBy: userEmail,
          submitterRank: rankTitle || 'Comrade',
          submitterAvatar: userAvatar || null,
          votes: { yes: 0 }
        });
      }

      if (onAddPoints) onAddPoints(100);
      setCultureSubmitStatus("saved");
      setTimeout(() => { navigate("/duma"); }, 2000);
    } catch (err) {
      setCultureSubmitStatus("error");
      setCultureErrorMsg("Server error trying to process submission.");
    }
  };

    const [perspective, setPerspective] = useState({
    box1: { videoUrl: null, description: "", videoFile: null },
    box2: { videoUrl: null, description: "", videoFile: null },
    box3: { videoUrl: null, description: "", videoFile: null },
    box4: { videoUrl: null, description: "", videoFile: null }
  });
  const [videoSaveStatus, setVideoSaveStatus] = useState({}); // { box1: "idle"|"saving"|"saved"|"error" }
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    tiktok: "",
    facebook: ""
  });
  const [editingBox, setEditingBox] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [dumaSubmitStatus, setDumaSubmitStatus] = useState({});
  const [socialSaveStatus, setSocialSaveStatus] = useState({ instagram: "idle", tiktok: "idle", facebook: "idle" });
  const [anyVideoPushed, setAnyVideoPushed] = useState(false);
  const [socialConnected, setSocialConnected] = useState({ instagram: false, tiktok: false, facebook: false });
  const [socialShareStatus, setSocialShareStatus] = useState({ Instagram: 'idle', TikTok: 'idle', Facebook: 'idle' });

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
      if (data.socialLinks) setSocialLinks(prev => ({ ...prev, ...data.socialLinks }));
      if (data.perspective) {
        setPerspective(prev => {
          const updated = { ...prev };
          for (const key in data.perspective) {
            if (updated[key]) updated[key] = { ...updated[key], ...data.perspective[key] };
          }
          return updated;
        });
      }
      if (data.perspective && Object.keys(data.perspective).length > 0) {
        setAnyVideoPushed(true);
      }
    }).catch(() => {});
  }, [authToken, onAvatarUpdate]);

  useEffect(() => {
    if (!authToken) return;
    fetch(`${BACKEND_URL}/api/social/status`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setSocialConnected(prev => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, [authToken]);

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

  const handleAvatarUpload = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    // Reset input so the same file can be re-selected if needed
    e.target.value = "";
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Please upload a JPG or PNG image only.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB.');
      return;
    }
    // Show local preview immediately
    const previewUrl = URL.createObjectURL(file);
    blobAvatarUrlRef.current = previewUrl;
    setAvatarUrl(previewUrl);
    setAvatarSaveStatus("saving"); // triggers "Uploading…" overlay

    if (!authToken) {
      // Not logged in — keep local preview only
      setAvatarSaveStatus("idle");
      return;
    }

    try {
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
        // Replace blob with permanent cloud URL before revoking to prevent ERR_FILE_NOT_FOUND
        setAvatarUrl(cloudUrl);
        if (onAvatarUpdate) onAvatarUpdate(cloudUrl);
        // Cleanup the temporary blob URL to prevent memory leaks
        if (blobAvatarUrlRef.current) {
          URL.revokeObjectURL(blobAvatarUrlRef.current);
          blobAvatarUrlRef.current = null;
        }
        // Persist the new avatar URL to the user's profile record
        const profileRes = await fetch(`${BACKEND_URL}/api/profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ avatar: cloudUrl })
        });
        if (!profileRes.ok) {
          setAvatarSaveStatus("error");
          setTimeout(() => setAvatarSaveStatus("idle"), 3000);
          return;
        }
        setAvatarSaveStatus("saved");
        if (!hadExistingAvatar && onAddPoints) {
          onAddPoints(25);
          setHadExistingAvatar(true);
        }
        setTimeout(() => setAvatarSaveStatus("idle"), 3000);
      } else {
        setAvatarSaveStatus("error");
        setTimeout(() => setAvatarSaveStatus("idle"), 3000);
      }
    } catch (err) {
      setAvatarSaveStatus("error");
      setTimeout(() => setAvatarSaveStatus("idle"), 3000);
    }
  };

  const handleVideoUpload = (boxKey, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!['video/mp4', 'video/quicktime'].includes(file.type)) {
        alert('Please upload an MP4 or MOV video.');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        alert('Video must be smaller than 100MB.');
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      const videoEl = document.createElement('video');
      videoEl.preload = 'metadata';
      videoEl.onloadedmetadata = () => {
        if (videoEl.duration > 60) {
          URL.revokeObjectURL(objectUrl);
          alert('Video must be 60 seconds or less.');
          return;
        }
        setPerspective(prev => {
          if (prev[boxKey].videoUrl && prev[boxKey].videoUrl.startsWith('blob:')) {
            URL.revokeObjectURL(prev[boxKey].videoUrl);
          }
          return { ...prev, [boxKey]: { ...prev[boxKey], videoUrl: objectUrl, videoFile: file } };
        });
        setVideoSaveStatus(prev => ({ ...prev, [boxKey]: "idle" }));
      };
      videoEl.src = objectUrl;
    }
  };

  const handleSaveVideo = async (boxKey) => {
    if (!perspective[boxKey].videoFile || !authToken) return;
    setVideoSaveStatus(prev => ({ ...prev, [boxKey]: "saving" }));
    try {
      const formData = new FormData();
      formData.append("file", perspective[boxKey].videoFile);
      formData.append("type", "video");
      formData.append("boxKey", boxKey);
      const uploadRes = await fetch(`${BACKEND_URL}/api/media/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData
      });
      const data = uploadRes.ok ? await uploadRes.json() : null;
      // Multi-key safety check for varying cloud production storage signatures
      const savedVideoUrl = data?.storageUrl || data?.secure_url || data?.url || perspective[boxKey].videoUrl;
      const updatedPerspective = {
        ...perspective,
        [boxKey]: { ...perspective[boxKey], videoUrl: savedVideoUrl }
      };
      const videoPerspectives = {};
      for (const key in updatedPerspective) {
        if (updatedPerspective[key].videoUrl) {
          videoPerspectives[key] = {
            videoUrl: updatedPerspective[key].videoUrl,
            description: updatedPerspective[key].description
          };
        }
      }
      const profileRes = await fetch(`${BACKEND_URL}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ perspective: videoPerspectives })
      });
      if (profileRes.ok) {
        setPerspective(updatedPerspective);
        if (onAddPoints) onAddPoints(100);
        setAnyVideoPushed(true);
        setVideoSaveStatus(prev => ({ ...prev, [boxKey]: "saved" }));
      } else {
        setVideoSaveStatus(prev => ({ ...prev, [boxKey]: "error" }));
        setTimeout(() => setVideoSaveStatus(prev => ({ ...prev, [boxKey]: "idle" })), 3000);
      }
    } catch {
      setVideoSaveStatus(prev => ({ ...prev, [boxKey]: "error" }));
      setTimeout(() => setVideoSaveStatus(prev => ({ ...prev, [boxKey]: "idle" })), 3000);
    }
  };

  const handleSendToDuma = async (boxKey) => {
    if (!perspective[boxKey].videoUrl) {
      alert('Please upload a video first before sending to the Duma.');
      return;
    }
    setDumaSubmitStatus(prev => ({ ...prev, [boxKey]: "Submitting..." }));
    try {
      const response = await fetch(`${BACKEND_URL}/api/duma/culture/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          boxKey,
          videoUrl: perspective[boxKey].videoUrl,
          description: perspective[boxKey].description,
          socialLinks
        })
      });
      if (response.ok) {
        setDumaSubmitStatus(prev => ({ ...prev, [boxKey]: "Sent to Duma!" }));
        setAnyVideoPushed(true);
        if (onAddPoints) onAddPoints(100);
        setTimeout(() => setDumaSubmitStatus(prev => ({ ...prev, [boxKey]: "" })), 3000);
      } else {
        setDumaSubmitStatus(prev => ({ ...prev, [boxKey]: "Submission failed" }));
        setTimeout(() => setDumaSubmitStatus(prev => ({ ...prev, [boxKey]: "" })), 3000);
      }
    } catch (err) {
      setDumaSubmitStatus(prev => ({ ...prev, [boxKey]: "Error submitting" }));
      setTimeout(() => setDumaSubmitStatus(prev => ({ ...prev, [boxKey]: "" })), 3000);
    }
  };

  const handleDescriptionChange = (boxKey, text) => {
    setPerspective(prev => ({
      ...prev,
      [boxKey]: { ...prev[boxKey], description: text }
    }));
  };

  const boxes = [
    { key: "box1", label: "Introduce yourself", icon: "\u{1F3AC}" },
    { key: "box2", label: "Tell us what you do", icon: "\u{1F3AC}" },
    { key: "box3", label: "What are your thoughts on what makes someone beautiful?", icon: "\u{1F3AC}" },
    { key: "box4", label: "Ideas about anything else", icon: "\u{1F3AC}" }
  ];

  const handleSaveProfile = async () => {
    if (!authToken) return;
    setSaveStatus("Saving...");
    try {
      // Build video perspectives payload
      const videoPerspectives = {};
      for (const boxKey in perspective) {
        if (perspective[boxKey].videoUrl) {
          videoPerspectives[boxKey] = {
            videoUrl: perspective[boxKey].videoUrl,
            description: perspective[boxKey].description
          };
        }
      }
      
      const response = await fetch(`${BACKEND_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          perspective: videoPerspectives, 
          avatar: avatarUrl
        })
      });
      if (response.ok) {
        setSaveStatus("Culture saved successfully!");
        setTimeout(() => setSaveStatus(""), 3000);
      } else {
        setSaveStatus("Failed to save profile");
      }
    } catch (err) {
      setSaveStatus("Server error");
    }
  };

  const displayRankScore = backendRankScore || 1;
  const displayRankTitle = backendRankTitle || 'Comrade';
  const pointsToNextRank = getPointsToNextRank(displayRankScore, displayRankTitle);
  const nextRankTitle = getNextRankTitle(displayRankTitle);
  const { currentMin, nextMin, progressPercent } = getRankProgress(displayRankScore, displayRankTitle);
  const getAuthUserId = () => {
    if (!authToken) return "";
    try {
      const payload = authToken.split(".")[1];
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")));
      return decoded.userId || "";
    } catch {
      return "";
    }
  };

  const handleSocialConnect = (platform) => {
    const userId = getAuthUserId();
    if (!userId) {
      alert("Please log in again before connecting social accounts.");
      return;
    }
    // Instagram Graph API auth runs through Meta/Facebook Login for Business
    const targetPlatform = platform === 'instagram' ? 'facebook' : platform;
    window.location.href = `${BACKEND_URL}/api/auth/${targetPlatform}`;
  };

  const handleSocialShare = async (platform, socialUrl) => {
    if (!socialUrl) {
      alert(`Connect your ${platform} account first in Social Links above.`);
      return;
    }

    // Fix 1: Use cultureMediaPreview for the active file upload structure
    const realVideoUrl = cultureMediaPreview || "";

    if (!realVideoUrl) {
      alert('No active video URL found to share. Please save a perspective video first.');
      return;
    }

    setSocialShareStatus(prev => ({ ...prev, [platform]: 'sharing' }));

    try {
      const res = await fetch(`${BACKEND_URL}/api/profile/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          videoUrl: realVideoUrl,
          platforms: [platform.toLowerCase()],
          caption: ''
        })
      });
      const data = await res.json();
      if (res.ok && data.results?.[platform.toLowerCase()]?.success) {
        setSocialShareStatus(prev => ({ ...prev, [platform]: 'shared' }));
        setTimeout(() => setSocialShareStatus(prev => ({ ...prev, [platform]: 'idle' })), 3000);
      } else {
        const err = data.results?.[platform.toLowerCase()]?.error || 'Share failed';
        if (err.includes('not connected') || err.includes('token expired')) {
          setSocialShareStatus(prev => ({ ...prev, [platform]: 'reconnect' }));
        } else {
          setSocialShareStatus(prev => ({ ...prev, [platform]: 'error' }));
        }
        setTimeout(() => setSocialShareStatus(prev => ({ ...prev, [platform]: 'idle' })), 5000);
      }
    } catch (e) {
      setSocialShareStatus(prev => ({ ...prev, [platform]: 'error' }));
      setTimeout(() => setSocialShareStatus(prev => ({ ...prev, [platform]: 'idle' })), 5000);
    }
  };

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* HEADER SECTION */}
      <div style={{ marginBottom: '50px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: '700' }}>Welcome</h1>
        {displayRankTitle && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <RankBadge rankTitle={displayRankTitle} />
              <span style={{ fontSize: '13px', color: '#666' }}>{displayRankScore.toLocaleString()} points</span>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '11px', color: '#666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                <span>Rank progress</span>
                <span>{progressPercent.toFixed(0)}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#ececec', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  aria-label="Rank progress"
                  role="progressbar"
                  aria-valuemin={currentMin}
                  aria-valuemax={nextMin}
                  aria-valuenow={displayRankScore}
                  style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #222 0%, #d4af37 100%)' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '11px', color: '#888', marginTop: '6px' }}>
                <span>{currentMin.toLocaleString()} pts</span>
                <span>{nextRankTitle ? `${nextMin.toLocaleString()} pts` : 'Top rank reached'}</span>
              </div>
            </div>
            {nextRankTitle && (
              <div style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                <strong>{pointsToNextRank.toLocaleString()}</strong> points to your next rank ({nextRankTitle})
              </div>
            )}
            {tokens > 0 && (
              <div style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                🪙 <strong>{tokens}</strong> {tokens === 1 ? 'token' : 'tokens'} earned from rank-ups
              </div>
            )}
          </div>
        )}
      </div>

      {/* AVATAR UPLOAD SECTION */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '24px', fontWeight: '600' }}>Your Profile Avatar</h2>
        <div style={styles.uploadBox}>
          <div style={{ textAlign: 'center' }}>
            {avatarUrl ? (
              <div style={{ marginBottom: '16px', position: 'relative', display: 'inline-block' }}>
                <img
                  src={avatarUrl}
                  alt="Avatar Preview"
                  title="Click to change avatar"
                  role="button"
                  tabIndex={avatarSaveStatus === "saving" ? -1 : 0}
                  onClick={() => avatarSaveStatus !== "saving" && avatarInputRef.current && avatarInputRef.current.click()}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && avatarSaveStatus !== "saving" && avatarInputRef.current && avatarInputRef.current.click()}
                  style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', marginBottom: '12px', cursor: avatarSaveStatus === "saving" ? 'default' : 'pointer', opacity: avatarSaveStatus === "saving" ? 0.6 : 1 }}
                />
                {avatarSaveStatus === "saving" && (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '150px', height: '150px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>Uploading…</span>
                  </div>
                )}
                {avatarSaveStatus !== "saving" && (
                  <p style={{ fontSize: '13px', color: '#666' }}>
                    {avatarSaveStatus === "saved" ? "✓ Uploaded" : avatarSaveStatus === "error" ? "Upload failed — click to retry" : "Click avatar to change"}
                  </p>
                )}
              </div>
            ) : (
              <div
                role="button"
                tabIndex={avatarSaveStatus === "saving" ? -1 : 0}
                style={{ padding: '30px', textAlign: 'center', cursor: avatarSaveStatus === "saving" ? 'default' : 'pointer' }}
                onClick={() => avatarSaveStatus !== "saving" && avatarInputRef.current && avatarInputRef.current.click()}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && avatarSaveStatus !== "saving" && avatarInputRef.current && avatarInputRef.current.click()}>
                <span style={{ fontSize: '48px', marginBottom: '12px', display: 'block' }}>{avatarSaveStatus === "saving" ? "⏳" : "\u{1F464}"}</span>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                  {avatarSaveStatus === "saving" ? "Uploading…" : "No avatar uploaded yet — click to upload"}
                </p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <label style={{ cursor: 'pointer', display: 'inline-block' }}>
                <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                <button
                  type="button"
                  disabled={avatarSaveStatus === "saving"}
                  style={{ ...styles.authButton, width: '200px', opacity: avatarSaveStatus === "saving" ? 0.6 : 1, cursor: avatarSaveStatus === "saving" ? 'not-allowed' : 'pointer' }}
                  onClick={() => avatarSaveStatus !== "saving" && avatarInputRef.current && avatarInputRef.current.click()}>
                  {avatarSaveStatus === "saving" ? "Uploading…" : "Upload Avatar (JPG/PNG, max 5MB)"}
                </button>
              </label>

            </div>
          </div>
        </div>
      </section>

      {/* SHARE YOUR PERSPECTIVE SECTION - UPGRADED WITH MEDIA */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '8px', fontWeight: '600' }}>Share Your Perspective</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          Contribute to our Culture section by answering one of these prompts with text, image views, or recorded clips. Submit your response to the Duma for community voting and earn <strong>+100 points!</strong>
        </p>

        {cultureSubmitStatus === "saved" ? (
          <div style={{ ...styles.dumaCard, textAlign: 'center', padding: '50px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>&#x2705;</div>
            <h2 style={{ marginBottom: '10px' }}>Perspective Shared!</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Your response has been processed and safely pushed to The Majorities' Culture section inside the Duma for community voting.
            </p>
            <p style={{ fontSize: '12px', color: '#888' }}>You earned 100 points! Redirecting to Duma…</p>
          </div>
        ) : (
          <>
            {cultureErrorMsg && <div style={styles.errorMsg}>{cultureErrorMsg}</div>}
            <form style={{ ...styles.dumaCard, position: 'relative' }} onSubmit={handleCultureSubmit}>

              {/* LOADING OVERLAY */}
              {cultureSubmitStatus === "uploading" && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '32px', marginBottom: '10px' }}>&#x23F3;</span>
                  <span style={{ color: '#222', fontSize: '16px', fontWeight: '700' }}>Publishing Your Perspective...</span>
                  <span style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>Uploading media files to master server storage logs</span>
                </div>
              )}

              <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Choose a Prompt</h3>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ padding: '20px', border: '2px solid #222', borderRadius: '12px', backgroundColor: '#f9f9f9', marginBottom: '14px' }}>
                  <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: '#222', fontWeight: 600 }}>
                    {perspectivePrompts[activePromptIndex]?.text}
                  </p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  <button type="button" onClick={() => rotatePrompt(-1)} style={{ ...styles.authButton, width: 'auto', padding: '10px 16px' }}>Previous</button>
                  <button type="button" onClick={() => rotatePrompt("random")} style={{ ...styles.authButton, width: 'auto', padding: '10px 16px', backgroundColor: '#666' }}>Shuffle Prompt</button>
                  <button type="button" onClick={() => rotatePrompt(1)} style={{ ...styles.authButton, width: 'auto', padding: '10px 16px' }}>Next</button>
                  <span style={{ fontSize: '12px', color: '#666' }}>Prompt {activePromptIndex + 1} of {perspectivePrompts.length}</span>
                </div>
              </div>

              <h3 style={{ marginTop: '24px', marginBottom: '8px' }}>Attach Photo or Video Perspective</h3>
              <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px 0' }}>Show your view or record a custom speech clip context up to 60 seconds.</p>

              <input type="file" accept="image/*,video/*" onChange={handleCultureMediaChange} style={{ ...styles.input, padding: '8px' }} />

              {cultureMediaPreview && (
                <div style={{ marginTop: '15px', marginBottom: '15px', textAlign: 'center', background: '#fafafa', padding: '10px', borderRadius: '8px', border: '1px solid #eee' }}>
                  {cultureMediaType === "image" ? (
                    <img src={cultureMediaPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px' }} />
                  ) : (
                    <video src={cultureMediaPreview} style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px' }} controls />
                  )}
                </div>
              )}

              <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>Your Response</h3>
              <textarea required placeholder="Type your context or response thoughts here..." style={{ ...styles.input, height: '120px' }} value={cultureResponse} onChange={(e) => setCultureResponse(e.target.value)} />

              <button type="submit" style={{ ...styles.authButton, marginTop: '15px' }}>
                Submit Perspective to Duma (+100 points)
              </button>
            </form>
          </>
        )}
      </section>

      {/* SOCIAL LINKS SECTION */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '24px', fontWeight: '600' }}>Connect Your Social Profiles</h2>
        <div style={styles.dumaCard}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {/* CONNECT YOUR SOCIAL PROFILES LOOhP */}
            {SOCIAL_FIELDS.map(social => (
              <SocialInputRow
                key={social.key}
                socialKey={social.key}
                label={social.label}
                placeholder={social.placeholder}
                initialValue={socialLinks[social.key]}
                saveStatus={socialSaveStatus[social.key]}
                onChangeGlobal={handleSocialChange}
                onSave={handleSaveSocialLink} />
            ))}
          </div>
        </div>
      </section>

      {/* OAUTH CONNECT SECTION */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '24px', fontWeight: '600' }}>Share to Your Socials</h2>
        <div style={{ ...styles.dumaCard, textAlign: 'center', padding: '30px' }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>Push your latest Perspective video to your connected social accounts</p>
          {!anyVideoPushed && (
            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '16px', fontStyle: 'italic' }}>Save & publish a Culture video above to unlock sharing.</p>
          )}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              disabled={!anyVideoPushed}
              onClick={() => handleSocialShare('Instagram', socialLinks.instagram)}
              style={{ ...styles.socialButton, maxWidth: '180px', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff', border: 'none', opacity: anyVideoPushed ? 1 : 0.4, cursor: anyVideoPushed ? 'pointer' : 'not-allowed' }}>
              {socialShareStatus.Instagram === 'sharing' ? 'Sharing...' : socialShareStatus.Instagram === 'shared' ? '✓ Shared!' : socialShareStatus.Instagram === 'error' ? 'Error - Retry' : socialShareStatus.Instagram === 'reconnect' ? 'Reconnect Instagram' : '📷 Share to Instagram'}
            </button>
            <button
              disabled={!anyVideoPushed}
              onClick={() => handleSocialShare('TikTok', socialLinks.tiktok)}
              style={{ ...styles.socialButton, maxWidth: '180px', background: '#000', color: '#fff', border: 'none', opacity: anyVideoPushed ? 1 : 0.4, cursor: anyVideoPushed ? 'pointer' : 'not-allowed' }}>
              {socialShareStatus.TikTok === 'sharing' ? 'Sharing...' : socialShareStatus.TikTok === 'shared' ? '✓ Shared!' : socialShareStatus.TikTok === 'error' ? 'Error - Retry' : socialShareStatus.TikTok === 'reconnect' ? 'Reconnect TikTok' : '🎵 Share to TikTok'}
            </button>
            <button
              disabled={!anyVideoPushed}
              onClick={() => handleSocialShare('Facebook', socialLinks.facebook)}
              style={{ ...styles.socialButton, maxWidth: '180px', background: '#1877F2', color: '#fff', border: 'none', opacity: anyVideoPushed ? 1 : 0.4, cursor: anyVideoPushed ? 'pointer' : 'not-allowed' }}>
              {socialShareStatus.Facebook === 'sharing' ? 'Sharing...' : socialShareStatus.Facebook === 'shared' ? '✓ Shared!' : socialShareStatus.Facebook === 'error' ? 'Error - Retry' : socialShareStatus.Facebook === 'reconnect' ? 'Reconnect Facebook' : '📘 Share to Facebook'}
            </button>
          </div>
          <p style={{ fontSize: '11px', color: '#aaa', marginTop: '12px' }}>Connect accounts using the OAuth buttons below to unlock sharing.</p>

          {/* Fix 2: Added missing Facebook OAuth connect button to lower shelf */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '18px' }}>
            <button
              type="button"
              onClick={() => handleSocialConnect('instagram')}
              style={{ ...styles.socialButton, maxWidth: '190px', background: socialConnected.instagram ? '#27ae60' : 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff', border: 'none' }}>
              {socialConnected.instagram ? '✓ Instagram Connected' : 'Connect Instagram'}
            </button>
            <button
              type="button"
              onClick={() => handleSocialConnect('tiktok')}
              style={{ ...styles.socialButton, maxWidth: '190px', background: socialConnected.tiktok ? '#27ae60' : '#000', color: '#fff', border: 'none' }}>
              {socialConnected.tiktok ? '✓ TikTok Connected' : 'Connect TikTok'}
            </button>
            <button
              type="button"
              onClick={() => handleSocialConnect('facebook')}
              style={{ ...styles.socialButton, maxWidth: '190px', background: socialConnected.facebook ? '#27ae60' : '#1877F2', color: '#fff', border: 'none' }}>
              {socialConnected.facebook ? '✓ Facebook Connected' : 'Connect Facebook'}
            </button>
          </div>
        </div>
      </section>

      

      {/* SAVED FORMULAS SECTION */}
      <section>
        <h2 style={{ fontSize: '20px', marginBottom: '24px', fontWeight: '600' }}>Your Saved Formulas</h2>
        {savedSets.length === 0 ? (
          <div style={styles.dumaCard}>
            <p style={{ color: '#888', marginBottom: '12px' }}>You haven't saved any custom sets yet. Head home to build your first one!</p>
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

// --- FORGOT PASSWORD PAGE ---
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={styles.authContainer}>
        <div style={{ ...styles.authCard, textAlign: 'center' }}>
          <h2>Forgot Password?</h2>
          <div style={{ fontSize: '48px', margin: '20px 0' }}></div>
          <p style={{ color: '#555', lineHeight: '1.6' }}>
            If that email is registered, we've sent a reset link.<br />
            Check your inbox (and spam folder).
          </p>
          <p style={{ color: '#888', fontSize: '13px', marginTop: '10px' }}>
            The email may have landed in your <strong>spam or junk folder</strong> - please check there if you don't see it in your inbox.
          </p>
          <Link to="/login">
            <button style={{ ...styles.authButton, marginTop: '20px' }}>Back to Sign In</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.authContainer}>
      <div style={styles.authCard}>
        <h2>Forgot Password?</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          Enter your email and we'll send you a link to reset your password.
        </p>
        <input
          type="email"
          placeholder="Enter your email"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p style={{ color: 'red', fontSize: '13px', marginTop: '8px' }}>{error}</p>}
        <button style={styles.authButton} onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
        <Link to="/login" style={{ display: 'block', marginTop: '15px', fontSize: '13px', color: '#666', textDecoration: 'none' }}>
          Back to Sign In
        </Link>
      </div>
    </div>
  );
};

// --- RESET PASSWORD PAGE ---
const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { token } = useParams();

  const handleSubmit = async () => {
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={styles.authContainer}>
        <div style={{ ...styles.authCard, textAlign: 'center' }}>
          <h2>Password Reset!</h2>
          <div style={{ fontSize: '48px', margin: '20px 0' }}></div>
          <p style={{ color: '#555' }}>Your password has been updated successfully.</p>
          <p style={{ color: '#888', fontSize: '13px' }}>Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.authContainer}>
      <div style={styles.authCard}>
        <h2>Reset Password</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Enter your new password below.</p>
        <input
          type="password"
          placeholder="New password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          style={styles.input}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {error && <p style={{ color: 'red', fontSize: '13px', marginTop: '8px' }}>{error}</p>}
        <button style={styles.authButton} onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
};

// --- AUTH COMPONENTS ---
const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socialError, setSocialError] = useState("");

  const handleLogin = async () => {
    setIsLoading(true);
    setSocialError("");
    try {
      const response = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) { onLogin(email, data.token, true, data.rank_title, data.rank_score); navigate("/profile"); }
      else { alert(data.error || "Invalid login"); }
    } catch (err) { alert("Server is waking up. Try again in 30s."); }
    finally { setIsLoading(false); }
  };

  const handleGoogleLogin = () => {
    setSocialError("");
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) { setSocialError("Google login is not configured."); return; }
    const redirectUri = window.location.origin + "/auth/google/callback";
    const scope = "openid email profile";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&prompt=select_account`;
    window.location.href = authUrl;
  };

  const handleInstagramLogin = () => {
    setSocialError("");
    const appId = process.env.REACT_APP_FACEBOOK_APP_ID;
    if (!appId) { setSocialError("Instagram login is not configured yet."); return; }
    const redirectUri = window.location.origin + "/auth/instagram/callback";
    const scope = "email,public_profile";
    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=token`;
    window.location.href = authUrl;
  };

  const handleTikTokLogin = () => {
    setSocialError("");
  };

  return (
    <div style={styles.authContainer}>
      <div style={{ ...styles.authCard, maxWidth: '420px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px', letterSpacing: '-0.5px' }}>The Majorities</h1>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>Sign in to your account</p>
        {socialError && <div style={{ background: '#fff0f0', color: '#c00', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', textAlign: 'left' }}>{socialError}</div>}
        <button onClick={handleGoogleLogin} style={{ ...styles.socialButton, backgroundColor: '#fff', color: '#222', border: '1px solid #ddd' }}>
          <svg style={{ width: '18px', height: '18px', marginRight: '10px' }} viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>
        <button onClick={handleInstagramLogin} style={{ ...styles.socialButton, background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff', border: 'none' }}>
          <svg style={{ width: '18px', height: '18px', marginRight: '10px', fill: '#fff' }} viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
          Continue with Instagram
        </button>
        <button onClick={handleTikTokLogin} style={{ ...styles.socialButton, backgroundColor: '#000', color: '#fff', border: 'none' }}>
          <svg style={{ width: '18px', height: '18px', marginRight: '10px', fill: '#fff' }} viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.42a8.21 8.21 0 0 0 4.76 1.52V6.5a4.83 4.83 0 0 1-1-.19z"/></svg>
          Continue with TikTok
        </button>
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
          <span style={{ padding: '0 12px', fontSize: '12px', color: '#999' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
        </div>
        <input type="email" placeholder="Email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
        <button style={styles.authButton} onClick={handleLogin}>{isLoading ? '...' : 'Login'}</button>
        <Link to="/forgot-password" style={{ display: 'block', marginTop: '12px', fontSize: '13px', color: '#666', textDecoration: 'none', textAlign: 'center' }}>
          Forgot password?
        </Link>
      </div>
    </div>
  );
};

const OAuthCallbackPage = ({ onLogin, provider }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("Authenticating...");

  useEffect(() => {
    const hash = location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const queryParams = new URLSearchParams(location.search);
    const accessToken = hashParams.get("access_token");
    const code = queryParams.get("code");
    const error = queryParams.get("error") || hashParams.get("error");

    if (error) { setStatus(provider + " authentication was cancelled."); setTimeout(() => navigate("/login"), 2500); return; }
    if (provider === "google" && !code) { setStatus("Authentication failed. No authorization code received."); setTimeout(() => navigate("/login"), 2500); return; }
    if (provider !== "google" && !accessToken) { setStatus("Authentication failed. No token received."); setTimeout(() => navigate("/login"), 2500); return; }

    const endpoint = provider === "instagram" ? "/api/auth/instagram" : "/api/auth/google";
    const body = provider === "google"
      ? { code, redirectUri: window.location.origin + "/auth/google/callback" }
      : { accessToken };

    fetch(BACKEND_URL + endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (ok && data.token) { onLogin(data.email, data.token, true, data.rank_title, data.rank_score); navigate("/profile"); }
        else { setStatus(data.error || "Account not linked. Please try again."); setTimeout(() => navigate("/login"), 3000); }
      })
      .catch(() => { setStatus("Server error. Please try again."); setTimeout(() => navigate("/login"), 3000); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={styles.authContainer}>
      <div style={{ ...styles.authCard, textAlign: 'center' }}>
        <h2 style={{ marginBottom: '12px' }}>{provider.charAt(0).toUpperCase() + provider.slice(1)}</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>{status}</p>
      </div>
    </div>
  );
};

const SignupPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const handleSignup = async () => {
    if (password !== confirmPassword) return alert("Passwords do not match");
    try {
      const response = await fetch(`${BACKEND_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) { alert("Success! Log in now."); navigate("/login"); }
    } catch (err) { alert("Server error."); }
  };
  return (
    <div style={styles.authContainer}><div style={styles.authCard}>
      <h2>Sign Up</h2>
      <input type="email" placeholder="Email" style={styles.input} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" style={styles.input} onChange={(e) => setPassword(e.target.value)} />
      <input type="password" placeholder="Confirm" style={styles.input} onChange={(e) => setConfirmPassword(e.target.value)} />
      <button style={styles.authButton} onClick={handleSignup}>Create Account</button>
    </div></div>
  );
};

// --- LANDING PAGE ---
function LandingPage({ saveSetToProfile, onAddPoints, savedSets }) {
  const [selection, setSelection] = useState([]);
  const [focusedItem, setFocusedItem] = useState(null);
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

  const handleSelect = (item) => {
    setFocusedItem(item);
    setSelection(prev => {
      const alreadySelected = prev.some(i => i.name === item.name);
      if (alreadySelected) return prev.filter(i => i.name !== item.name);
      if (prev.length >= 6) return prev;
      return [...prev, item];
    });
  };
  
  const selectedItems = selection;
  const isSetComplete = selectedItems.length === 6;
  const setTotals = calculateSetTotals(selectedItems);
  const subscriptionSavings = Math.max(0, setTotals.oneTime - setTotals.subscription);
  
  const handleOneTimeCheckout = () => {
    if (!isSetComplete) return;
    submitShopifyCheckout(selectedItems, "one-time");
  };

  const handleSubscriptionCheckout = () => {
    if (!isSetComplete) return;
    submitShopifyCheckout(selectedItems, "subscription");
  };
  
  const renderRow = (label, category) => (
    <div style={styles.rowSection}>
      <h3 style={styles.rowLabel}>{label}</h3>
      <div style={styles.scrollRow}>
        {productsData[category].map(item => {
          const isSelected = selection.some(i => i.name === item.name);
          const { pricing } = getProductCommerceConfig(item.name);
          return (
            <div key={item.name} onClick={() => handleSelect(item)} style={{ ...styles.card, border: isSelected ? "2px solid #222" : "1px solid #eee" }}>
              <div style={styles.imagePlaceholder}>{item.name[0]}</div>
              <div style={styles.itemName}>{item.name}</div>
              <div style={{ fontSize: '11px', color: '#555', marginTop: '8px', lineHeight: '1.5' }}>
                <div>One-time {formatCurrency(pricing.oneTime)}</div>
                <div>Subscribe {formatCurrency(pricing.subscription)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
  
  return (
    <div style={{ ...styles.layout, flexDirection: isMobile ? 'column' : 'row', padding: isMobile ? '20px 16px' : '20px 60px', overflowX: isMobile ? 'hidden' : 'visible', boxSizing: 'border-box' }}>
      <div style={{ ...styles.left, width: isMobile ? '100%' : '70%', paddingRight: isMobile ? 0 : '40px', minWidth: 0, overflowX: 'hidden' }}>
        {renderRow("Pick Shampoos", "shampoos")}
        {renderRow("Pick Conditioners", "conditioners")}
        {renderRow("Pick Oils", "oils")}
        {renderRow("Pick Face Scrubs", "faceScrubs")}
        {renderRow("Pick Toners", "toners")}
        {renderRow("Pick Creams", "faceCreams")}
      </div>
      <aside style={{ ...styles.right, width: isMobile ? '100%' : '30%', position: isMobile ? 'static' : 'sticky', top: isMobile ? 'auto' : '20px', boxSizing: 'border-box', height: 'auto', maxHeight: 'none' }}>
        <div style={{ minHeight: '100px', marginBottom: '15px' }}>
          {focusedItem ? (
            <div>
              <h3>{focusedItem.name}</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#333' }}>
                  One-time {formatCurrency(getProductCommerceConfig(focusedItem.name).pricing.oneTime)}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#2d6a4f' }}>
                  Subscribe {formatCurrency(getProductCommerceConfig(focusedItem.name).pricing.subscription)}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                {focusedItem.desc}
              </div>
            </div>
          ) : <p style={{color: '#888'}}>Select a product</p>}
        </div>
        <div style={styles.summaryContainer}>
          <h4 style={{ fontSize: '14px', borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0 }}>Your Custom Set ({selectedItems.length}/6)</h4>
          <div style={{ margin: '10px 0' }}>
            {(() => {
              const counts = {};
              selectedItems.forEach(item => { counts[item.name] = (counts[item.name] || 0) + 1; });
              return Object.entries(counts).map(([name, count]) => (
                <p key={name} style={{ fontSize: '11px', margin: '4px 0' }}>
                  {name}{count > 1 ? ` x${count}` : ''} · {formatCurrency(getProductCommerceConfig(name).pricing.oneTime)} / {formatCurrency(getProductCommerceConfig(name).pricing.subscription)}
                </p>
              ));
            })()}
          </div>
          {isSetComplete ? (
            <div style={{ borderTop: '2px solid #222', paddingTop: '15px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px', lineHeight: '1.6' }}>
                <div>One-time total: <strong>{formatCurrency(setTotals.oneTime)}</strong></div>
                <div>Subscription total: <strong>{formatCurrency(setTotals.subscription)} / month</strong></div>
                <div>You save <strong>{formatCurrency(subscriptionSavings)}</strong> on each monthly set.</div>
              </div>
              {/* Delivery promise callout */}
              <div style={{ backgroundColor: '#f4f9f4', border: '1px solid #c2e1c2', padding: '12px', borderRadius: '8px', marginBottom: '14px', textAlign: 'left' }}>
                <span style={{ fontSize: '13px', color: '#1e4620', fontWeight: '700', display: 'block' }}>
                  🚚 Fast US Fulfillment via ShipBob
                </span>
                <span style={{ fontSize: '11px', color: '#2e6f32', display: 'block', marginTop: '3px' }}>
                  Estimated Delivery: <strong>{
                    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                  } - {
                    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                  }</strong> (+ Shipping & Handling)
                </span>
              </div>
              <button style={styles.checkoutBtn} onClick={handleOneTimeCheckout}>1 time Checkout ({formatCurrency(setTotals.oneTime)})</button>
              <button style={{ ...styles.checkoutBtn, background: '#222', color: '#fff' }} onClick={handleSubscriptionCheckout}>Monthly Subscription Checkout ({formatCurrency(setTotals.subscription)} / month)</button>
            </div>
          ) : <p style={{ fontSize: '12px', color: '#888' }}>Select 6 products to checkout</p>}
        </div>
      </aside>
    </div>
  );
}

// --- RECOMMEND PAGE ---
const RecommendPage = ({ addDumaItem, userEmail, rankTitle, rankScore, authToken, userAvatar }) => {
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

    // Validation
    if (!formData.name || !formData.company || !formData.productType || !formData.websiteLink || !formData.whyRecommend) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (formData.whyRecommend.split(' ').length < 15) {
      setErrorMsg("Justification must be at least 2-3 sentences (15+ words).");
      return;
    }

    // Check for valid URL
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
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('company', formData.company);
      submitData.append('productType', formData.productType);
      submitData.append('websiteLink', formData.websiteLink);
      submitData.append('whyRecommend', formData.whyRecommend);
      if (formData.photo) submitData.append('photo', formData.photo);
      if (formData.video) submitData.append('video', formData.video);

      const res = await fetch(`${BACKEND_URL}/api/duma/recommend`, { method: 'POST', headers: { Authorization: `Bearer ${authToken}` }, body: submitData });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || 'Submission failed'); setIsLoading(false); return; }

      addDumaItem({ ...formData, id: Date.now(), type: "Product Recommendation", submittedBy: userEmail || "anonymous", submitterRank: rankTitle || 'Comrade', section: "Commerce" });
      setSubmitted(true);
    } catch (err) {
      addDumaItem({ ...formData, id: Date.now(), type: "Product Recommendation", submittedBy: userEmail || "anonymous", submitterRank: rankTitle || 'Comrade', section: "Commerce" });
      setSubmitted(true);
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
            <button style={styles.authButton} onClick={() => navigate("/duma")}>View the Duma</button>
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
          <input required placeholder="Product Name (e.g., 'Rosemary Mint Scalp & Hair Strengthening Oil') *" style={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input required placeholder="Company Name (legal brand name, e.g., 'Mielle Organics') *" style={styles.input} value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '15px', textTransform: 'uppercase', color: '#222' }}>2. Categorization & Sourcing</h3>
          <input required placeholder="Product Type (e.g., 'Moisturizer', 'Regrowth', 'Shampoo', 'Oil') *" style={styles.input} value={formData.productType} onChange={e => setFormData({...formData, productType: e.target.value})} />
          <input required type="url" placeholder="Website Link (direct product page URL, not retailer links like Amazon unless exclusive) *" style={styles.input} value={formData.websiteLink} onChange={e => setFormData({...formData, websiteLink: e.target.value})} />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '15px', textTransform: 'uppercase', color: '#222' }}>3. Justification & Evidence</h3>
          <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Why Recommend? (2-3 sentences, focus on results) *</label>
          <textarea required placeholder="Good: 'Highly effective for type 4C hair; significantly reduced breakage within 3 weeks of consistent use without heavy buildup.' *" style={{ ...styles.input, height: '100px' }} value={formData.whyRecommend} onChange={e => setFormData({...formData, whyRecommend: e.target.value})} />

          <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginTop: '15px', marginBottom: '8px' }}>Upload Product Photo (high-resolution, label must be legible)</label>
          <input type="file" accept="image/*" style={styles.input} onChange={e => setFormData({...formData, photo: e.target.files?.[0] || null})} />

          <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginTop: '15px', marginBottom: '8px' }}>Upload Product Video (under 60s, or link to review)</label>
          <input type="file" accept="video/*" style={styles.input} onChange={e => setFormData({...formData, video: e.target.files?.[0] || null})} />
        </div>

        <button type="submit" style={styles.authButton} disabled={isLoading}>{isLoading ? "Submitting..." : "Submit to the Duma"}</button>
      </form>

      <div style={{ ...styles.dumaCard, background: '#f9f9f9', marginTop: '30px' }}>
        <h3 style={{ marginTop: 0, fontSize: '14px', fontWeight: '700' }}>Before You Submit:</h3>
        <ul style={{ fontSize: '13px', color: '#555', lineHeight: '1.8', marginLeft: '20px' }}>
          <li>Verify you are logged in with your profile (displayed above) to ensure points are tracked</li>
          <li>Double-check the Website Link for valid access before submitting</li>
          <li>Ensure product photo label is legible and high-resolution</li>
          <li>Keep video under 60 seconds</li>
          <li>Justification must be 2-3 sentences focused on results, not personal opinions</li>
        </ul>
      </div>
    </div>
  );
};

const PartnerPage = ({ addDumaItem, userEmail, rankTitle, rankScore, authToken, userAvatar }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    contactEmail: "",
    phoneNumber: "",
    ein: "",
    company: "",
    websiteOrSocial: "",
    countryOfOrigin: "",
    operatingCountry: "",
    productType: "",
    productDescription: "",
    whyPartner: "",
    photoFile: null,
    videoFile: null,
    unitsOf34Oz: "500",
    desiredOrderQuantity: "",
    pricing5Gallon: "",
    standardUnitPrice: "5",
    promotionalUnitPrice: "4",
    commission25AgreedTo: false,
    customerRewardAgreed: false,
    shippingReturnsAgreed: false,
    ownershipTitleAgreed: false,
    tier: "National Associate"
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  const userScore = rankScore || 1;
  const canApplyPremium = isPolitburoOrHigher(userScore);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({...formData, photoFile: file});
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({...formData, videoFile: file});
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setShowGuestPrompt(false);

    // Validation
    if (!formData.name || !formData.contactEmail || !formData.phoneNumber || !formData.ein) {
      setErrorMsg("Please fill in all contact information fields.");
      return;
    }
    if (!formData.company || !formData.countryOfOrigin || !formData.operatingCountry) {
      setErrorMsg("Please fill in all company information fields.");
      return;
    }
    if (!formData.productType || !formData.productDescription || !formData.whyPartner) {
      setErrorMsg("Please fill in all product details.");
      return;
    }
    if (!formData.desiredOrderQuantity) {
      setErrorMsg("Please provide your desired inventory fulfillment quantity.");
      return;
    }
    if (!formData.standardUnitPrice) {
      setErrorMsg("Please provide the standard unit price to consumers.");
      return;
    }
    if (!formData.promotionalUnitPrice) {
      setErrorMsg("Please provide the promotional unit price to consumers.");
      return;
    }
    if (!formData.commission25AgreedTo) {
      setErrorMsg("You must agree to the 25% commission agreement.");
      return;
    }
    if (!formData.shippingReturnsAgreed) {
      setErrorMsg("You must agree to the Shipping & Returns Policy.");
      return;
    }
    if (!formData.ownershipTitleAgreed) {
      setErrorMsg("You must agree to the Ownership & Title Policy.");
      return;
    }

    if (formData.tier === "Premium Partner" && !canApplyPremium) {
      setErrorMsg("Premium Partner status requires Politburo rank or higher. Keep building your influence!");
      return;
    }

    if (!authToken) {
      setShowGuestPrompt(true);
      return;
    }

    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('contactEmail', formData.contactEmail);
      formDataObj.append('phoneNumber', formData.phoneNumber);
      formDataObj.append('ein', formData.ein);
      formDataObj.append('company', formData.company);
      formDataObj.append('websiteOrSocial', formData.websiteOrSocial);
      formDataObj.append('countryOfOrigin', formData.countryOfOrigin);
      formDataObj.append('operatingCountry', formData.operatingCountry);
      formDataObj.append('productType', formData.productType);
      formDataObj.append('productDescription', formData.productDescription);
      formDataObj.append('whyPartner', formData.whyPartner);
      formDataObj.append('unitsOf34Oz', formData.unitsOf34Oz);
      formDataObj.append('desiredOrderQuantity', formData.desiredOrderQuantity);
      formDataObj.append('pricing5Gallon', formData.pricing5Gallon);
      formDataObj.append('standardUnitPrice', formData.standardUnitPrice);
      formDataObj.append('promotionalUnitPrice', formData.promotionalUnitPrice);
      formDataObj.append('tier', formData.tier);
      if (formData.photoFile) formDataObj.append('photo', formData.photoFile);
      if (formData.videoFile) formDataObj.append('video', formData.videoFile);

      const res = await fetch(`${BACKEND_URL}/api/duma/partner`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formDataObj
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || 'Submission failed'); return; }
      
      addDumaItem({
        ...formData,
        id: Date.now(),
        type: "Partner",
        submittedBy: userEmail || "anonymous",
        submitterRank: rankTitle || 'Comrade',
        hasPhoto: !!formData.photoFile,
        hasVideo: !!formData.videoFile
      });
      setSubmitted(true);
    } catch (err) {
      addDumaItem({
        ...formData,
        id: Date.now(),
        type: "Partner",
        submittedBy: userEmail || "anonymous",
        submitterRank: rankTitle || 'Comrade',
        hasPhoto: !!formData.photoFile,
        hasVideo: !!formData.videoFile
      });
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ ...styles.dumaCard, textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}></div>
          <h2>Partnership Application Submitted!</h2>
          <p style={{ color: '#666' }}>Your partnership application has been sent to The Majorities' Duma for review.</p>
          <button style={{ ...styles.authButton, marginTop: '20px', width: 'auto', padding: '12px 24px' }} onClick={() => navigate("/duma")}>View the Duma</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2>Partner with The Majorities</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        Apply to become a partner and sell on our marketplace
      </p>
      {userEmail && rankTitle && (
        <div style={{ marginBottom: '20px' }}>
          <CredentialHeader email={userEmail} rankTitle={rankTitle} rankScore={rankScore} avatarUrl={userAvatar} />
        </div>
      )}
      {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}
      {showGuestPrompt && <GuestSubmissionPrompt message="Log in or register to submit this partnership application to The Duma." />}

      <form style={styles.dumaCard} onSubmit={handleSubmit}>
        
        {/* SECTION 1: CONTACT INFORMATION */}
        <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>1. CONTACT INFORMATION</h3>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '14px', fontStyle: 'italic', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #2980b9' }}>
            Contact information will be kept private.
          </p>
          <input required placeholder="Full Name *" style={styles.input} 
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input required placeholder="Business Email *" type="email" style={styles.input} 
            value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
          <input required placeholder="Phone Number *" style={styles.input} 
            value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
          <input required placeholder="EIN (Employer Identification Number) *" style={styles.input} 
            value={formData.ein} onChange={e => setFormData({...formData, ein: e.target.value})} />
        </div>

        {/* SECTION 2: COMPANY INFORMATION */}
        <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>2. COMPANY INFORMATION</h3>
          <input required placeholder="Company Name *" style={styles.input} 
            value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
          <input required placeholder="Country of Origin *" style={styles.input} 
            value={formData.countryOfOrigin} onChange={e => setFormData({...formData, countryOfOrigin: e.target.value})} />
          <input required placeholder="Operating Country *" style={styles.input} 
            value={formData.operatingCountry} onChange={e => setFormData({...formData, operatingCountry: e.target.value})} />
          <input placeholder="Website or Social Media (e.g., www.yoursite.com or @yourhandle)" style={styles.input} 
            value={formData.websiteOrSocial} onChange={e => setFormData({...formData, websiteOrSocial: e.target.value})} />
        </div>

        {/* SECTION 3: PRODUCT DETAILS */}
        <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>3. PRODUCT DETAILS</h3>
          <input required placeholder="Product Type (e.g., Shampoo, Conditioner, Oil) *" style={styles.input} 
            value={formData.productType} onChange={e => setFormData({...formData, productType: e.target.value})} />
          <textarea required placeholder="Product Description *" style={{ ...styles.input, height: '80px' }}
            value={formData.productDescription} onChange={e => setFormData({...formData, productDescription: e.target.value})} />
          <textarea required placeholder="Why should we partner with you? *" style={{ ...styles.input, height: '100px' }}
            value={formData.whyPartner} onChange={e => setFormData({...formData, whyPartner: e.target.value})} />
        </div>

        {/* SECTION 4: MEDIA UPLOADS */}
        <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>4. MEDIA</h3>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Product Photo</label>
          <input type="file" accept="image/*" style={styles.input} onChange={handlePhotoChange} />
          {photoPreview && <img src={photoPreview} style={{ maxWidth: '150px', marginTop: '10px', borderRadius: '8px' }} alt="Preview" />}

          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginTop: '14px', marginBottom: '8px' }}>Product Video</label>
          <input type="file" accept="video/*" style={styles.input} onChange={handleVideoChange} />
          {videoPreview && <video src={videoPreview} style={{ maxWidth: '150px', marginTop: '10px', borderRadius: '8px' }} controls />}
        </div>

        {/* SECTION 5: LOGISTICS & REQUIREMENTS */}
        <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>5. LOGISTICS & REQUIREMENTS</h3>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '14px', marginTop: 0 }}>
            Desired fulfillment of 3.4 ounce bottles
          </p>
          
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
            Fulfillment Quantity *
          </label>
          <input required placeholder="Fulfillment quantity" type="number" min="500" style={styles.input}
            value={formData.desiredOrderQuantity} onChange={e => setFormData({...formData, desiredOrderQuantity: e.target.value})} />
          <p style={{ fontSize: '11px', color: '#999', marginTop: '4px', margin: '4px 0 0 0' }}>Minimum fulfillment of 500 units</p>
          
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginTop: '14px', marginBottom: '8px' }}>
            Pricing for 5-gallon units (optional)
          </label>
          <input placeholder="Please provide pricing for bulk 5-gallon units" style={styles.input}
            value={formData.pricing5Gallon} onChange={e => setFormData({...formData, pricing5Gallon: e.target.value})} />
        </div>

        {/* SECTION 6: REVENUE AGREEMENT & PRICING */}
        <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>6. REVENUE AGREEMENT & PRICING</h3>
          
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
            One Time Check out: Unit Price to Consumers *
          </label>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px', marginTop: 0 }}>
            One Time unit price (Recommended: $5)
          </p>
          <input required placeholder="e.g., $5.00" style={styles.input}
            value={formData.standardUnitPrice} onChange={e => setFormData({...formData, standardUnitPrice: e.target.value})} />
          
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginTop: '14px', marginBottom: '8px' }}>
            Subscription Pricing: Unit Price for Promotions *
          </label>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px', marginTop: 0 }}>
            Subscription unit price (Recommended: $4)
          </p>
          <input required placeholder="e.g., $4.00" style={styles.input}
            value={formData.promotionalUnitPrice} onChange={e => setFormData({...formData, promotionalUnitPrice: e.target.value})} />
          
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer', marginTop: '14px' }}>
            <input type="checkbox" required checked={formData.customerRewardAgreed}
              onChange={e => setFormData({...formData, customerRewardAgreed: e.target.checked})}
              style={{ marginTop: '4px', accentColor: '#222', cursor: 'pointer' }} />
            <span>I acknowledge and agree to the Customer Reward program: Customers can make a one-time purchase at the Subscription unit price for each promotion of a new rank. *</span>
          </label>
          
          <div style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px', marginTop: '16px', marginBottom: '14px' }}>
            <p style={{ fontSize: '13px', color: '#333', margin: '0 0 10px 0', lineHeight: '1.6' }}>
              <strong>Commission Structure:</strong> The Majorities take a <strong>25%</strong> commission on all partner charges to customers.
            </p>
            {formData.standardUnitPrice && (
              <p style={{ fontSize: '12px', color: '#2980b9', margin: 0, fontWeight: '600', backgroundColor: '#e3f2fd', padding: '8px', borderRadius: '4px' }}>
                One Time: At ${formData.standardUnitPrice}, you'd earn ~${(parseFloat(formData.standardUnitPrice) * 0.75).toFixed(2)} per unit (75%), with The Majorities taking ~${(parseFloat(formData.standardUnitPrice) * 0.25).toFixed(2)} (25%)
              </p>
            )}
            {formData.promotionalUnitPrice && (
              <p style={{ fontSize: '12px', color: '#27ae60', margin: '8px 0 0 0', fontWeight: '600', backgroundColor: '#e8f8f5', padding: '8px', borderRadius: '4px' }}>
                Subscription: At ${formData.promotionalUnitPrice}, you'd earn ~${(parseFloat(formData.promotionalUnitPrice) * 0.75).toFixed(2)} per unit (75%), with The Majorities taking ~${(parseFloat(formData.promotionalUnitPrice) * 0.25).toFixed(2)} (25%)
              </p>
            )}
          </div>
          
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" required checked={formData.commission25AgreedTo} 
              onChange={e => setFormData({...formData, commission25AgreedTo: e.target.checked})}
              style={{ marginTop: '4px', accentColor: '#222', cursor: 'pointer' }} />
            <span>I acknowledge and agree to the 25% commission structure *</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer', marginTop: '12px' }}>
            <input type="checkbox" required checked={formData.shippingReturnsAgreed}
              onChange={e => setFormData({...formData, shippingReturnsAgreed: e.target.checked})}
              style={{ marginTop: '4px', accentColor: '#222', cursor: 'pointer' }} />
            <span>I acknowledge and agree to The Majorities' Shipping & Returns Policy: Partners are responsible for fulfilling orders within the agreed timeframe. Returns and refunds are handled in accordance with platform guidelines, and any disputes will be reviewed by The Majorities' support team. *</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer', marginTop: '12px' }}>
            <input type="checkbox" required checked={formData.ownershipTitleAgreed}
              onChange={e => setFormData({...formData, ownershipTitleAgreed: e.target.checked})}
              style={{ marginTop: '4px', accentColor: '#222', cursor: 'pointer' }} />
            <span>I acknowledge and agree to The Majorities' Ownership & Title Policy: I confirm that I own or have legal rights to sell the listed products, that the products meet all applicable regulations, and that title transfers to the buyer upon delivery. *</span>
          </label>
        </div>

        {/* SECTION 7: PARTNER TIER */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>7. PARTNER TIER</h3>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
              <input type="radio" name="tier" value="National Associate"
                checked={formData.tier === "National Associate"}
                onChange={e => setFormData({...formData, tier: e.target.value})} />
              National Associate
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: canApplyPremium ? 'pointer' : 'not-allowed', opacity: canApplyPremium ? 1 : 0.5 }}>
              <input type="radio" name="tier" value="Premium Partner"
                checked={formData.tier === "Premium Partner"}
                disabled={!canApplyPremium}
                onChange={e => setFormData({...formData, tier: e.target.value})} />
              Premium Partner {!canApplyPremium && <span style={{ fontSize: '11px', color: '#aaa' }}>(Politburo+ only)</span>}
            </label>
          </div>
        </div>

        <button type="submit" style={{ ...styles.authButton, marginTop: '20px' }}>Submit partnership to the duma</button>
      </form>
    </div>
  );
};

// --- CULTURE LAB PAGE (Share Your Perspective) ---
const CultureLabPage = ({ addDumaItem, userEmail, rankTitle, rankScore, authToken, onAddPoints, userAvatar }) => {
  const navigate = useNavigate();
  const prompts = [
    { id: 1, text: "Drop a photo of your current view right now—no filtering, no cleaning up. Where are you working or relaxing from today?" },
    { id: 2, text: "If you had to describe your week so far using only one word, what would it be? Share it below!" },
    { id: 3, text: "Give a quick shout-out to a tool, a life hack, or a person that saved you time this week. What was it?" },
    { id: 4, text: "What is a completely harmless 'hill you are willing to die on'? (e.g., 'Cereal is soup,' 'Defrosting the car is the worst chore'). Let's hear your hot takes!" },
    { id: 5, text: "What was your very first job, and what is the most important (or hilarious) lesson you learned from it?" },
    { id: 6, text: "Let's celebrate the small stuff. What is one thing you accomplished this week—big or small—that you're proud of?" },
    { id: 7, text: "What is a project you are working on right now that has you genuinely excited?" },
    { id: 8, text: "Open your phone's photo library, go to the 5th most recent photo, and post it with zero context. Let the comments guess the story." },
    { id: 9, text: "If you could go back and give your 20-year-old self one piece of advice about life or career, what would it be?" },
    { id: 10, text: "Whats a more fun sport to watch Basketball or Football? Whats more fun to play?" },
    { id: 11, text: "Celebrity crush?" },
    { id: 12, text: "What is one morning ritual or habit that completely flips your mindset for a successful day?" },
    { id: 13, text: "Show or tell us about a 'blind buy' (product, book, or gadget) that actually exceeded your expectations." },
    { id: 14, text: "What is the best piece of advice you've received about avoiding burnout?" },
    { id: 15, text: "What's a small, mundane task you've completely optimized or automated in your life?" },
    { id: 16, text: "Describe your ultimate, no-compromise Sunday routine in three words or a quick clip." },
    { id: 17, text: "What does 'unplugging' look like for you when you need a digital detox?" },
    { id: 18, text: "What is a recent small win or personal milestone you're celebrating this week?" },
    { id: 19, text: "What is one ingredient, scent, or product you absolutely cannot live without right now?" },
    { id: 20, text: "Who is someone in your local community or online space making a quiet but massive impact? Give them a shout-out!" },
    { id: 21, text: "What is a cultural tradition or family custom you've actively chosen to keep alive?" },
    { id: 22, text: "Describe a time a stranger's small act of kindness completely turned your week around." },
    { id: 23, text: "What does the word 'community' mean to you in today's world?" },
    { id: 24, text: "What is a book, podcast, or documentary that completely altered how you view a certain topic?" },
    { id: 25, text: "Show or tell us about a passion project you are working on purely for the joy of it." },
    { id: 26, text: "If you could instantly master any creative skill or craft overnight, what would it be?" },
    { id: 27, text: "What is a common piece of conventional wisdom that you completely disagree with?" },
    { id: 28, text: "What is something you are deeply optimistic about looking into the next year?" },
    { id: 29, text: "If you could send a 30-second voice note to yourself from five years ago, what would you say?" },
    { id: 30, text: "What is a new hobby or topic you've suddenly become obsessed with learning about?" },
    { id: 31, text: "What is one thing you did this week that your future self will thank you for?" }
  ]
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [communitySocials, setCommunitySocials] = useState([]);

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
          if (email && links && !seen.has(email) && (links.instagram || links.tiktok || links.facebook)) {
            seen.add(email);
            socials.push({ email, links, avatar: item.submitterAvatar || null, rank: item.submitterRank || 'Comrade' });
          }
        });
        setCommunitySocials(socials);
      })
      .catch(err => console.error("Failed to load community socials:", err));
  }, []);

  const activePrompt = prompts[activePromptIndex];

  const selectedPrompt = activePrompt?.text || "";

  const rotatePrompt = (direction) => {
    setActivePromptIndex((prev) => {
      if (direction === "random") {
        if (prompts.length <= 1) return prev;
        let nextIndex = prev;
        while (nextIndex === prev) {
          nextIndex = Math.floor(Math.random() * prompts.length);
        }
        return nextIndex;
      }
      return (prev + direction + prompts.length) % prompts.length;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPrompt || !response.trim()) {
      setErrorMsg("Please select a prompt and provide your response.");
      return;
    }
    
    setErrorMsg("");
    
    try {
      if (authToken) {
        const res = await fetch(`${BACKEND_URL}/api/duma/culture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({
            prompt: selectedPrompt,
            response: response,
            category: "Culture"
          })
        });
        const data = await res.json();
        if (!res.ok) { setErrorMsg(data.error || 'Submission failed'); return; }
      }

      // Add to local Duma and award points
      addDumaItem({
        id: Date.now(),
        type: "Culture",
        category: "Culture",
        prompt: selectedPrompt,
        response: response,
        submittedBy: userEmail,
        submitterRank: rankTitle || 'Comrade',
        submitterAvatar: userAvatar || null,
        votes: { yes: 0 }
      });

      if (onAddPoints) onAddPoints(1); // 1 point for submission
      
      setSubmitted(true);
      setTimeout(() => {
        navigate("/duma");
      }, 2000);
    } catch (err) {
      // Fallback to local only
      addDumaItem({
        id: Date.now(),
        type: "Culture",
        category: "Culture",
        prompt: selectedPrompt,
        response: response,
        submittedBy: userEmail,
        submitterRank: rankTitle || 'Comrade',
        submitterAvatar: userAvatar || null,
        votes: { yes: 0 }
      });
      if (onAddPoints) onAddPoints(1);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ ...styles.dumaCard, textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}></div>
          <h2 style={{ marginBottom: '10px' }}>Perspective Shared!</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Your response has been submitted to The Majorities' Culture section and appears in the Duma for community voting.
          </p>
          <p style={{ fontSize: '12px', color: '#888' }}>You earned 1 point!</p>
          {rankTitle && <RankBadge rankTitle={rankTitle} />}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2>Share Your Perspective</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        Contribute to our Culture section by answering one of these prompts. 
        Submit your response to the Duma for community voting and earn points!
      </p>

      {userEmail && rankTitle && (
        <div style={{ marginBottom: '30px' }}>
          <CredentialHeader email={userEmail} rankTitle={rankTitle} rankScore={rankScore} avatarUrl={userAvatar} />
        </div>
      )}

      {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}

      <form style={styles.dumaCard} onSubmit={handleSubmit}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Choose a Prompt</h3>
        {activePrompt && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              padding: '20px',
              border: '2px solid #222',
              borderRadius: '12px',
              backgroundColor: '#f9f9f9',
              marginBottom: '14px'
            }}>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: '#222', fontWeight: 600 }}>
                {activePrompt.text}
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => rotatePrompt(-1)}
                style={{ ...styles.authButton, width: 'auto', padding: '10px 16px' }}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => rotatePrompt("random")}
                style={{ ...styles.authButton, width: 'auto', padding: '10px 16px', backgroundColor: '#666' }}
              >
                Shuffle Prompt
              </button>
              <button
                type="button"
                onClick={() => rotatePrompt(1)}
                style={{ ...styles.authButton, width: 'auto', padding: '10px 16px' }}
              >
                Next
              </button>
              <span style={{ fontSize: '12px', color: '#666' }}>
                Prompt {activePromptIndex + 1} of {prompts.length}
              </span>
            </div>
          </div>
        )}

        <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>Your Response</h3>
        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px 0' }}>Share your thoughts (recommended: 45 seconds of speaking if recorded)</p>
        <textarea
          required
          placeholder="Type your response here..."
          style={{ ...styles.input, height: '140px' }}
          value={response}
          onChange={(e) => setResponse(e.target.value)}
        />

        <button type="submit" style={styles.authButton}>Submit to the Duma (+1 point)</button>
      </form>

      {/* COMMUNITY SOCIAL FEED */}
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
                  {member.links.facebook && (
                    <a href={safeSocialUrl(member.links.facebook)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#1877F2', textDecoration: 'none', fontWeight: '500' }}>
                      👍 Facebook
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

// --- DUMA PAGE ---
const DumaPage = ({ items, authToken, userEmail, rankTitle, rankScore, onAddPoints, userAvatar }) => {
  const [dumaItems, setDumaItems] = useState(items);
  const [userVotes, setUserVotes] = useState({});
  const [showScores, setShowScores] = useState({});
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [activeSection, setActiveSection] = useState("Culture");

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/duma`).then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        // De-duplicate items by ID so only one unique entry is rendered per submission
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
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h2 style={{ marginBottom: '6px' }}>The Majorities' Duma</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Community recommendations, partnerships, and cultural contributions - vote to shape The Majorities.</p>
        </div>
        {userEmail && rankTitle && <div style={{ textAlign: 'right', minWidth: '250px' }}><CredentialHeader email={userEmail} rankTitle={getRankTitle(rankScore)} rankScore={rankScore} avatarUrl={userAvatar} /></div>}
      </div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
        <button onClick={() => setActiveSection("Culture")} style={{ padding: '10px 20px', backgroundColor: activeSection === "Culture" ? '#222' : '#f5f5f5', color: activeSection === "Culture" ? '#fff' : '#222', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Culture ({culturalItems.length})</button>
        <button onClick={() => setActiveSection("Recommendations")} style={{ padding: '10px 20px', backgroundColor: activeSection === "Recommendations" ? '#222' : '#f5f5f5', color: activeSection === "Recommendations" ? '#fff' : '#222', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Recommendations ({recommendationItems.length})</button>
        <button onClick={() => setActiveSection("Partners")} style={{ padding: '10px 20px', backgroundColor: activeSection === "Partners" ? '#222' : '#f5f5f5', color: activeSection === "Partners" ? '#fff' : '#222', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Partners ({partnerItems.length})</button>
        {authToken && <button onClick={() => window.location.href = '/culture'} style={{ padding: '8px 14px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', marginLeft: 'auto' }}>+ Share Your Perspective</button>}
      </div>

      {activeSection === "Culture" && (
        <div>
          {culturalItems.length === 0 ? (
            <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888' }}>No perspectives shared yet. Share yours and contribute to our culture section!</div>
          ) : (
            culturalItems.map(item => {
              const itemId = item._id || item.id;
              // Dynamically recalculate rank badge from stored score to always reflect correct tier
              const verifiedRank = item.rankScore ? getRankTitle(item.rankScore) : (item.submitterRank || "Comrade");

              return (
                <div key={itemId} style={styles.dumaCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span style={styles.typeTag}>Perspective</span>
                    <RankBadge rankTitle={verifiedRank} />
                  </div>

                  {item.submittedBy && (
                    <CredentialHeader
                      email={item.submittedBy}
                      rankTitle={verifiedRank}
                      rankScore={item.rankScore || null}
                      avatarUrl={item.submitterAvatar || null}
                      socialLinks={item.submitterSocialLinks || null}
                    />
                  )}

                  <h4 style={{ marginTop: '12px', marginBottom: '8px', color: '#555' }}>Prompt: "{item.prompt || 'What makes a person beautiful?'}"</h4>
                  <p style={{ color: '#222', fontSize: '14px', lineHeight: '1.6', marginBottom: '14px' }}>{item.response || item.reason || item.desc}</p>

                  {/* MEDIA DISPLAY: renders uploaded images or videos inline */}
                  {item.mediaUrl && (
                    <div style={{ margin: '15px 0', background: '#fafafa', padding: '10px', borderRadius: '12px', border: '1px solid #eee', textAlign: 'center' }}>
                      {item.mediaType === "video" || /\.(mp4|mov|webm)$/i.test(item.mediaUrl) ? (
                        <video src={item.mediaUrl} style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }} controls />
                      ) : (
                        <img src={item.mediaUrl} alt="Perspective Attachment" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', objectFit: 'contain' }} />
                      )}
                    </div>
                  )}

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

      {activeSection === "Recommendations" && (
        <div>
          {recommendationItems.length === 0 ? (
            <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888' }}>No product recommendations yet. Be the first to recommend a product!</div>
          ) : (
            recommendationItems.map(item => (
              <div key={item.id || item._id} style={styles.dumaCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={styles.typeTag}>{item.type}</span>
                  {item.submitterRank && <RankBadge rankTitle={item.submitterRank} />}
                </div>
                {item.submittedBy && <CredentialHeader email={item.submittedBy} rankTitle={item.submitterRank || 'Comrade'} rankScore={null} avatarUrl={item.submitterAvatar || null} socialLinks={item.submitterSocialLinks || null} />}
                <h3 style={{ marginTop: '8px', marginBottom: '6px' }}>{item.name || item.product} by {item.company}</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '14px' }}>{item.reason || item.desc}</p>
                
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

      {activeSection === "Partners" && (
        <div>
          {partnerItems.length === 0 ? (
            <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888' }}>No partner applications yet. Be the first to submit a partnership!</div>
          ) : (
            partnerItems.map(item => (
              <div key={item.id || item._id} style={styles.dumaCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={styles.typeTag}>{item.type}</span>
                  {item.submitterRank && <RankBadge rankTitle={item.submitterRank} />}
                </div>
                {item.submittedBy && <CredentialHeader email={item.submittedBy} rankTitle={item.submitterRank || 'Comrade'} rankScore={null} avatarUrl={item.submitterAvatar || null} socialLinks={item.submitterSocialLinks || null} />}

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
    </div>
  );
};

// --- PERSPECTIVES PAGE (Personalized Feed from Following) ---
const PerspectivesPage = ({ items, authToken, userEmail, rankTitle, rankScore, following, onFollowUser, onUnfollowUser, onAddPoints, userAvatar }) => {
  const [followingList, setFollowingList] = useState([]);
  const [selectedFollowing, setSelectedFollowing] = useState(following || []);
  const [filteredItems, setFilteredItems] = useState([]);
  const [allItems, setAllItems] = useState(items);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/duma`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setAllItems(data);
      })
      .catch(err => console.error("Failed to load perspectives:", err));
  }, []);

  useEffect(() => {
    // Extract unique submitters from Duma posts
    const uniqueSubmitters = [...new Set(allItems.map(item => item.submittedBy))].filter(Boolean).filter(p => p !== userEmail);
    setFollowingList(uniqueSubmitters);
  }, [allItems, userEmail]);

  const handleFollowingToggle = (person) => {
    if (selectedFollowing.includes(person)) {
      onUnfollowUser?.(person);
      setSelectedFollowing(prev => prev.filter(p => p !== person));
    } else {
      onFollowUser?.(person);
      setSelectedFollowing(prev => [...prev, person]);
    }
  };

  useEffect(() => {
    if (selectedFollowing.length === 0) {
      setFilteredItems([]);
    } else {
      const filtered = allItems.filter(item => selectedFollowing.includes(item.submittedBy));
      setFilteredItems(filtered);
    }
  }, [selectedFollowing, allItems]);

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '6px' }}>My Perspectives</h2>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
          Follow people from The Duma to see their perspectives in your personalized feed. Earn +1 point for each person you follow!
        </p>
      </div>

      {userEmail && rankTitle && (
        <div style={{ marginBottom: '20px' }}>
          <CredentialHeader email={userEmail} rankTitle={rankTitle} rankScore={rankScore} avatarUrl={userAvatar} />
        </div>
      )}

      <div style={{ ...styles.dumaCard, marginBottom: '30px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Who You Follow ({selectedFollowing.length}/{followingList.length})</h3>
        {followingList.length === 0 ? (
          <p style={{ color: '#888', fontSize: '13px' }}>No people yet. Submit to the Duma to build your community!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
            {followingList.map(person => (
              <button
                key={person}
                onClick={() => handleFollowingToggle(person)}
                style={{
                  padding: '12px',
                  border: selectedFollowing.includes(person) ? '2px solid #222' : '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: selectedFollowing.includes(person) ? '#f9f9f9' : '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: selectedFollowing.includes(person) ? '600' : '400',
                  color: '#222',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {person}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 style={{ marginBottom: '16px' }}>Perspectives Feed ({filteredItems.length})</h3>
        {filteredItems.length === 0 && selectedFollowing.length === 0 ? (
          <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888' }}>
            Select people you follow to see their perspectives here.
          </div>
        ) : selectedFollowing.length > 0 && filteredItems.length === 0 ? (
          <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888' }}>
            No perspectives yet from people you follow.
          </div>
        ) : (
          filteredItems.map(item => (
            <div key={item.id || item._id} style={styles.dumaCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={styles.typeTag}>Perspective</span>
                {item.submitterRank && <RankBadge rankTitle={item.submitterRank} />}
              </div>
              {item.submittedBy && <CredentialHeader email={item.submittedBy} rankTitle={item.submitterRank || 'Comrade'} rankScore={null} avatarUrl={item.submitterAvatar || null} socialLinks={item.submitterSocialLinks || null} />}
              <h4 style={{ marginTop: '12px', marginBottom: '8px', color: '#555' }}>Prompt: "{item.prompt || 'What makes a person beautiful?'}"</h4>
              <p style={{ color: '#222', fontSize: '14px', lineHeight: '1.6' }}>{item.response || item.reason || item.desc}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- ADMIN ORDER TRACKING & FULFILLMENT SYSTEM ---
const AdminOrdersPage = ({ authToken, userEmail }) => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Security Gate: Replace with your exact company owner email address
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
        // Optimistically swap status locally on the layout row
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
    return { background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' }; // Pending state
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

      {/* FILTERS TOOLBAR */}
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

      {/* GRID LOG DATA MATCH */}
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

              {/* ACTION PIPELINE ROUTERS */}
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

// --- MAIN APP COMPONENT ---

// --- MODEL-FRIENDLY PAGE ---
// This page renders a clean, structured, text-based representation of the site
// optimized for AI models, crawlers, and accessibility tools.
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
            {product.hairType && (
              <>
                <span style={labelStyle}>Hair Type</span>
                <div style={valueStyle}>{product.hairType}</div>
              </>
            )}
            {product.targetConcerns && (
              <>
                <span style={labelStyle}>Target Concerns</span>
                <div style={valueStyle}>{product.targetConcerns.join(", ")}</div>
              </>
            )}
            {product.scentProfile && (
              <>
                <span style={labelStyle}>Scent</span>
                <div style={valueStyle}>{product.scentProfile}</div>
              </>
            )}
            {product.applicationType && (
              <>
                <span style={labelStyle}>Application Type</span>
                <div style={valueStyle}>{product.applicationType}</div>
              </>
            )}
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
        <div style={valueStyle}>Users can link Instagram, TikTok, and Facebook profiles to their Majorities account.</div>
      </section>

      <div style={{ borderTop: "2px solid #111", paddingTop: "20px", fontSize: "11px", color: "#888" }}>
        <p>This model-friendly page is provided by The Majorities to support AI assistants and accessibility tools.</p>
        <p>Shop domain: {siteInfo.shopDomain} · Backend: hair-backend-2.onrender.com</p>
        <p>For the interactive product builder, visit the <a href="/" style={{ color: "#111" }}>home page</a>.</p>
      </div>
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
      if (authToken) {
        fetch(`${BACKEND_URL}/api/profile/add-points`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ points })
        }).catch(err => console.error("Error updating points:", err));
      }
      return newScore;
    });
  }, [authToken]);

  const followUser = useCallback((personEmail) => {
    if (!following.includes(personEmail)) {
      setFollowing(prev => [...prev, personEmail]);
      addPoints(1); // +1 point for following someone
      // Notify backend to award +4 points to the person being followed
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
        <header style={styles.header}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}><div style={styles.logo}>The Majorities</div></Link>
          <nav style={styles.nav}>
            <Link to="/" style={styles.navLink}>Home</Link>
            <Link to="/recommend" style={styles.navLink}>Recommend</Link>
            <Link to="/partner" style={styles.navLink}>Partner</Link>
            {/* <Link to="/model" style={styles.navLink}>Model View</Link> */}
            {isLoggedIn ? (
              <>
                <Link to="/duma" style={styles.navLink}>The Duma</Link>
                <Link to="/perspectives" style={styles.navLink}>Culture</Link>
                {isLoggedIn && userEmail === "YOUR_EMAIL@domain.com" && (
                  <Link to="/admin/orders" style={{ ...styles.navLink, color: '#e74c3c', fontWeight: '700' }}>
                    ⚙️ Admin Control
                  </Link>
                )}
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
          <Route path="/auth/instagram/callback" element={<OAuthCallbackPage onLogin={handleLoginSuccess} provider="instagram" />} />              <Route path="/oauth/callback/:provider" element={<OAuthCallbackPage onLogin={handleLoginSuccess} provider="instagram" />} />
          <Route path="/auth/tiktok/callback" element={<OAuthCallbackPage onLogin={handleLoginSuccess} provider="tiktok" />} />
          <Route path="/signup" element={<SignupPage onLogin={handleLoginSuccess} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/recommend" element={<RecommendPage addDumaItem={addDumaItem} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} userAvatar={userAvatar} />} />
          <Route path="/partner" element={<PartnerPage addDumaItem={addDumaItem} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} userAvatar={userAvatar} />} />
          <Route path="/culture" element={<CultureLabPage addDumaItem={addDumaItem} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} onAddPoints={addPoints} userAvatar={userAvatar} />} />
          <Route path="/duma" element={<DumaPage items={dumaItems} authToken={authToken} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} onAddPoints={addPoints} userAvatar={userAvatar} />} />
          <Route path="/perspectives" element={<PerspectivesPage items={dumaItems} authToken={authToken} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} following={following} onFollowUser={followUser} onUnfollowUser={unfollowUser} onAddPoints={addPoints} userAvatar={userAvatar} />} />
          <Route path="/legislature" element={<DumaPage items={dumaItems} authToken={authToken} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} onAddPoints={addPoints} userAvatar={userAvatar} />} />
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
      <p>aBy accessing or using The Majorities ecosystem, web interface, custom formulas, or network features (collectively, the "Service"), you explicitly agree to be bound by these Terms of Service. If you do not accept these conditions, you are prohibited from utilizing our custom product builder or participating in our governance structures. ("Terms"). If you do not agree to all of the terms and conditions of this agreement, you may not access or use the Service. These Terms apply to all visitors, users, and others who access the Service.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>2. Custom Formulation E-Commerce</h2>
      <p>The Majorities provides an active custom assembly framework allowing users to choose exactly six (6) items across distinct hair and face categories to complete an authorized set. All primary collection variations are uniformly priced on our marketplace as follows: One-Time Selection Sets at $7.00 per standard unit volume ($42.00 total package valuation); Monthly Reoccurring Subscriptions automatically discounted to $6.00 per unit selection ($36.00 total monthly collection billing loop). All subscription models automatically bill every 30 days to your secure payment instrument on file until paused or canceled natively through your user dashboard. The Service also includes community engagement features such as perspective sharing, community rankings, and social profile integration. We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time with or without notice.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>3. The Duma Ledger & Governance Tokens</h2>
      <p>Our platforms host a digital community ledger called the Duma. By interacting with the Duma, including uploading user avatars, publishing custom media context, following creators, or casting platform recommendations, you gain experience points that directly adjust your community tier (from a baseline Comrade tier scaling up to executive command designations). Progression through certain tiers awards specific utility tokens. You recognize that points and tokens inside our platform are purely gamified community rewards, possess exactly zero financial cash-out value, and cannot be traded on external exchanges., you may be required to register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete. You are solely responsible for safeguarding your account credentials and for all activity that occurs under your account. You agree to notify us immediately at support@themajorities.com of any unauthorized use of your account.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>4. Partner Distribution Marketplace</h2>
      <p>Third-party manufacturing groups applying for official platform retail listings must adhere to our global logistics rules. Partners must ensure initial stock allocations meet or exceed a minimum baseline threshold of 500 units for standard 3.4-ounce container volumes. The Majorities retains a fixed 25% marketplace distribution fee on every processing customer transaction. Partners receive exactly 75% of net revenues from their assigned custom line items. Partners explicitly consent to give customers singular promotional checkout benefits equal to the Subscription unit price whenever a consumer unlocks an influential new rank milestone in the Duma network. (USD) and are subject to change without notice. When you initiate a purchase, you represent and warrant that you are authorized to use the payment method you provide. By submitting a subscription order, you authorize us to charge your payment method on a recurring basis at the then-current subscription rate. You may cancel a subscription at any time through your account dashboard; cancellations will take effect at the end of the then-current billing period. All sales are final unless the product is defective or damaged upon arrival.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>5. User-Submitted Media and Content Rights</h2>
      <p>When you post a 60-second video view snippet, custom hair profile, or feedback justification to the Duma, you grant The Majorities an unrestricted, global, royalty-free license to host, display, and analyze that file. You certify your submission does not infringe on third-party intellectual property or privacy scopes. ("User Content"). By submitting User Content, you grant The Majorities a non-exclusive, worldwide, royalty-free, irrevocable license to use, reproduce, modify, adapt, publish, translate, distribute, and display such content in connection with the Service and our marketing activities. You represent and warrant that you own or have the necessary rights to grant this license and that your User Content does not violate any third-party rights or applicable laws.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>6. Limitation of Liability & Contact</h2>
      <p>Products, treatments, and software routines are provided "As Is" without underlying therapeutic warranties. The Majorities and its primary logistics suppliers (including ShipBob processing endpoints) shall not be liable for delivery blockages beyond our direct server operations. For corporate inquiries, contact: legal@themajorities.com: (a) use the Service for any unlawful purpose or in violation of any applicable regulations; (b) post content that is defamatory, obscene, harassing, or infringes on the rights of others; (c) attempt to gain unauthorized access to any portion of the Service or its related systems; (d) use any automated tools, scrapers, or bots to interact with the Service; (e) interfere with the proper functioning of the Service or impose an unreasonable load on our infrastructure.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}></h2>
      <p>All content, trademarks, logos, and intellectual property associated with The Majorities brand, products, and Service are the exclusive property of The Majorities or its licensors. Nothing in these Terms grants you a right or license to use any trademark, logo, or brand feature of The Majorities. Unauthorized use of any proprietary content is strictly prohibited.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}></h2>
      <p>THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}></h2>
      <p>, THE MAJORITIES AND ITS AFFILIATES, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}></h2>
      <p>, without regard to its conflict of law provisions. Any dispute arising from these Terms or your use of the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}></h2>
      <p>. We will notify registered users of material changes by email or by posting a prominent notice on the Service. Your continued use of the Service after such changes constitutes your acceptance of the revised Terms. We encourage you to review these Terms periodically.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}></h2>
      <p></p>
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
      <p>To safely fulfill custom cosmetic selections and compute user tier algorithms, we process and log the following data classes: Account email addresses, unique password configurations, custom profile avatars, user points tallies, and logged system formulas. Consumer shipping locations, target delivery addresses, and mobile contact lines managed directly via secure permalinks handed over to Shopify commerce servers. We never cache or collect raw credit card variables internally on our Render backend servers. Text thoughts, image attachments, and custom video voice notes up to 60 seconds posted directly into our public culture forums. Secure access authorization parameters from connecting identity networks, including Google open profiles, Instagram links, and secure TikTok verification streams.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>2. How Your Private Records are Handled</h2>
      <p>We restrict utilization of logged variables strictly to core operational mechanics: To execute fast delivery packaging metrics through third-party optimization services like ShipBob. To instantly sync dynamic rank progress matrices (+25 pts for avatar assets, +100 pts for perspective publishing). To authenticate and confirm active platform identity properties throughout our routing files., including: (a) <strong>Personal Identification Information</strong>: name, email address, shipping address, and phone number provided during account registration or checkout; (b) <strong>Payment Information</strong>: billing details processed securely through our payment processor (Shopify Payments); we do not store raw credit card data on our servers; (c) <strong>User Content</strong>: photos, videos, text, and other content you voluntarily submit through our perspective sharing and community features; (d) <strong>Usage Data</strong>: IP address, browser type, pages visited, time spent on pages, and other diagnostic data collected automatically when you access the Service; (e) <strong>Social Profile Data</strong>: public profile information from third-party social accounts you choose to connect to our platform.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>3. How We Use Your Information</h2>
      <p>We use the information we collect for the following purposes: to process and fulfill your orders and subscriptions; to manage your account and provide customer support; to personalize your experience on our platform; to send you transactional emails (order confirmations, shipping updates); to send you promotional communications, subject to your opt-in preferences; to improve our products, services, and website functionality; to detect, prevent, and address technical issues and fraudulent activity; and to comply with our legal obligations.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>4. Sharing Your Information</h2>
      <p>We do not sell, trade, or rent your personal identification information to third parties. We may share your data with trusted service providers who assist us in operating our business, including: payment processors (Shopify), cloud storage and hosting providers, email service providers, and analytics platforms. All such service providers are contractually obligated to use your data only for the purposes we specify and to maintain appropriate security measures.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>5. Cookies and Tracking Technologies</h2>
      <p>We use cookies and similar tracking technologies to enhance your experience on our Service. Cookies are small data files stored on your device. We use both session cookies (which expire when you close your browser) and persistent cookies (which remain on your device for a set period). You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent; however, some features of our Service may not function properly without cookies.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>6. Data Retention</h2>
      <p>We retain your personal information for as long as your account is active or as needed to provide you with our services. We will also retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements. If you wish to delete your account or request that we no longer use your information, please contact us at privacy@themajorities.com.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>7. Data Security</h2>
      <p>We implement commercially reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include encrypted data transmission (SSL/TLS), access controls, and regular security assessments. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>8. Your Rights</h2>
      <p>Depending on your location, you may have certain rights regarding your personal data, including: the right to access and receive a copy of your personal data; the right to correct inaccurate or incomplete data; the right to request deletion of your personal data; the right to restrict or object to our processing of your data; and the right to data portability. To exercise any of these rights, please contact us at privacy@themajorities.com. We will respond to all requests within 30 days.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>9. Children's Privacy</h2>
      <p>Our Service is not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information. If you believe we may have collected information from a child under 13, please contact us immediately.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>10. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. For significant changes, we will provide a more prominent notice, such as an email notification to registered users. We encourage you to review this Privacy Policy periodically to stay informed.</p>

      <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '36px', marginBottom: '10px' }}>11. Contact Us</h2>
      <p>If you have any questions or concerns about this Privacy Policy, please contact us at: <strong>privacy@themajorities.com</strong></p>
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
