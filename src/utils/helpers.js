// src/utils/helpers.js
// Rank system utilities, commerce helpers, and media/social URL helpers

import { RANK_TIERS, PRODUCT_VARIANT_MAP, SHOP_DOMAIN, LORD_POST_MILESTONE } from './constants';

// --- Rank System ---

export const DEFAULT_RANK_TITLE = "Comrade";

export const getRankTitle = (score) => {
  const numeric = Number(score) || 1;
  for (const tier of RANK_TIERS) {
    if (numeric >= tier.min) return tier.title;
  }
  return DEFAULT_RANK_TITLE;
};

export const getRankTier = (rankTitle) => RANK_TIERS.find(t => t.title === rankTitle) || null;

export const getRankDescription = (rankTitle) => getRankTier(rankTitle)?.description || "";

// Duma Post Milestone: reaching LORD_POST_MILESTONE (15) Duma posts grants the "Lord" prefix
export const hasLordPrefix = (dumaPostCount = 0) => (Number(dumaPostCount) || 0) >= LORD_POST_MILESTONE;

export const withLordPrefix = (name, dumaPostCount = 0) =>
  name && hasLordPrefix(dumaPostCount) && !String(name).startsWith('Lord ') ? `Lord ${name}` : name;

export const DUMA_POST_COUNT_KEY = "majorities_duma_post_counts";

// Members with no stored count yet are seeded from their completed prompts (the old Lord criterion),
// so nobody loses progress in the switch to post-based counting.
const resolveDumaPostCount = (stored, userEmail) =>
  stored[userEmail] != null ? Number(stored[userEmail]) || 0 : getCompletedPromptIds(userEmail).length;

export const getDumaPostCount = (userEmail) => {
  if (typeof window === "undefined" || !userEmail) return 0;
  try {
    const stored = JSON.parse(window.localStorage.getItem(DUMA_POST_COUNT_KEY) || "{}");
    return resolveDumaPostCount(stored, userEmail);
  } catch {
    return 0;
  }
};

export const incrementDumaPostCount = (userEmail) => {
  if (typeof window === "undefined" || !userEmail) return 0;
  try {
    const stored = JSON.parse(window.localStorage.getItem(DUMA_POST_COUNT_KEY) || "{}");
    stored[userEmail] = resolveDumaPostCount(stored, userEmail) + 1;
    window.localStorage.setItem(DUMA_POST_COUNT_KEY, JSON.stringify(stored));
    return stored[userEmail];
  } catch {
    return getDumaPostCount(userEmail);
  }
};

export const AVATAR_SLOT_REWARDS_KEY = "majorities_avatar_slot_rewards";

// Each profile picture slot pays out once; returns true the first time a slot is claimed,
// so removing and re-adding a picture can't farm points.
export const claimAvatarSlotReward = (userEmail, slotIndex) => {
  if (typeof window === "undefined" || !userEmail) return false;
  try {
    const stored = JSON.parse(window.localStorage.getItem(AVATAR_SLOT_REWARDS_KEY) || "{}");
    const claimed = new Set(stored[userEmail] || []);
    if (claimed.has(slotIndex)) return false;
    claimed.add(slotIndex);
    stored[userEmail] = Array.from(claimed);
    window.localStorage.setItem(AVATAR_SLOT_REWARDS_KEY, JSON.stringify(stored));
    return true;
  } catch {
    return false;
  }
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

export const isPolitburoOrHigher = (score) => (Number(score) || 0) >= 10000000;

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

// Gold for the honours ladder (1,000,000+ pts), grey for everyone else
export const getRankColor = (rankTitle) => {
  const tier = getRankTier(rankTitle);
  if (tier && tier.min >= 1000000) return '#FFD700';
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
