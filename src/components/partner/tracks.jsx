// src/components/partner/tracks.jsx
// One config per partner track. Each asks only what that kind of partner can answer.
import React from 'react';
import {
  TextInput, TextArea, SelectInput, Chips, ChoiceCards, SocialPicker, LocationField, MediaDrop,
  isEmail, isHttpUrl, normalizeUrl, countryFromLocation, missingSocial, ui, POLICY_LINKS,
} from './PartnerWizard';
import { MarketplaceProductsStep, validateProducts, appendProducts } from './MarketplaceProducts';

// Shared payload bits: contact, location, the four standard agreement flags (one checkbox covers them)
const appendCommon = (fd, f, { company }) => {
  const country = countryFromLocation(f.location);
  fd.append('name', f.name.trim());
  fd.append('contactEmail', f.contactEmail.trim());
  fd.append('phoneNumber', (f.phoneNumber || '').trim());
  fd.append('company', company.trim());
  fd.append('location', (f.location || '').trim());
  fd.append('countryOfOrigin', country);
  fd.append('operatingCountry', country);
  ['customerRewardAgreed', 'commission20AgreedTo', 'shippingReturnsAgreed', 'ownershipTitleAgreed'].forEach(k => fd.append(k, true));
};
const appendMedia = (fd, f) => {
  (f.photos || []).forEach((p, i) => fd.append(`photo_${i}`, p.file));
  if (f.video) fd.append('video', f.video.file);
};
const contactCheck = (f) => {
  if (!f.name.trim()) return 'Please enter your name.';
  if (!isEmail(f.contactEmail)) return 'Please enter a valid email.';
  return '';
};

// ── Brand & Retailer ──────────────────────────────────────────────────────────
const GOAL_WHOLESALE = 'Wholesale / Bulk Purchase';
const GOAL_LISTING = 'Marketplace Listing';
const GOAL_ADS = 'Sponsored Placements / Advertising';

export const BRAND_TRACK = {
  category: 'Brand & Retail Partners',
  idPrefix: 'bp',
  draftKey: 'brand_partner_draft',
  draftNote: 'uploads, your Tax ID and accepted terms',
  submitLabel: 'Submit Partner Application',
  initial: { company: '', name: '', contactEmail: '', phoneNumber: '', platform: '', websiteUrl: '', socials: {},
    goals: [], productCategory: '', monthlyRevenue: '', totalBudget: '', ein: '', location: '', photos: [], video: null },
  draftFields: ['company', 'name', 'contactEmail', 'phoneNumber', 'platform', 'websiteUrl', 'socials', 'goals', 'productCategory', 'monthlyRevenue', 'totalBudget', 'location'],
  terms: {
    title: 'Brand Partner Terms',
    items: [
      '20% commission on sales completed through The Majorities. No listing or setup fees.',
      'Customer Reward program: shoppers earn rank points on your products, funded by The Majorities.',
      <>Orders follow our shipping timelines and return window ({POLICY_LINKS.returns}).</>,
      <>Ownership & title of inventory as set out in our {POLICY_LINKS.tos}.</>,
    ],
  },
  steps: [
    {
      title: 'Profile & Digital', heading: 'Tell us about your brand', hint: 'The basics, plus where customers find you online.',
      render: ({ f, set }) => (
        <>
          <div style={ui.grid2}>
            <TextInput id="bp-company" label="Brand Name" required value={f.company} onChange={v => set({ company: v })} autoComplete="organization" />
            <TextInput id="bp-name" label="Contact Name" required value={f.name} onChange={v => set({ name: v })} autoComplete="name" />
            <TextInput id="bp-email" label="Work Email" required type="email" inputMode="email" value={f.contactEmail} onChange={v => set({ contactEmail: v })} autoComplete="email" />
            <TextInput id="bp-phone" label="Phone Number" optional type="tel" inputMode="tel" value={f.phoneNumber} onChange={v => set({ phoneNumber: v })} autoComplete="tel" />
          </div>
          <Chips label="E-Commerce Platform" required options={['Shopify', 'Wix', 'Squarespace', 'Amazon Store', 'Custom']} value={f.platform} onChange={v => set({ platform: v })} />
          <TextInput id="bp-site" label="Website URL" required inputMode="url" autoCapitalize="none" autoComplete="url" placeholder="yourbrand.com"
            value={f.websiteUrl} onChange={v => set({ websiteUrl: v })} onBlur={e => set({ websiteUrl: normalizeUrl(e.target.value) })} />
          <SocialPicker idPrefix="bp" value={f.socials} onChange={v => set({ socials: v })} />
        </>
      ),
      validate: (f) => {
        if (!f.company.trim()) return 'Please enter your brand name.';
        const c = contactCheck(f); if (c) return c;
        if (!f.platform) return 'Please select your e-commerce platform.';
        if (!isHttpUrl(normalizeUrl(f.websiteUrl))) return 'Please enter a valid website URL, like yourbrand.com';
        return missingSocial(f.socials);
      },
    },
    {
      title: 'Fit & Revenue', heading: 'Fit & commercial goals', hint: 'Help us route you to the right partnership track.',
      render: ({ f, set }) => (
        <>
          <ChoiceCards label="Partnership Goals" required minWidth={200} value={f.goals} onChange={v => set({ goals: v })} options={[
            { id: GOAL_WHOLESALE, desc: 'Buy The Majorities products at wholesale pricing for your own channels.' },
            { id: GOAL_LISTING, desc: 'List and sell your products on The Majorities Marketplace.' },
            { id: GOAL_ADS, desc: 'Paid campaigns and sponsored visibility across The Duma and the Marketplace.' },
          ]} />
          <div style={ui.grid2}>
            <SelectInput id="bp-cat" label="Product Category" required value={f.productCategory} onChange={v => set({ productCategory: v })} placeholder="Select a category"
              options={['Haircare', 'Skincare', 'Body Care', "Men's Grooming", 'Cosmetics', 'Fragrance', 'Nail Care', 'Wellness', 'Lifestyle']} />
            <SelectInput id="bp-rev" label="Estimated Monthly Revenue" required value={f.monthlyRevenue} onChange={v => set({ monthlyRevenue: v })} placeholder="Select a range"
              options={['Under $10k', '$10k–$50k', '$50k–$250k', '$250k+']} />
            {f.goals.includes(GOAL_ADS) && (
              <TextInput id="bp-budget" label="Advertising Budget (USD)" optional type="number" inputMode="decimal" min="0" placeholder="e.g. 5000" value={f.totalBudget} onChange={v => set({ totalBudget: v })} />
            )}
          </div>
        </>
      ),
      validate: (f) => {
        if (!f.goals.length) return 'Please select at least one partnership goal.';
        if (!f.productCategory) return 'Please select a product category.';
        if (!f.monthlyRevenue) return 'Please select your estimated monthly revenue.';
        if (f.goals.includes(GOAL_ADS) && f.totalBudget.trim() !== '' && !(Number(f.totalBudget) >= 0)) return 'Please enter a valid budget amount, or leave it blank.';
        return '';
      },
    },
    {
      title: 'Verification & Submit', heading: 'Verification & submit', hint: 'Your Tax ID is used only for verification and is never shown publicly.',
      render: ({ f, set }) => (
        <>
          <div style={ui.grid2}>
            <TextInput id="bp-ein" label="Tax ID / EIN" required placeholder="XX-XXXXXXX" value={f.ein} onChange={v => set({ ein: v })} autoComplete="off" />
            <LocationField id="bp-loc" label="Business Location" required value={f.location} onChange={v => set({ location: v })} />
          </div>
          <MediaDrop label="Catalog Samples" photos={f.photos} video={f.video} onChange={m => set(m)} />
        </>
      ),
      validate: (f) => {
        if (!f.ein.trim()) return 'Please enter your Tax ID / EIN.';
        if (!f.location.trim()) return 'Please add your business location.';
        return '';
      },
    },
  ],
  buildPayload: (f, fd) => {
    const website = normalizeUrl(f.websiteUrl);
    const wantsAds = f.goals.includes(GOAL_ADS);
    appendCommon(fd, f, { company: f.company });
    fd.append('ein', f.ein.trim());
    fd.append('websiteOrSocial', website || Object.values(f.socials)[0] || '');
    fd.append('wholesaleInterest', f.goals.includes(GOAL_WHOLESALE));
    fd.append('marketplaceListingInterest', f.goals.includes(GOAL_LISTING));
    fd.append('advertisingInterest', wantsAds);
    fd.append('sponsoredDumaInterest', wantsAds);
    fd.append('sponsoredMarketplaceInterest', wantsAds);
    fd.append('totalBudget', wantsAds ? f.totalBudget.trim() : '');
    fd.append('partnershipGoals', f.goals.join(', '));
    fd.append('ecommercePlatform', f.platform);
    fd.append('websiteUrl', website);
    fd.append('socialChannels', JSON.stringify(f.socials));
    fd.append('productCategory', f.productCategory);
    fd.append('monthlyRevenue', f.monthlyRevenue);
    appendMedia(fd, f);
  },
};

// ── Creator / Influencer ──────────────────────────────────────────────────────
export const CREATOR_TRACK = {
  category: 'Creator / Influencer Partners',
  idPrefix: 'cr',
  draftKey: 'creator_partner_draft',
  draftNote: 'uploads and accepted terms',
  initial: { name: '', contactEmail: '', phoneNumber: '', location: '', socials: {}, followerRange: '',
    contentTypes: [], contentNiches: [], contentPitch: '', photos: [], video: null },
  draftFields: ['name', 'contactEmail', 'phoneNumber', 'location', 'socials', 'followerRange', 'contentTypes', 'contentNiches', 'contentPitch'],
  terms: {
    title: 'Creator Terms',
    items: [
      'You earn 8% of every sale made through your unique referral link or code. Paid monthly, no cap on earnings.',
      'Content you make for The Majorities can be shared across our site, social channels and The Duma, with credit to you.',
      <>Our {POLICY_LINKS.tos} apply.</>,
    ],
  },
  steps: [
    {
      title: 'About You', heading: 'About you', hint: 'Who you are and where your audience follows you.',
      render: ({ f, set }) => (
        <>
          <div style={ui.grid2}>
            <TextInput id="cr-name" label="Full Name" required value={f.name} onChange={v => set({ name: v })} autoComplete="name" />
            <TextInput id="cr-email" label="Email" required type="email" inputMode="email" value={f.contactEmail} onChange={v => set({ contactEmail: v })} autoComplete="email" />
            <TextInput id="cr-phone" label="Phone Number" optional type="tel" inputMode="tel" value={f.phoneNumber} onChange={v => set({ phoneNumber: v })} autoComplete="tel" />
            <LocationField id="cr-loc" label="City" optional placeholder="e.g. Dallas, TX" value={f.location} onChange={v => set({ location: v })} />
          </div>
          <SocialPicker idPrefix="cr" label="Where do you post?" required hint="Pick your channels and add your handle." value={f.socials} onChange={v => set({ socials: v })} />
          <Chips label="Total Followers" required options={['Under 1K', '1K–10K', '10K–50K', '50K–250K', '250K+']} value={f.followerRange} onChange={v => set({ followerRange: v })} />
        </>
      ),
      validate: (f) => {
        const c = contactCheck(f); if (c) return c;
        if (!Object.keys(f.socials).length) return 'Please add at least one social channel.';
        const s = missingSocial(f.socials); if (s) return s;
        if (!f.followerRange) return 'Please select your follower range.';
        return '';
      },
    },
    {
      title: 'Your Content', heading: 'How do you want to create with us?', hint: 'Pick everything that fits. You can do more than one.',
      render: ({ f, set }) => (
        <>
          <ChoiceCards label="Partnership Type" required value={f.contentTypes} onChange={v => set({ contentTypes: v })} options={[
            { id: 'The Duma Creator', badge: 'New', desc: 'Join our verified council: publish reviews, feature products, and lead community discussions on The Duma.' },
            { id: 'Routine Videos', title: 'Routine & Styling Videos', desc: 'Wash day, styling, and grooming routines using our products.' },
            { id: 'Product Experience Videos', title: 'Product Reviews & Unboxings', desc: 'Honest first impressions, before-and-afters, and unboxings.' },
            { id: 'Commercial Pitches', title: 'Commercial & Ad Content', desc: 'Scripted short-form reels and promo spots for our brand.' },
            { id: 'Affiliate', title: 'Affiliate Only', desc: 'Share your code and earn 8% on every referral sale. No content commitment.' },
          ]} />
          <Chips label="What do you cover?" optional multi options={['Natural Hair', 'Locs & Braids', 'Skincare', 'Beard & Grooming', 'Body Care', 'Wellness', 'Lifestyle']}
            value={f.contentNiches} onChange={v => set({ contentNiches: v })} />
          <TextArea id="cr-pitch" label="Your Pitch" required rows={4} placeholder="Your content style, who watches you, and an idea you'd make for The Majorities."
            value={f.contentPitch} onChange={v => set({ contentPitch: v })} />
        </>
      ),
      validate: (f) => {
        if (!f.contentTypes.length) return 'Please choose at least one partnership type.';
        if (!f.contentPitch.trim()) return 'Please add a short pitch.';
        return '';
      },
    },
    {
      title: 'Samples & Submit', heading: 'Show us your work', hint: 'A sample video helps us review faster. A profile photo is optional.',
      render: ({ f, set }) => (
        <MediaDrop label="Sample Video & Profile Photo" hint="1 video that shows your style (your audition reel), plus up to 2 photos." maxImages={2}
          photos={f.photos} video={f.video} onChange={m => set(m)} />
      ),
    },
  ],
  buildPayload: (f, fd) => {
    appendCommon(fd, f, { company: f.name });
    fd.append('websiteOrSocial', Object.values(f.socials)[0] || '');
    fd.append('socialChannels', JSON.stringify(f.socials));
    fd.append('followerRange', f.followerRange);
    fd.append('contentTypes', f.contentTypes.join(', '));
    fd.append('contentNiches', f.contentNiches.join(', '));
    fd.append('contentPitch', f.contentPitch.trim());
    fd.append('commission8Agreed', true);
    appendMedia(fd, f);
  },
};

// ── Venue / Community ─────────────────────────────────────────────────────────
const VENUE_GOALS = [
  { id: 'Product Sampling & Giveaways', desc: 'Free samples for your clients, members, or attendees.' },
  { id: 'Retail Shelf', title: 'Sell Our Products', desc: 'Stock and sell The Majorities at your salon, shop, or venue.' },
  { id: 'Event Sponsorship', desc: 'We sponsor or co-host your event, meetup, or class.' },
  { id: 'Bulk Order', title: 'Bulk Order for an Event', desc: 'A one-time order for gift bags, giveaways, or staff.' },
  { id: 'Duma Feature', title: 'Feature on The Duma', desc: 'Get your space or event featured to our community.' },
];
export const VENUE_TRACK = {
  category: 'Community / Venue Partners',
  idPrefix: 'vn',
  draftKey: 'venue_partner_draft',
  draftNote: 'uploads and accepted terms',
  initial: { company: '', venueType: '', location: '', name: '', contactEmail: '', phoneNumber: '', website: '',
    goals: [], audienceSize: '', nextEventDate: '', eventDetails: '', totalBudget: '', photos: [], video: null },
  draftFields: ['company', 'venueType', 'location', 'name', 'contactEmail', 'phoneNumber', 'website', 'goals', 'audienceSize', 'nextEventDate', 'eventDetails', 'totalBudget'],
  terms: {
    title: 'Community Partner Terms',
    items: [
      'Samples and sponsored products are for your members, clients, or attendees and are not for resale unless agreed in writing.',
      'We may photograph and share partner events and spaces across The Majorities and The Duma, with credit to you.',
      <>Our {POLICY_LINKS.tos} apply.</>,
    ],
  },
  steps: [
    {
      title: 'Your Space', heading: 'Tell us about your space or group', hint: 'Salons, barbershops, run clubs, churches, campus groups, and event organizers.',
      render: ({ f, set }) => (
        <>
          <TextInput id="vn-company" label="Venue / Organization Name" required value={f.company} onChange={v => set({ company: v })} autoComplete="organization" />
          <Chips label="Type" required options={['Salon', 'Barbershop', 'Run Club / Fitness', 'Event Organizer', 'Church / Community Org', 'Campus Group', 'Other']}
            value={f.venueType} onChange={v => set({ venueType: v })} />
          <LocationField id="vn-loc" label="Address" required placeholder="Search your venue or address" value={f.location} onChange={v => set({ location: v })} />
          <div style={ui.grid2}>
            <TextInput id="vn-name" label="Contact Name" required value={f.name} onChange={v => set({ name: v })} autoComplete="name" />
            <TextInput id="vn-email" label="Email" required type="email" inputMode="email" value={f.contactEmail} onChange={v => set({ contactEmail: v })} autoComplete="email" />
            <TextInput id="vn-phone" label="Phone Number" optional type="tel" inputMode="tel" value={f.phoneNumber} onChange={v => set({ phoneNumber: v })} autoComplete="tel" />
            <TextInput id="vn-web" label="Website or Instagram" optional autoCapitalize="none" placeholder="yourvenue.com or @handle" value={f.website} onChange={v => set({ website: v })} />
          </div>
        </>
      ),
      validate: (f) => {
        if (!f.company.trim()) return 'Please enter your venue or organization name.';
        if (!f.venueType) return 'Please choose what type of venue or group you are.';
        if (!f.location.trim()) return 'Please add your address.';
        return contactCheck(f);
      },
    },
    {
      title: 'Partnership', heading: 'What would you like to do together?', hint: 'Pick everything that interests you.',
      render: ({ f, set }) => (
        <>
          <ChoiceCards label="Interested In" required value={f.goals} onChange={v => set({ goals: v })} options={VENUE_GOALS} />
          <Chips label="People you reach per month or event" required options={['Under 50', '50–200', '200–1,000', '1,000+']} value={f.audienceSize} onChange={v => set({ audienceSize: v })} />
          <div style={ui.grid2}>
            <TextInput id="vn-date" label="Next Event Date" optional type="date" value={f.nextEventDate} onChange={v => set({ nextEventDate: v })} />
            <TextInput id="vn-budget" label="Budget (USD)" optional type="number" inputMode="decimal" min="0" placeholder="e.g. 500" value={f.totalBudget} onChange={v => set({ totalBudget: v })} />
          </div>
          <TextArea id="vn-details" label="Tell us more" required rows={3} placeholder="Who comes to your space or events, and what you have in mind."
            value={f.eventDetails} onChange={v => set({ eventDetails: v })} />
        </>
      ),
      validate: (f) => {
        if (!f.goals.length) return 'Please choose at least one way to partner.';
        if (!f.audienceSize) return 'Please select how many people you reach.';
        if (!f.eventDetails.trim()) return 'Please tell us a bit more about your space or event.';
        return '';
      },
    },
    {
      title: 'Photos & Submit', heading: 'Show us your space', hint: 'Photos of your venue or a past event help us review faster.',
      render: ({ f, set }) => <MediaDrop label="Photos or Video" photos={f.photos} video={f.video} onChange={m => set(m)} />,
    },
  ],
  buildPayload: (f, fd) => {
    appendCommon(fd, f, { company: f.company });
    const site = f.website.trim().startsWith('@') ? f.website.trim() : normalizeUrl(f.website);
    fd.append('websiteOrSocial', site);
    fd.append('venueType', f.venueType);
    fd.append('majoritiesRole', f.goals.join(', '));
    fd.append('bulkOrderNeeded', f.goals.includes('Bulk Order'));
    fd.append('audienceSize', f.audienceSize);
    fd.append('nextEventDate', f.nextEventDate);
    fd.append('eventDetails', f.eventDetails.trim());
    fd.append('totalBudget', f.totalBudget.trim());
    appendMedia(fd, f);
  },
};

// ── Marketplace Access ────────────────────────────────────────────────────────
export const MARKETPLACE_TRACK = {
  category: 'Marketplace Access',
  idPrefix: 'mk',
  draftKey: 'marketplace_partner_draft',
  draftNote: 'product photos, imported products, your Tax ID and accepted terms',
  submitLabel: 'Submit Seller Application',
  initial: { company: '', name: '', contactEmail: '', phoneNumber: '', websiteUrl: '', location: '',
    shopifyStore: '', shopifyCatalog: [], shopifySelected: [], shopifySync: true, products: [],
    fulfillmentMethod: '', desiredOrderQuantity: '', whyPartner: '', ein: '' },
  draftFields: ['company', 'name', 'contactEmail', 'phoneNumber', 'websiteUrl', 'location', 'shopifyStore', 'fulfillmentMethod', 'desiredOrderQuantity', 'whyPartner'],
  terms: {
    title: 'Marketplace Seller Terms',
    items: [
      '20% commission on sales completed through The Majorities Marketplace. No listing or setup fees.',
      'Customer Reward program: shoppers earn rank points on your products, funded by The Majorities.',
      <>Orders follow our shipping timelines and return window ({POLICY_LINKS.returns}).</>,
      <>Ownership & title of inventory as set out in our {POLICY_LINKS.tos}.</>,
    ],
  },
  steps: [
    {
      title: 'Your Brand', heading: 'Tell us about your brand', hint: 'Sell your personal care products to The Majorities community.',
      render: ({ f, set }) => (
        <>
          <div style={ui.grid2}>
            <TextInput id="mk-company" label="Brand Name" required value={f.company} onChange={v => set({ company: v })} autoComplete="organization" />
            <TextInput id="mk-name" label="Contact Name" required value={f.name} onChange={v => set({ name: v })} autoComplete="name" />
            <TextInput id="mk-email" label="Work Email" required type="email" inputMode="email" value={f.contactEmail} onChange={v => set({ contactEmail: v })} autoComplete="email" />
            <TextInput id="mk-phone" label="Phone Number" optional type="tel" inputMode="tel" value={f.phoneNumber} onChange={v => set({ phoneNumber: v })} autoComplete="tel" />
            <TextInput id="mk-site" label="Website" optional inputMode="url" autoCapitalize="none" placeholder="yourbrand.com"
              value={f.websiteUrl} onChange={v => set({ websiteUrl: v })} onBlur={e => set({ websiteUrl: normalizeUrl(e.target.value) })} />
            <LocationField id="mk-loc" label="Business Location" required value={f.location} onChange={v => set({ location: v })} />
          </div>
        </>
      ),
      validate: (f) => {
        if (!f.company.trim()) return 'Please enter your brand name.';
        const c = contactCheck(f); if (c) return c;
        if (f.websiteUrl.trim() && !isHttpUrl(normalizeUrl(f.websiteUrl))) return 'Please enter a valid website, like yourbrand.com';
        if (!f.location.trim()) return 'Please add your business location.';
        return '';
      },
    },
    {
      title: 'Products', heading: 'Add your products', hint: 'Import them from Shopify, add them by hand, or both.',
      render: (ctx) => <MarketplaceProductsStep {...ctx} />,
      validate: validateProducts,
    },
    {
      title: 'Fulfillment & Submit', heading: 'Fulfillment & verification', hint: 'Your Tax ID is used only for verification and is never shown publicly.',
      render: ({ f, set }) => (
        <>
          <Chips label="Who ships your orders?" required options={['I ship orders myself', 'Send inventory to The Majorities warehouse', 'Open to either']}
            value={f.fulfillmentMethod} onChange={v => set({ fulfillmentMethod: v })} />
          <div style={ui.grid2}>
            <TextInput id="mk-ein" label="Tax ID / EIN" required placeholder="XX-XXXXXXX" value={f.ein} onChange={v => set({ ein: v })} autoComplete="off" />
            <TextInput id="mk-qty" label="Units you can supply per month" optional type="number" inputMode="numeric" min="0" placeholder="e.g. 200"
              value={f.desiredOrderQuantity} onChange={v => set({ desiredOrderQuantity: v })} />
          </div>
          <TextArea id="mk-why" label="Why will our shoppers love your brand?" optional rows={3} value={f.whyPartner} onChange={v => set({ whyPartner: v })} />
        </>
      ),
      validate: (f) => {
        if (!f.fulfillmentMethod) return 'Please choose who ships your orders.';
        if (!f.ein.trim()) return 'Please enter your Tax ID / EIN.';
        return '';
      },
    },
  ],
  buildPayload: (f, fd) => {
    appendCommon(fd, f, { company: f.company });
    fd.append('ein', f.ein.trim());
    fd.append('websiteOrSocial', normalizeUrl(f.websiteUrl));
    fd.append('fulfillmentMethod', f.fulfillmentMethod);
    fd.append('desiredOrderQuantity', f.desiredOrderQuantity);
    fd.append('whyPartner', f.whyPartner.trim());
    appendProducts(fd, f);
  },
};

// ── Review Request ────────────────────────────────────────────────────────────
const PHYSICAL = ['Restaurant', 'Bar', 'Event'];
export const REVIEW_TRACK = {
  category: 'Review Request',
  idPrefix: 'rv',
  draftKey: 'review_request_draft',
  draftNote: 'uploads and accepted terms',
  submitLabel: 'Submit Review Request',
  initial: { reviewTargetType: '', company: '', reviewAddress: '', websiteLink: '', socialLink: '',
    preferredDate: '', preferredTime: '', name: '', contactEmail: '', phoneNumber: '', sponsored: [], photos: [], video: null },
  draftFields: ['reviewTargetType', 'company', 'reviewAddress', 'websiteLink', 'socialLink', 'preferredDate', 'preferredTime', 'name', 'contactEmail', 'phoneNumber', 'sponsored'],
  terms: {
    title: 'Review Terms & Media Rights Consent',
    items: [
      'The Majorities may photograph and film your venue, event, or product and publish that coverage across The Majorities network.',
      'Reviews are independent and honest. Requesting a review does not guarantee a positive one.',
    ],
  },
  steps: [
    {
      title: 'What to Review', heading: 'What should we review?', hint: 'Restaurants, bars, events, or products.',
      render: ({ f, set }) => {
        const physical = PHYSICAL.includes(f.reviewTargetType);
        return (
          <>
            <Chips label="Type" required options={['Restaurant', 'Bar', 'Event', 'Product']} value={f.reviewTargetType} onChange={v => set({ reviewTargetType: v })} />
            <TextInput id="rv-company" label={f.reviewTargetType ? `${f.reviewTargetType} Name` : 'Name'} required value={f.company} onChange={v => set({ company: v })} />
            {physical ? (
              <LocationField id="rv-addr" label="Address" required placeholder="Search the venue or address" value={f.reviewAddress} onChange={v => set({ reviewAddress: v })} />
            ) : f.reviewTargetType === 'Product' ? (
              <TextInput id="rv-addr" label="Where can we get it?" optional placeholder="Product link, or we'll reach out for shipping" value={f.reviewAddress} onChange={v => set({ reviewAddress: v })} />
            ) : null}
            <div style={ui.grid2}>
              <TextInput id="rv-web" label="Website" required inputMode="url" autoCapitalize="none" placeholder="yourplace.com" value={f.websiteLink}
                onChange={v => set({ websiteLink: v })} onBlur={e => set({ websiteLink: normalizeUrl(e.target.value) })} />
              <TextInput id="rv-social" label="Social Media Link" required inputMode="url" autoCapitalize="none" placeholder="instagram.com/yourplace" value={f.socialLink}
                onChange={v => set({ socialLink: v })} onBlur={e => set({ socialLink: normalizeUrl(e.target.value) })} />
            </div>
          </>
        );
      },
      validate: (f) => {
        if (!f.reviewTargetType) return 'Please choose what you want reviewed.';
        if (!f.company.trim()) return 'Please enter the name.';
        if (PHYSICAL.includes(f.reviewTargetType) && !f.reviewAddress.trim()) return 'Please add the address.';
        if (!isHttpUrl(normalizeUrl(f.websiteLink)) || !isHttpUrl(normalizeUrl(f.socialLink))) return 'Please add a valid website and social media link.';
        return '';
      },
    },
    {
      title: 'Contact & Timing', heading: 'Contact & timing', hint: "We'll use this to schedule the review.",
      render: ({ f, set }) => (
        <>
          <div style={ui.grid2}>
            <TextInput id="rv-date" label={f.reviewTargetType === 'Product' ? 'Best Date to Reach You' : 'Best Date to Visit'} required type="date" value={f.preferredDate} onChange={v => set({ preferredDate: v })} />
            <TextInput id="rv-time" label="Best Time" required type="time" value={f.preferredTime} onChange={v => set({ preferredTime: v })} />
            <TextInput id="rv-name" label="Contact Name" required value={f.name} onChange={v => set({ name: v })} autoComplete="name" />
            <TextInput id="rv-email" label="Email" required type="email" inputMode="email" value={f.contactEmail} onChange={v => set({ contactEmail: v })} autoComplete="email" />
            <TextInput id="rv-phone" label="Phone Number" optional type="tel" inputMode="tel" value={f.phoneNumber} onChange={v => set({ phoneNumber: v })} autoComplete="tel" />
          </div>
          <ChoiceCards value={f.sponsored} onChange={v => set({ sponsored: v })} options={[
            { id: 'Sponsored', title: 'Boost on The Duma (optional add-on)', desc: "Put your review at the top of the feed for local users. We'll send rates once your review is approved." },
          ]} />
        </>
      ),
      validate: (f) => {
        if (!f.preferredDate || !f.preferredTime) return 'Please add the best date and time.';
        return contactCheck(f);
      },
    },
    {
      title: 'Photos & Submit', heading: 'Photos', hint: 'Photos of the place, menu, event, or product help our review team.',
      render: ({ f, set }) => <MediaDrop label="Photos or Video" photos={f.photos} video={f.video} onChange={m => set(m)} />,
    },
  ],
  buildPayload: (f, fd) => {
    fd.append('name', f.name.trim());
    fd.append('contactEmail', f.contactEmail.trim());
    fd.append('phoneNumber', f.phoneNumber.trim());
    fd.append('company', f.company.trim());
    const loc = PHYSICAL.includes(f.reviewTargetType) ? f.reviewAddress.trim() : '';
    const country = countryFromLocation(loc) || 'USA';
    fd.append('location', loc);
    fd.append('countryOfOrigin', country);
    fd.append('operatingCountry', country);
    fd.append('websiteOrSocial', normalizeUrl(f.websiteLink));
    fd.append('reviewTargetType', f.reviewTargetType);
    fd.append('reviewAddress', f.reviewAddress.trim());
    fd.append('preferredDate', f.preferredDate);
    fd.append('preferredTime', f.preferredTime);
    fd.append('websiteLink', normalizeUrl(f.websiteLink));
    fd.append('socialLink', normalizeUrl(f.socialLink));
    fd.append('sponsoredDumaPlacement', f.sponsored.includes('Sponsored'));
    fd.append('reviewTermsAgreed', true);
    appendMedia(fd, f);
  },
};
