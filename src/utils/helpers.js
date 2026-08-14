// src/utils/helpers.js
// Rank system utilities, commerce helpers, and media/social URL helpers

import { RANK_TIERS, PRODUCT_VARIANT_MAP, SHOP_DOMAIN } from './constants';

// --- Rank System ---

export const getRankTitle = (score) => {
  for (const tier of RANK_TIERS) {
    if (score >= tier.min) return tier.title;
  }
  return "Comrade";
};

export const LOWER_HIERARCHY_TITLES = RANK_TIERS.slice(RANK_TIERS.findIndex(t => t.title === "Perun")).map(t => t.title);

export const getFormattedRankTitle = (rankTitle, completedPromptsCount = 0) => {
  if (LOWER_HIERARCHY_TITLES.includes(rankTitle) && completedPromptsCount >= 15) {
    return `Lord ${rankTitle}`;
  }
  return rankTitle;
};

export const COMPLETED_PROMPTS_KEY = "majorities_completed_prompts";

export const getCompletedPromptIds = (userEmail) => {
  if (typeof window === "undefined" || !userEmail) return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(COMPLETED_PROMPTS_KEY) || "{}");
    return stored[userEmail] || [];
  } catch {
    return [];
  }
};

export const markPromptCompleted = (userEmail, promptId) => {
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

export const isPolitburoOrHigher = (score) => score >= 10000000;

export const getPointsToNextRank = (currentScore, currentRankTitle) => {
  const currentIndex = RANK_TIERS.findIndex(r => r.title === currentRankTitle);
  if (currentIndex <= 0) return 0;
  const nextRank = RANK_TIERS[currentIndex - 1];
  return Math.max(0, nextRank.min - currentScore);
};

export const getNextRankTitle = (currentRankTitle) => {
  const currentIndex = RANK_TIERS.findIndex(r => r.title === currentRankTitle);
  if (currentIndex <= 0) return null;
  return RANK_TIERS[currentIndex - 1].title;
};

export const getRankProgress = (currentScore, currentRankTitle) => {
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

export const getRankColor = (rankTitle) => {
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

// --- Commerce Helpers ---

export const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

export const getProductCommerceConfig = (productName) => PRODUCT_VARIANT_MAP[productName] || {
  merchandiseId: "",
  pricing: { oneTime: 0, subscription: 0 },
  sellingPlanId: null
};

export const calculateSetTotals = (items = []) => items.reduce((totals, item) => {
  const { pricing } = getProductCommerceConfig(item.name);
  return {
    oneTime: totals.oneTime + (pricing.oneTime || 0),
    subscription: totals.subscription + (pricing.subscription || 0)
  };
}, { oneTime: 0, subscription: 0 });

export const submitShopifyCheckout = (items, purchaseType = "one-time") => {
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

// --- Social / Media URL Helpers ---

export const safeSocialUrl = (raw) => {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
};

export const normalizeMediaVideoUrl = (url) => {
  if (!url) return url;
  let normalized = url;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const isCloudinaryHost = host === 'cloudinary.com' || host.endsWith('.cloudinary.com');
    if (isCloudinaryHost && parsed.pathname.includes('/video/upload/')) {
      if (!parsed.pathname.includes('/f_mp4')) {
        normalized = normalized.replace('/video/upload/', '/video/upload/f_mp4,vc_h264/');
      }
      normalized = normalized.replace(/\.(mov|webm|hevc)$/i, '.mp4');
    }
  } catch {
    return normalized.replace(/\.(mov|webm|hevc)$/i, '.mp4');
  }
  return normalized;
};
