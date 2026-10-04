// src/utils/shopCatalog.js
// Retail (non-wholesale) catalog for the mobile shop: the three bundles first, then the six single bottles.
// Variant and selling-plan IDs come from the Shopify store (c0bqfe-z2.myshopify.com/products/<handle>.js).
import { productsData } from './constants';

const SHOPIFY_FILES = 'https://cdn.shopify.com/s/files/1/0776/7339/8450/files/';
const SIX_BOTTLE = '/6-Bottle Face and Hair Routine Bundle';

const single = (key) => productsData[key][0];

export const SHOP_ITEMS = [
  {
    id: 'bundle-6',
    name: 'The Majorities 6-Bottle Face and Hair Routine Bundle',
    category: 'bundles',
    tag: 'Bundle',
    variantId: '47561457336498',
    sellingPlanId: '3270901938',
    pricing: { oneTime: 69.0, subscription: 54.99 },
    images: [
      `${SIX_BOTTLE} Box.jpg`,
      `${SIX_BOTTLE} Front bottle.jpg`,
      `${SIX_BOTTLE} back bottle.jpg`,
      `${SIX_BOTTLE} Back.jpg`,
    ],
    includes: 'Shampoo, Conditioner, Hair Oil, Facial Scrub, Face Toner, Moisturizing Lotion',
    summary: 'Our complete line of hair and face essentials in one set. Six 100ml bottles cover cleansing, conditioning, sealing, exfoliating, toning, and moisturizing, at home or on the go.',
  },
  {
    id: 'bundle-3-face',
    name: 'The Majorities 3-Bottle Face Routine Bundle',
    category: 'bundles',
    tag: 'Bundle',
    variantId: '47561456877746',
    sellingPlanId: '3270869170',
    pricing: { oneTime: 44.99, subscription: 29.99 },
    images: [`${SHOPIFY_FILES}AmazonProductImageEdit.jpg?v=1787712759&width=900`],
    includes: 'Facial Scrub, Face Toner, Moisturizing Lotion',
    summary: 'Three face essentials in one routine: a scrub to polish, a toner to balance, and a lotion to lock in moisture.',
  },
  {
    id: 'bundle-3-hair',
    name: 'The Majorities 3-Bottle Hair Routine Bundle',
    category: 'bundles',
    tag: 'Bundle',
    variantId: '47561455829170',
    sellingPlanId: '3270869170',
    pricing: { oneTime: 44.99, subscription: 29.99 },
    images: [`${SHOPIFY_FILES}front3-1h_9b9b29de-5e7e-40c5-912c-1da60998bd4e.jpg?v=1787758308&width=900`],
    includes: 'Shampoo, Conditioner, Hair Oil',
    summary: 'Three hair essentials in one routine: a deep-cleansing shampoo, a rich conditioner, and a lightweight finishing oil.',
  },
  ...[
    ['shampoos', 'single-shampoo', 'hair', 'Hair', '47796439744690'],
    ['conditioners', 'single-conditioner', 'hair', 'Hair', '47796444758194'],
    ['oils', 'single-hair-oil', 'hair', 'Hair', '47796452327602'],
    ['faceScrubs', 'single-facial-scrub', 'face', 'Face', '47796456816818'],
    ['toners', 'single-face-toner', 'face', 'Face', '47796462059698'],
    ['faceCreams', 'single-lotion', 'face', 'Face', '47796465369266'],
  ].map(([key, id, category, tag, variantId]) => {
    const p = single(key);
    return {
      id,
      name: p.name,
      category,
      tag,
      variantId,
      sellingPlanId: '3011281074',
      pricing: { oneTime: 19.99, subscription: 14.99 },
      images: p.images || [p.imageUrl],
      desc: p.desc,
    };
  }),
];

export const SHOP_ITEM_BY_ID = Object.fromEntries(SHOP_ITEMS.map((item) => [item.id, item]));
