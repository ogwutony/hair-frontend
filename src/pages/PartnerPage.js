// src/pages/PartnerPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CredentialHeader } from '../components/CredentialHeader';
import { LocationAutocomplete } from '../components/LocationAutocomplete';
import { BACKEND_URL, getPartnerApplyPoints, WHOLESALE_PARTNER_CATEGORY, partnerCategoryLabel } from '../utils/constants';
import { styles } from '../utils/styles';

// Category values are what the backend validates against; labels are what people see.
const WHOLESALE = WHOLESALE_PARTNER_CATEGORY; // shown as "Wholesale, Distributor, and Retail Partners"
const CREATOR = "Creator / Influencer Partners";
const COMMUNITY = "Community / Venue Partners";
const MARKETPLACE = "Marketplace Access";
const REVIEW_REQUEST = "Review Request";

// Order matters: Wholesale first, Creator second
export const PARTNER_CATEGORIES = [
  { value: WHOLESALE, desc: "Wholesalers, distributors, retailers, and independent brands seeking wholesale pricing, advertising, and sponsored visibility across The Duma and The Majorities Marketplace." },
  { value: CREATOR, desc: "Share honest routines and product experiences through video content. Earn 8% commission on every referral sale you drive." },
  { value: COMMUNITY, desc: "Local Dallas spots — run clubs, barbershops, salons, and event organizers who bring people together." },
  { value: MARKETPLACE, desc: "Gain verified access to sell directly on The Majorities Marketplace." },
  { value: REVIEW_REQUEST, desc: "Request an official review for your restaurant, bar, event, or product." },
];

const REVIEW_TARGET_TYPES = ['Restaurant', 'Bar', 'Event', 'Product'];
const PHYSICAL_REVIEW_TARGETS = ['Restaurant', 'Bar', 'Event'];
const isHttpUrl = (v) => /^https?:\/\/\S+\.\S+/i.test((v || '').trim());

const PRODUCT_TYPE_OPTIONS = [
  'Shampoos', 'Conditioners', 'Oils', 'Face Scrubs',
  'Toners', 'Creams', 'Body Wash', 'Hair Styling', 'Other'
];
export const MAX_PRODUCTS = 10;
const PHOTOS_PER_PRODUCT = 3;

export const PAYMENT_METHODS = ['ACH', 'Credit Card'];
export const PAYMENT_SCHEDULES = ['Pay on order', 'Net 30 payments'];
export const SHIPPING_OPTIONS = [
  { value: 'The Majorities handles shipping', label: 'The Majorities handles shipping' },
  { value: 'Partner handles shipping', label: 'We can handle our own shipping' },
];

export const SOCIAL_PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'X (Twitter)', 'Snapchat', 'Pinterest', 'Twitch'];
export const VIDEO_TYPES = [
  { value: 'Sample of past work', title: 'Sample / past work', desc: 'A video you have already made — a routine, review, or brand collaboration.' },
  { value: 'Direct pitch', title: 'Direct pitch video', desc: 'Record yourself telling us who you are and what you would create for The Majorities.' },
];

const MARKETPLACE_AGREEMENTS = [
  { key: 'customerRewardAgreed', label: 'I agree to the Customer Reward program *' },
  { key: 'commission20AgreedTo', label: 'I agree to the 20% commission structure *' },
  { key: 'shippingReturnsAgreed', label: 'I agree to the Shipping & Returns Policy *' },
  { key: 'ownershipTitleAgreed', label: 'I agree to the Ownership & Title Policy *' },
];

const emptyProduct = () => ({ name: '', category: '', description: '', ingredients: '', photos: [], photoPreviews: [] });
const emptySocials = () => Object.fromEntries(SOCIAL_PLATFORMS.map(p => [p, { url: '', followers: '' }]));

// Responsive rules the inline styles can't express (media queries, grid collapse)
const RESPONSIVE_CSS = `
.pp-page { padding: 32px clamp(16px, 5vw, 60px) 48px; max-width: 1100px; margin: 0 auto; box-sizing: border-box; }
.pp-form { padding: clamp(16px, 4vw, 30px) !important; }
.pp-page input, .pp-page select, .pp-page textarea { font-size: 16px; font-family: inherit; }
.pp-grid { display: grid; grid-template-columns: 1fr; column-gap: 12px; }
.pp-choices { display: grid; grid-template-columns: 1fr; gap: 10px; }
.pp-social-row { display: grid; grid-template-columns: 1fr; gap: 0 10px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
.pp-social-inputs { display: grid; grid-template-columns: minmax(0, 1fr) 120px; gap: 10px; }
.pp-social-inputs input { margin: 4px 0 !important; }
@media (min-width: 640px) {
  .pp-grid { grid-template-columns: 1fr 1fr; }
  .pp-grid > .pp-full { grid-column: 1 / -1; }
  .pp-choices.pp-two { grid-template-columns: 1fr 1fr; }
  .pp-social-row { grid-template-columns: 130px 1fr; align-items: center; }
}
`;

const cardOption = (selected) => ({
  border: `1.5px solid ${selected ? '#1a1a1a' : '#e0e0e0'}`, borderRadius: '10px', padding: '14px 16px',
  display: 'flex', alignItems: 'flex-start', gap: '12px', backgroundColor: selected ? '#f9f9f9' : '#fff',
  cursor: 'pointer', fontSize: '14px', transition: 'border-color 0.2s', minHeight: '44px', boxSizing: 'border-box'
});

// Tappable card for radio/checkbox choices (large touch target on phones)
const ChoiceCard = ({ type = 'radio', name, checked, onChange, title, desc }) => (
  <label style={cardOption(checked)}>
    <input type={type} name={name} checked={checked} onChange={onChange} style={{ marginTop: '3px', flexShrink: 0, width: '18px', height: '18px' }} />
    <div>
      <div style={{ fontWeight: '600', marginBottom: desc ? '3px' : 0 }}>{title}</div>
      {desc && <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>{desc}</div>}
    </div>
  </label>
);

export const PartnerPage = ({ addDumaItem, onAddPoints, userEmail, rankTitle, rankScore, authToken, userAvatar, onWholesaleApproved }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    partnerCategory: WHOLESALE,
    name: "",
    contactEmail: "",
    phoneNumber: "",
    ein: "",
    company: "",
    website: "",
    socialMedia: "",
    address: "",
    countryOfOrigin: "",
    operatingCountry: "",
    // Products (Wholesale + Marketplace)
    products: [emptyProduct()],
    // Payment terms & shipping (Wholesale + Marketplace)
    paymentMethods: [],
    paymentSchedule: "",
    shippingPreference: "",
    // Marketplace fields
    whyPartner: "",
    desiredOrderQuantity: "",
    pricing5Gallon: "",
    standardUnitPrice: "5",
    promotionalUnitPrice: "4",
    commission20AgreedTo: false,
    customerRewardAgreed: false,
    shippingReturnsAgreed: false,
    ownershipTitleAgreed: false,
    // Creator fields
    socialAccounts: emptySocials(),
    contentTypes: [],
    contentPitch: "",
    doneBefore: "",
    experienceDetails: "",
    creatorPhoto: null,
    videoType: "",
    commission8Agreed: false,
    // Community fields
    eventDetails: "",
    majoritiesRole: "",
    bulkOrderNeeded: false,
    // Wholesale & Community fields
    totalBudget: "",
    // Wholesale fields
    advertisingInterest: false,
    wholesaleInterest: false,
    sponsoredDumaInterest: false,
    sponsoredMarketplaceInterest: false,
    // Review Request fields
    reviewTargetType: "Restaurant",
    reviewAddress: "",
    preferredDate: "",
    preferredTime: "",
    sponsoredDumaPlacement: false,
    reviewTermsAgreed: false,
    // Shared media
    photoFiles: [],
    videoFile: null,
    tier: "National Associate"
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [videoPreview, setVideoPreview] = useState(null);
  const [creatorPhotoPreview, setCreatorPhotoPreview] = useState(null);

  const category = formData.partnerCategory;
  const isReviewRequest = category === REVIEW_REQUEST;
  const isCreator = category === CREATOR;
  const isCommunity = category === COMMUNITY;
  const isMarketplace = category === MARKETPLACE;
  const isWholesale = category === WHOLESALE;
  const hasProducts = isWholesale || isMarketplace;
  const einRequired = !isReviewRequest && !isCreator; // individual creators often have no EIN
  const isPhysicalReviewTarget = PHYSICAL_REVIEW_TARGETS.includes(formData.reviewTargetType);

  const userScore = rankScore || 1;
  const canApplyPremium = userScore >= 900000; // Requires "Supreme Lizard King" rank (900,000+ pts)

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const set = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));
  const toggleInList = (key, value) => setFormData(prev => ({
    ...prev,
    [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value]
  }));

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    set('photoFiles', files);
    setPhotoPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      set('videoFile', file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleCreatorPhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      set('creatorPhoto', file);
      setCreatorPhotoPreview(URL.createObjectURL(file));
    }
  };

  const updateProduct = (index, patch) => setFormData(prev => ({
    ...prev,
    products: prev.products.map((p, i) => (i === index ? { ...p, ...patch } : p))
  }));
  const addProduct = () => setFormData(prev => (
    prev.products.length >= MAX_PRODUCTS ? prev : { ...prev, products: [...prev.products, emptyProduct()] }
  ));
  const removeProduct = (index) => setFormData(prev => ({
    ...prev,
    products: prev.products.length === 1 ? [emptyProduct()] : prev.products.filter((_, i) => i !== index)
  }));
  const handleProductPhotos = (index, e) => {
    const files = Array.from(e.target.files).slice(0, PHOTOS_PER_PRODUCT);
    updateProduct(index, { photos: files, photoPreviews: files.map(f => URL.createObjectURL(f)) });
  };

  const updateSocial = (platform, field, value) => setFormData(prev => ({
    ...prev,
    socialAccounts: { ...prev.socialAccounts, [platform]: { ...prev.socialAccounts[platform], [field]: value } }
  }));

  // Products the partner actually started filling in
  const filledProducts = formData.products.filter(p => p.name.trim() || p.description.trim() || p.photos.length);
  const filledSocials = SOCIAL_PLATFORMS
    .map(platform => ({ platform, url: formData.socialAccounts[platform].url.trim(), followers: formData.socialAccounts[platform].followers.trim() }))
    .filter(s => s.url);

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    if (!authToken) return "You must be logged in to submit a partnership application.";

    if (isCreator) {
      if (!formData.name.trim() || !formData.contactEmail.trim()) return "Please enter your full name and business email.";
      if (filledSocials.length === 0) return "Please add at least one social media profile.";
      if (filledSocials.some(s => !s.followers)) return "Please add a follower count for each social media profile you listed.";
      if (!formData.doneBefore) return "Please tell us whether you've done brand partnerships before.";
      if (!formData.creatorPhoto && !formData.videoFile) return "Please upload a picture of yourself or a video.";
      if (formData.videoFile && !formData.videoType) return "Please tell us whether your video is a sample of past work or a direct pitch.";
      if (!formData.commission8Agreed) return "You must agree to the 8% referral commission rate.";
      if (MARKETPLACE_AGREEMENTS.some(({ key }) => !formData[key])) return "You must agree to all policies and agreements.";
      return null;
    }

    if (!formData.name || !formData.contactEmail || !formData.phoneNumber || (einRequired && !formData.ein)) {
      return "Please fill in all contact information fields.";
    }
    if (!formData.company.trim()) return "Please fill in all company information fields.";
    if (isCommunity) {
      if (!formData.address.trim()) return "Please provide your venue address.";
    } else if (!formData.countryOfOrigin || !formData.operatingCountry) {
      return "Please fill in all company information fields.";
    }
    if (hasProducts && !formData.address.trim()) return "Please provide your business address.";

    if (hasProducts) {
      if (filledProducts.length === 0) return "Please add at least one product with photos and a description.";
      for (const [i, p] of filledProducts.entries()) {
        const label = p.name.trim() || `Product ${i + 1}`;
        if (!p.name.trim() || !p.description.trim()) return `Please add a name and description for ${label}.`;
        if (p.photos.length === 0) return `Please upload at least one photo of ${label}.`;
        if (isMarketplace && (!p.category || !p.ingredients.trim())) return `Please add a product type and ingredients for ${label}.`;
      }
      if (formData.paymentMethods.length === 0) return "Please choose at least one payment method (ACH or Credit Card).";
      if (!formData.paymentSchedule) return "Please choose a payment schedule (Pay on order or Net 30).";
      if (!formData.shippingPreference) return "Please tell us who will handle shipping.";
    }

    if (isMarketplace) {
      if (!formData.whyPartner) return "Please tell us why we should partner with you.";
      if (!formData.desiredOrderQuantity) return "Please provide your desired inventory fulfillment quantity.";
      if (!formData.standardUnitPrice || !formData.promotionalUnitPrice) return "Please provide both standard and subscription unit prices.";
    }

    if (isCommunity && (!formData.eventDetails || !formData.majoritiesRole)) {
      return "Please provide event details and the role you want The Majorities to play.";
    }

    if (isWholesale && !formData.advertisingInterest && !formData.wholesaleInterest && !formData.sponsoredDumaInterest && !formData.sponsoredMarketplaceInterest) {
      return "Please select at least one partnership opportunity you are interested in.";
    }

    if (isReviewRequest) {
      if (isPhysicalReviewTarget && !formData.reviewAddress.trim()) return "Please provide the venue or event address.";
      if (!formData.preferredDate || !formData.preferredTime) return "Please provide the best date and time to visit.";
      if (!isHttpUrl(formData.website) || !isHttpUrl(formData.socialMedia)) {
        return "Please provide a valid website link and social media link (starting with https://).";
      }
      if (!formData.reviewTermsAgreed) return "You must agree to the Review Terms & Media Rights Consent.";
    } else if (MARKETPLACE_AGREEMENTS.some(({ key }) => !formData[key])) {
      return isMarketplace ? "You must agree to all marketplace policies and agreements." : "You must agree to all policies and agreements.";
    }

    if (formData.tier === "Premium Partner" && !canApplyPremium) {
      return "Premium Partner status requires Supreme Lizard King rank (900,000+ points) or higher.";
    }
    return null;
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const buildFormData = () => {
    const fd = new FormData();
    fd.append('partnerCategory', category);
    fd.append('name', formData.name.trim());
    fd.append('contactEmail', formData.contactEmail.trim());
    fd.append('tier', formData.tier);
    ['customerRewardAgreed', 'commission20AgreedTo', 'shippingReturnsAgreed', 'ownershipTitleAgreed']
      .forEach(k => { if (!isReviewRequest) fd.append(k, formData[k]); });

    if (isCreator) {
      // Creators skip the company section; their name doubles as the public profile name
      fd.append('company', formData.name.trim());
      fd.append('socialAccounts', JSON.stringify(filledSocials));
      fd.append('socialMedia', filledSocials.map(s => `${s.platform}: ${s.url} (${s.followers} followers)`).join('\n'));
      fd.append('websiteOrSocial', filledSocials[0]?.url || '');
      fd.append('contentTypes', formData.contentTypes.join(', '));
      fd.append('contentPitch', formData.contentPitch);
      fd.append('doneBefore', formData.doneBefore);
      fd.append('experienceDetails', formData.doneBefore === 'Yes' ? formData.experienceDetails : '');
      fd.append('videoType', formData.videoFile ? formData.videoType : '');
      fd.append('commission8Agreed', formData.commission8Agreed);
      if (formData.creatorPhoto) fd.append('creator_photo', formData.creatorPhoto);
      if (formData.videoFile) fd.append('video', formData.videoFile);
      return fd;
    }

    fd.append('phoneNumber', formData.phoneNumber);
    if (!isReviewRequest) fd.append('ein', formData.ein);
    fd.append('company', formData.company.trim());
    fd.append('website', formData.website.trim());
    fd.append('socialMedia', formData.socialMedia.trim());
    fd.append('websiteOrSocial', [formData.website.trim(), formData.socialMedia.trim()].filter(Boolean).join(' | '));
    if (!isCommunity) {
      fd.append('countryOfOrigin', formData.countryOfOrigin);
      fd.append('operatingCountry', formData.operatingCountry);
    }
    if (!isReviewRequest) fd.append('address', formData.address.trim());
    if (isCommunity) {
      fd.append('venueName', formData.company.trim());
      fd.append('venueAddress', formData.address.trim());
    }

    if (hasProducts) {
      fd.append('paymentMethods', formData.paymentMethods.join(', '));
      fd.append('paymentSchedule', formData.paymentSchedule);
      fd.append('shippingPreference', formData.shippingPreference);
      fd.append('products', JSON.stringify(filledProducts.map((p, i) => ({
        name: p.name.trim(),
        ...(isMarketplace ? { category: p.category, ingredients: p.ingredients.trim() } : {}),
        description: p.description.trim(),
        photoFields: p.photos.map((_, j) => `product_photo_${i}_${j}`),
      }))));
      filledProducts.forEach((p, i) => p.photos.forEach((photo, j) => fd.append(`product_photo_${i}_${j}`, photo)));
      if (formData.videoFile) fd.append('video', formData.videoFile);
    } else {
      formData.photoFiles.forEach((f, i) => fd.append(`photo_${i}`, f));
      if (formData.videoFile) fd.append('video', formData.videoFile);
    }

    if (isMarketplace) {
      fd.append('productTypes', [...new Set(filledProducts.map(p => p.category))].join(', '));
      fd.append('productDetails', JSON.stringify(Object.fromEntries(filledProducts.map(p => [p.name.trim(), {
        type: p.category, description: p.description.trim(), ingredients: p.ingredients.trim()
      }]))));
      fd.append('whyPartner', formData.whyPartner);
      fd.append('desiredOrderQuantity', formData.desiredOrderQuantity);
      fd.append('pricing5Gallon', formData.pricing5Gallon);
      fd.append('standardUnitPrice', formData.standardUnitPrice);
      fd.append('promotionalUnitPrice', formData.promotionalUnitPrice);
    } else if (isReviewRequest) {
      fd.append('reviewTargetType', formData.reviewTargetType);
      fd.append('reviewAddress', formData.reviewAddress);
      fd.append('preferredDate', formData.preferredDate);
      fd.append('preferredTime', formData.preferredTime);
      fd.append('websiteLink', formData.website.trim());
      fd.append('socialLink', formData.socialMedia.trim());
      fd.append('sponsoredDumaPlacement', formData.sponsoredDumaPlacement);
      fd.append('reviewTermsAgreed', formData.reviewTermsAgreed);
    } else if (isCommunity) {
      fd.append('eventDetails', formData.eventDetails);
      fd.append('majoritiesRole', formData.majoritiesRole);
      fd.append('bulkOrderNeeded', formData.bulkOrderNeeded);
      fd.append('totalBudget', formData.totalBudget);
    } else if (isWholesale) {
      fd.append('advertisingInterest', formData.advertisingInterest);
      fd.append('wholesaleInterest', formData.wholesaleInterest);
      fd.append('sponsoredDumaInterest', formData.sponsoredDumaInterest);
      fd.append('sponsoredMarketplaceInterest', formData.sponsoredMarketplaceInterest);
      fd.append('totalBudget', formData.totalBudget);
    }
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const problem = validate();
    if (problem) {
      setErrorMsg(problem);
      window.scrollTo?.({ top: 0, behavior: 'smooth' });
      return;
    }

    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/duma/partner`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: buildFormData()
      });
      // The server can answer with non-JSON (e.g. an upload too large for the host) — never treat that as success
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error || `Submission failed (${res.status}). Please try again.`);
        window.scrollTo?.({ top: 0, behavior: 'smooth' });
        return;
      }

      // Application points: Influencer +200, all other partnerships +300
      if (onAddPoints) onAddPoints(getPartnerApplyPoints(category));

      const productPhotoCount = filledProducts.reduce((n, p) => n + p.photos.length, 0);
      // Public item from the server (no EIN or contact details)
      addDumaItem({
        ...(data.item || {}),
        id: data.item?._id || Date.now(),
        type: "Partner",
        submittedBy: userEmail || "anonymous",
        submitterRank: rankTitle || 'Comrade',
        hasPhoto: isCreator ? !!formData.creatorPhoto : hasProducts ? productPhotoCount > 0 : formData.photoFiles.length > 0,
        hasVideo: !!formData.videoFile
      });
      setSubmitted(true);

      // Wholesale applications unlock wholesale access immediately (the server grants it) — go straight there
      if (isWholesale && data.wholesaleApproved) {
        if (onWholesaleApproved) onWholesaleApproved();
        navigate('/wholesale', { state: { fromApplication: true } });
      }
    } catch (err) {
      setErrorMsg("We couldn't reach the server, so your application was not sent. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="pp-page">
        <style>{RESPONSIVE_CSS}</style>
        <div style={{ ...styles.dumaCard, textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>✅</div>
          <h2>Partnership Application Submitted!</h2>
          <p style={{ color: '#666' }}>Your partnership application has been sent to The Majorities' Duma for review.</p>
          <Link to="/duma" style={{ ...styles.authButton, marginTop: '20px', width: 'auto', padding: '12px 24px', textDecoration: 'none', display: 'inline-block' }}>
            View the Duma
          </Link>
        </div>
      </div>
    );
  }

  // ── Small layout pieces ──────────────────────────────────────────────────────
  const sectionStyle = { borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' };
  const fieldLabel = { display: 'block', fontSize: '13px', fontWeight: '600', marginTop: '14px', marginBottom: '6px' };
  const hint = { fontSize: '12px', color: '#666', marginBottom: '12px', lineHeight: '1.5' };
  const checkLabel = { display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer', marginTop: '12px', lineHeight: '1.5' };
  const thumb = { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' };

  let step = 0;
  const Section = ({ title, children }) => {
    step += 1;
    return (
      <div style={sectionStyle}>
        <h3 style={styles.formSectionTitle}>{step}. {title}</h3>
        {children}
      </div>
    );
  };
  // Sections are plain functions rendered inline so inputs keep focus between keystrokes
  const section = (title, body) => Section({ title, children: body });

  const agreements = (
    <>
      {MARKETPLACE_AGREEMENTS.map(({ key, label }) => (
        <label key={key} style={checkLabel}>
          <input type="checkbox" checked={formData[key]} onChange={e => set(key, e.target.checked)} style={{ marginTop: '3px', width: '18px', height: '18px', flexShrink: 0 }} />
          <span>{label}</span>
        </label>
      ))}
    </>
  );

  const previews = (srcs, alt) => srcs.length > 0 && (
    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
      {srcs.map((src, i) => <img key={i} src={src} alt={`${alt} ${i + 1}`} style={thumb} />)}
    </div>
  );

  return (
    <div className="pp-page">
      <style>{RESPONSIVE_CSS}</style>
      <h2 style={{ marginTop: 0 }}>Partner with The Majorities</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Apply to become a partner in The Duma</p>

      {userEmail && rankTitle && (
        <div style={{ marginBottom: '20px' }}>
          <CredentialHeader email={userEmail} rankTitle={rankTitle} rankScore={rankScore} avatarUrl={userAvatar} />
        </div>
      )}

      {errorMsg && <div role="alert" style={styles.errorMsg}>{errorMsg}</div>}

      <form className="pp-form" style={styles.dumaCard} onSubmit={handleSubmit} noValidate>

        {/* ── PARTNERSHIP CATEGORY ─────────────────────────────────────────── */}
        {section('PARTNERSHIP CATEGORY', (
          <div className="pp-choices" role="radiogroup" aria-label="Partnership category">
            {PARTNER_CATEGORIES.map(({ value, desc }) => (
              <ChoiceCard
                key={value}
                name="partnerCategory"
                checked={category === value}
                onChange={() => { set('partnerCategory', value); setErrorMsg(""); }}
                title={partnerCategoryLabel(value)}
                desc={category === value ? desc : null}
              />
            ))}
          </div>
        ))}

        {/* ── CONTACT INFORMATION ──────────────────────────────────────────── */}
        {section(isCreator ? 'BASIC INFORMATION' : 'CONTACT INFORMATION', (
          <div className="pp-grid">
            <input aria-label="Full Name" placeholder="Full Name *" autoComplete="name" style={styles.input} value={formData.name} onChange={e => set('name', e.target.value)} />
            <input aria-label="Business Email" placeholder="Business Email *" type="email" autoComplete="email" style={styles.input} value={formData.contactEmail} onChange={e => set('contactEmail', e.target.value)} />
            {!isCreator && (
              <input aria-label="Phone Number" placeholder="Phone Number *" type="tel" autoComplete="tel" style={styles.input} value={formData.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} />
            )}
            {!isCreator && !isReviewRequest && (
              <input aria-label="EIN" placeholder="EIN (Employer Identification Number) *" style={styles.input} value={formData.ein} onChange={e => set('ein', e.target.value)} />
            )}
          </div>
        ))}

        {/* ── COMPANY / ENTITY INFORMATION (not for creators) ─────────────── */}
        {!isCreator && section('COMPANY / ENTITY INFORMATION', (
          <>
            <input aria-label="Company name" placeholder={isReviewRequest ? "Business / Event / Product Name *" : isCommunity ? "Venue / Organization Name *" : "Company / Brand Name *"} style={styles.input} value={formData.company} onChange={e => set('company', e.target.value)} />

            {!isReviewRequest && (
              <>
                <label style={fieldLabel}>{isCommunity ? 'Venue Address *' : 'Business Address *'}</label>
                <LocationAutocomplete
                  value={formData.address}
                  onChange={address => set('address', address)}
                  placeholder="Start typing your business name or address"
                  style={styles.input}
                />
                <p style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>Pick your business from the suggestions to capture its name and full address.</p>
              </>
            )}

            {isReviewRequest && (
              <>
                <label style={fieldLabel}>What should we review? *</label>
                <select
                  style={{ ...styles.input, appearance: 'auto', backgroundColor: '#fff' }}
                  value={formData.reviewTargetType}
                  onChange={e => set('reviewTargetType', e.target.value)}
                >
                  {REVIEW_TARGET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {isPhysicalReviewTarget ? (
                  <LocationAutocomplete
                    value={formData.reviewAddress}
                    onChange={reviewAddress => set('reviewAddress', reviewAddress)}
                    placeholder="Venue / Event Address *"
                    style={styles.input}
                  />
                ) : (
                  <input
                    placeholder="Shipping Address (for product evaluation) or Digital Access Link"
                    style={styles.input}
                    value={formData.reviewAddress}
                    onChange={e => set('reviewAddress', e.target.value)}
                  />
                )}
                <div className="pp-grid">
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>
                    Best Date to Visit *
                    <input type="date" style={styles.input} value={formData.preferredDate} onChange={e => set('preferredDate', e.target.value)} />
                  </label>
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>
                    Best Time to Visit *
                    <input type="time" style={styles.input} value={formData.preferredTime} onChange={e => set('preferredTime', e.target.value)} />
                  </label>
                </div>
              </>
            )}

            {!isCommunity && (
              <div className="pp-grid">
                <input aria-label="Country of Origin" placeholder="Country of Origin *" style={styles.input} value={formData.countryOfOrigin} onChange={e => set('countryOfOrigin', e.target.value)} />
                <input aria-label="Operating Country" placeholder="Operating Country *" style={styles.input} value={formData.operatingCountry} onChange={e => set('operatingCountry', e.target.value)} />
              </div>
            )}

            <div className="pp-grid">
              <label style={{ ...fieldLabel, marginBottom: 0 }}>
                Website{isReviewRequest ? ' *' : ''}
                <input type="url" inputMode="url" placeholder="https://yourbrand.com" style={styles.input} value={formData.website} onChange={e => set('website', e.target.value)} />
              </label>
              <label style={{ ...fieldLabel, marginBottom: 0 }}>
                Social Media{isReviewRequest ? ' *' : ''}
                <input type="url" inputMode="url" placeholder="https://instagram.com/yourbrand" style={styles.input} value={formData.socialMedia} onChange={e => set('socialMedia', e.target.value)} />
              </label>
            </div>

            {!isReviewRequest && (
              <>
                <p style={{ fontSize: '12px', color: '#888', marginTop: '10px', marginBottom: '8px' }}>
                  Or link your online storefront:
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {[
                    { name: 'Shopify', url: 'https://www.shopify.com', color: '#5C8B3E' },
                    { name: 'Wix', url: 'https://www.wix.com', color: '#FAAD4F' },
                    { name: 'Squarespace', url: 'https://www.squarespace.com', color: '#222222' },
                    { name: 'Amazon', url: 'https://sell.amazon.com', color: '#FF9900' },
                  ].map(({ name, url, color }) => (
                    <a
                      key={name}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '7px 14px', borderRadius: '20px',
                        border: `1.5px solid ${color}`, color: color,
                        fontSize: '13px', fontWeight: '600',
                        textDecoration: 'none', backgroundColor: '#fff',
                      }}
                    >
                      ↗ {name}
                    </a>
                  ))}
                </div>
              </>
            )}
          </>
        ))}

        {/* ── CREATOR: SOCIAL MEDIA ────────────────────────────────────────── */}
        {isCreator && section('SOCIAL MEDIA', (
          <>
            <p style={hint}>Add a link to each platform you post on, with its follower count. Fill in at least one.</p>
            {SOCIAL_PLATFORMS.map(platform => (
              <div key={platform} className="pp-social-row">
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{platform}</div>
                <div className="pp-social-inputs">
                  <input
                    aria-label={`${platform} link`}
                    type="text"
                    inputMode="url"
                    autoCapitalize="none"
                    placeholder="Profile link or @handle"
                    style={styles.input}
                    value={formData.socialAccounts[platform].url}
                    onChange={e => updateSocial(platform, 'url', e.target.value)}
                  />
                  <input
                    aria-label={`${platform} follower count`}
                    inputMode="numeric"
                    placeholder="Followers"
                    style={styles.input}
                    value={formData.socialAccounts[platform].followers}
                    onChange={e => updateSocial(platform, 'followers', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </>
        ))}

        {/* ── CREATOR: CONTENT TYPE ────────────────────────────────────────── */}
        {isCreator && section('CONTENT TYPE', (
          <>
            <p style={hint}>What kind of content would you create for The Majorities? (optional — select all that apply)</p>
            <div className="pp-choices">
              {[
                { id: 'Routine Videos', desc: 'Step-by-step hair and grooming routines — wash day, styling, maintenance.' },
                { id: 'Product Experience Videos', desc: 'Honest first impressions, reviews, before-and-afters, and unboxings.' },
                { id: 'Commercial Pitches', desc: 'Scripted or ad-style short-form content — reels, spots, and promos.' }
              ].map(({ id, desc }) => (
                <ChoiceCard key={id} type="checkbox" checked={formData.contentTypes.includes(id)} onChange={() => toggleInList('contentTypes', id)} title={id} desc={desc} />
              ))}
            </div>
          </>
        ))}

        {/* ── CREATOR: EXPERIENCE & MEDIA ──────────────────────────────────── */}
        {isCreator && section('EXPERIENCE & MEDIA', (
          <>
            <label style={{ ...fieldLabel, marginTop: 0 }}>Have you done this before? *</label>
            <div className="pp-choices pp-two" role="radiogroup" aria-label="Have you done this before?">
              <ChoiceCard name="doneBefore" checked={formData.doneBefore === 'Yes'} onChange={() => set('doneBefore', 'Yes')} title="Yes" desc="I've partnered with brands or made sponsored content." />
              <ChoiceCard name="doneBefore" checked={formData.doneBefore === 'No'} onChange={() => set('doneBefore', 'No')} title="No" desc="This would be my first brand partnership." />
            </div>
            {formData.doneBefore === 'Yes' && (
              <textarea
                placeholder="Tell us about your past partnerships (brands, campaigns, results) — optional"
                style={{ ...styles.input, height: '90px', marginTop: '12px' }}
                value={formData.experienceDetails}
                onChange={e => set('experienceDetails', e.target.value)}
              />
            )}

            <p style={{ ...hint, marginTop: '18px', marginBottom: '4px', color: '#1a1a1a', fontWeight: '600', fontSize: '13px' }}>
              Upload a picture of yourself or a video * <span style={{ fontWeight: 400, color: '#666' }}>(at least one)</span>
            </p>

            <label style={fieldLabel}>Picture of Yourself</label>
            <input type="file" accept="image/*" style={styles.input} onChange={handleCreatorPhoto} />
            {creatorPhotoPreview && <img src={creatorPhotoPreview} alt="Your upload" style={{ ...thumb, width: '110px', height: '110px' }} />}

            <label style={fieldLabel}>Video</label>
            <div className="pp-choices pp-two" role="radiogroup" aria-label="Video type">
              {VIDEO_TYPES.map(({ value, title, desc }) => (
                <ChoiceCard key={value} name="videoType" checked={formData.videoType === value} onChange={() => set('videoType', value)} title={title} desc={desc} />
              ))}
            </div>
            <input type="file" accept="video/*" style={{ ...styles.input, marginTop: '12px' }} onChange={handleVideoChange} />
            {videoPreview && <video src={videoPreview} style={{ width: '100%', maxWidth: '260px', marginTop: '10px', borderRadius: '8px' }} controls playsInline />}

            <textarea
              placeholder="Anything else you'd like us to know? (optional)"
              style={{ ...styles.input, height: '80px', marginTop: '16px' }}
              value={formData.contentPitch}
              onChange={e => set('contentPitch', e.target.value)}
            />
          </>
        ))}

        {/* ── WHOLESALE: OPPORTUNITIES ─────────────────────────────────────── */}
        {isWholesale && section('PARTNERSHIP OPPORTUNITIES & BUDGET', (
          <>
            <p style={hint}>Select all partnership opportunities you're interested in:</p>
            <div className="pp-choices pp-two">
              {[
                { key: 'wholesaleInterest', title: 'Wholesale & Distribution Orders', desc: 'Purchase The Majorities products in bulk at wholesale pricing for resale or distribution through your own channels.' },
                { key: 'advertisingInterest', title: 'Advertising Campaigns', desc: 'Run paid ads and co-branded campaigns across The Majorities channels and audience network.' },
                { key: 'sponsoredDumaInterest', title: 'Sponsored Placements in The Duma', desc: 'Verified brand visibility and native sponsored content placements inside The Duma community.' },
                { key: 'sponsoredMarketplaceInterest', title: 'Sponsored Placements on The Marketplace', desc: 'Featured product slots and promoted listings on The Majorities Marketplace.' }
              ].map(({ key, title, desc }) => (
                <ChoiceCard key={key} type="checkbox" checked={formData[key]} onChange={e => set(key, e.target.checked)} title={title} desc={desc} />
              ))}
            </div>
            <label style={fieldLabel}>Total Budget</label>
            <input type="number" inputMode="decimal" placeholder="Enter your total budget" style={styles.input} value={formData.totalBudget} onChange={e => set('totalBudget', e.target.value)} />
          </>
        ))}

        {/* ── PRODUCTS (Wholesale + Marketplace) ───────────────────────────── */}
        {hasProducts && section(isMarketplace ? 'PRODUCT DETAILS & MEDIA' : 'PRODUCTS & MEDIA', (
          <>
            <p style={hint}>
              Upload pictures of your products with a description of each. You can add up to {MAX_PRODUCTS} products
              (up to {PHOTOS_PER_PRODUCT} photos each).
            </p>
            {formData.products.map((product, index) => (
              <div key={index} style={{ border: '1.5px solid #d0d0d0', borderRadius: '12px', padding: '14px', marginBottom: '14px', backgroundColor: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Product {index + 1}</h4>
                  {(formData.products.length > 1 || product.name || product.description || product.photos.length > 0) && (
                    <button type="button" onClick={() => removeProduct(index)} style={{ background: 'none', border: 'none', color: '#b00020', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: '8px 4px' }}>
                      Remove
                    </button>
                  )}
                </div>
                <div className="pp-grid">
                  <input aria-label={`Product ${index + 1} name`} placeholder="Product Name *" style={styles.input} value={product.name} onChange={e => updateProduct(index, { name: e.target.value })} />
                  {isMarketplace && (
                    <select aria-label={`Product ${index + 1} type`} style={{ ...styles.input, appearance: 'auto', backgroundColor: '#fff' }} value={product.category} onChange={e => updateProduct(index, { category: e.target.value })}>
                      <option value="">Product Type *</option>
                      {PRODUCT_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  )}
                </div>
                <textarea aria-label={`Product ${index + 1} description`} placeholder="Product Description *" style={{ ...styles.input, height: '80px' }} value={product.description} onChange={e => updateProduct(index, { description: e.target.value })} />
                {isMarketplace && (
                  <textarea aria-label={`Product ${index + 1} ingredients`} placeholder="Ingredients *" style={{ ...styles.input, height: '70px' }} value={product.ingredients} onChange={e => updateProduct(index, { ingredients: e.target.value })} />
                )}
                <label style={{ ...fieldLabel, marginTop: '8px' }}>Product Photos * (up to {PHOTOS_PER_PRODUCT})</label>
                <input aria-label={`Product ${index + 1} photos`} type="file" accept="image/*" multiple style={styles.input} onChange={e => handleProductPhotos(index, e)} />
                {previews(product.photoPreviews, `${product.name || `Product ${index + 1}`} photo`)}
              </div>
            ))}
            {formData.products.length < MAX_PRODUCTS ? (
              <button type="button" onClick={addProduct} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px dashed #1a1a1a', backgroundColor: '#fff', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                + Add another product ({formData.products.length}/{MAX_PRODUCTS})
              </button>
            ) : (
              <p style={{ fontSize: '12px', color: '#888' }}>You've added the maximum of {MAX_PRODUCTS} products.</p>
            )}

            <label style={fieldLabel}>Brand or Product Video (optional)</label>
            <input type="file" accept="video/*" style={styles.input} onChange={handleVideoChange} />
            {videoPreview && <video src={videoPreview} style={{ width: '100%', maxWidth: '260px', marginTop: '10px', borderRadius: '8px' }} controls playsInline />}

            {isMarketplace && (
              <textarea
                placeholder="Why should we partner with you? *"
                style={{ ...styles.input, height: '100px', marginTop: '14px' }}
                value={formData.whyPartner}
                onChange={e => set('whyPartner', e.target.value)}
              />
            )}
          </>
        ))}

        {/* ── PAYMENT TERMS & SHIPPING (Wholesale + Marketplace) ───────────── */}
        {hasProducts && section('PAYMENT TERMS & SHIPPING', (
          <>
            <label style={{ ...fieldLabel, marginTop: 0 }}>Payment Methods * <span style={{ fontWeight: 400, color: '#666' }}>(select all that apply)</span></label>
            <div className="pp-choices pp-two">
              {PAYMENT_METHODS.map(method => (
                <ChoiceCard key={method} type="checkbox" checked={formData.paymentMethods.includes(method)} onChange={() => toggleInList('paymentMethods', method)} title={method} />
              ))}
            </div>
            <label style={fieldLabel}>Payment Schedule *</label>
            <div className="pp-choices pp-two" role="radiogroup" aria-label="Payment schedule">
              {PAYMENT_SCHEDULES.map(schedule => (
                <ChoiceCard key={schedule} name="paymentSchedule" checked={formData.paymentSchedule === schedule} onChange={() => set('paymentSchedule', schedule)} title={schedule} />
              ))}
            </div>
            <label style={fieldLabel}>Do you want The Majorities to handle shipping or can you handle shipping? *</label>
            <div className="pp-choices pp-two" role="radiogroup" aria-label="Shipping preference">
              {SHIPPING_OPTIONS.map(({ value, label }) => (
                <ChoiceCard key={value} name="shippingPreference" checked={formData.shippingPreference === value} onChange={() => set('shippingPreference', value)} title={label} />
              ))}
            </div>
          </>
        ))}

        {/* ── COMMUNITY: EVENT DETAILS ─────────────────────────────────────── */}
        {isCommunity && section('EVENT DETAILS & BUDGET', (
          <>
            <textarea
              placeholder="Tell us about your space or upcoming event — location, audience, and what you're organizing *"
              style={{ ...styles.input, height: '90px' }}
              value={formData.eventDetails}
              onChange={e => set('eventDetails', e.target.value)}
            />
            <textarea
              placeholder="What role do you want The Majorities to play at your event or venue? *"
              style={{ ...styles.input, height: '80px' }}
              value={formData.majoritiesRole}
              onChange={e => set('majoritiesRole', e.target.value)}
            />
            <label style={fieldLabel}>Total Budget</label>
            <input type="number" inputMode="decimal" placeholder="Enter your total budget" style={styles.input} value={formData.totalBudget} onChange={e => set('totalBudget', e.target.value)} />
            <label style={checkLabel}>
              <input type="checkbox" checked={formData.bulkOrderNeeded} onChange={e => set('bulkOrderNeeded', e.target.checked)} style={{ width: '18px', height: '18px', flexShrink: 0 }} />
              <span>We are interested in a one-time bulk order for our event</span>
            </label>
          </>
        ))}

        {/* ── REVIEW REQUEST: PLACEMENT ────────────────────────────────────── */}
        {isReviewRequest && section('PLACEMENT', (
          <ChoiceCard
            type="checkbox"
            checked={formData.sponsoredDumaPlacement}
            onChange={e => set('sponsoredDumaPlacement', e.target.checked)}
            title="Sponsored Placements in The Duma (Optional Add-on)"
            desc="Boost your review to top-of-feed for local users in your city. Our team will contact you with local placement rates once your review is approved."
          />
        ))}

        {/* ── MEDIA (Community + Review Request) ───────────────────────────── */}
        {(isCommunity || isReviewRequest) && section('MEDIA', (
          <>
            <p style={hint}>
              {isReviewRequest
                ? "Upload high-res photos or promotional videos of your venue, menu, event, or product (or a promotional flyer) to help our review team."
                : "Upload photos or videos of your venue or events."}
            </p>
            <label style={{ ...fieldLabel, marginTop: 0 }}>Photo Upload (up to 3)</label>
            <input type="file" accept="image/*" multiple style={styles.input} onChange={handlePhotosChange} />
            {previews(photoPreviews, 'Preview')}
            <label style={fieldLabel}>Video Upload</label>
            <input type="file" accept="video/*" style={styles.input} onChange={handleVideoChange} />
            {videoPreview && <video src={videoPreview} style={{ width: '100%', maxWidth: '260px', marginTop: '10px', borderRadius: '8px' }} controls playsInline />}
          </>
        ))}

        {/* ── MARKETPLACE: LOGISTICS & REVENUE ─────────────────────────────── */}
        {isMarketplace && section('LOGISTICS', (
          <div className="pp-grid">
            <label style={{ ...fieldLabel, marginTop: 0 }}>
              Fulfillment Quantity *
              <input placeholder="Quantity" type="number" inputMode="numeric" min="200" style={styles.input} value={formData.desiredOrderQuantity} onChange={e => set('desiredOrderQuantity', e.target.value)} />
              <span style={{ fontSize: '11px', color: '#999', fontWeight: 400 }}>Minimum 200 units</span>
            </label>
            <label style={{ ...fieldLabel, marginTop: 0 }}>
              Pricing for 5-gallon units (optional)
              <input placeholder="Bulk 5-gallon pricing" style={styles.input} value={formData.pricing5Gallon} onChange={e => set('pricing5Gallon', e.target.value)} />
            </label>
          </div>
        ))}

        {isMarketplace && section('REVENUE AGREEMENT', (
          <>
            <div className="pp-grid">
              <label style={{ ...fieldLabel, marginTop: 0 }}>
                One-time Unit Price *
                <input inputMode="decimal" placeholder="e.g., 5" style={styles.input} value={formData.standardUnitPrice} onChange={e => set('standardUnitPrice', e.target.value)} />
              </label>
              <label style={{ ...fieldLabel, marginTop: 0 }}>
                Subscription Unit Price *
                <input inputMode="decimal" placeholder="e.g., 4" style={styles.input} value={formData.promotionalUnitPrice} onChange={e => set('promotionalUnitPrice', e.target.value)} />
              </label>
            </div>
            {agreements}
          </>
        ))}

        {/* ── CREATOR COMMISSION + AGREEMENTS ──────────────────────────────── */}
        {isCreator && section('COMMISSION & AGREEMENTS', (
          <>
            <div style={{ backgroundColor: '#f5f5f5', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px', fontSize: '13px', lineHeight: '1.6', color: '#444' }}>
              <strong>8% Referral Commission</strong> — You earn 8% of every sale made through your unique referral link or code. Commissions are tracked and paid out on a monthly basis. No cap on earnings.
            </div>
            <label style={{ ...checkLabel, marginTop: '4px' }}>
              <input type="checkbox" checked={formData.commission8Agreed} onChange={e => set('commission8Agreed', e.target.checked)} style={{ marginTop: '3px', width: '18px', height: '18px', flexShrink: 0 }} />
              <span>I agree to an 8% commission rate on all successful referrals *</span>
            </label>
            {agreements}
          </>
        ))}

        {/* ── WHOLESALE & COMMUNITY AGREEMENTS ─────────────────────────────── */}
        {(isWholesale || isCommunity) && section('AGREEMENTS', agreements)}

        {/* ── REVIEW REQUEST AGREEMENT ─────────────────────────────────────── */}
        {isReviewRequest && section('AGREEMENT', (
          <label style={{ ...checkLabel, marginTop: '4px' }}>
            <input type="checkbox" checked={formData.reviewTermsAgreed} onChange={e => set('reviewTermsAgreed', e.target.checked)} style={{ marginTop: '3px', width: '18px', height: '18px', flexShrink: 0 }} />
            <span>I agree to the Review Terms &amp; Media Rights Consent, granting The Majorities permission to photograph and film the venue, event, or product and to publish that coverage across The Majorities network *</span>
          </label>
        ))}

        {/* ── PARTNER TIER ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>PARTNER TIER</h3>
          <div style={{ display: 'flex', gap: '10px 20px', marginTop: '10px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer', minHeight: '44px' }}>
              <input type="radio" name="tier" value="National Associate" checked={formData.tier === "National Associate"} onChange={e => set('tier', e.target.value)} />
              National Associate
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: canApplyPremium ? 'pointer' : 'not-allowed', opacity: canApplyPremium ? 1 : 0.5, minHeight: '44px' }}>
              <input type="radio" name="tier" value="Premium Partner" checked={formData.tier === "Premium Partner"} disabled={!canApplyPremium} onChange={e => set('tier', e.target.value)} />
              <span>Premium Partner {!canApplyPremium && <span style={{ fontSize: '11px', color: '#aaa' }}>(Supreme Lizard King rank+ only)</span>}</span>
            </label>
          </div>
        </div>

        {/* ── SUBMISSION ─────────────────────────────────────────────────── */}
        {!authToken ? (
          <div style={{ marginTop: '30px', padding: '24px 16px', border: '1.5px solid #e0e0e0', borderRadius: '12px', textAlign: 'center', backgroundColor: '#fafafa' }}>
            <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>Ready to Apply?</h4>
            <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>You must have a registered account to submit a partnership application.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/login" style={{ ...styles.authButton, textDecoration: 'none', display: 'inline-block', padding: '12px 28px', width: 'auto' }}>
                Log In
              </Link>
              <Link
                to="/signup"
                style={{
                  ...styles.authButton,
                  textDecoration: 'none', display: 'inline-block', padding: '12px 28px', width: 'auto',
                  backgroundColor: '#fff', color: '#1a1a1a', border: '1.5px solid #1a1a1a'
                }}
              >
                Create Account
              </Link>
            </div>
          </div>
        ) : (
          <button type="submit" disabled={submitting} style={{ ...styles.authButton, marginTop: '20px', padding: '14px', fontSize: '15px', opacity: submitting ? 0.6 : 1, cursor: submitting ? 'wait' : 'pointer' }}>
            {submitting ? "Submitting..." : isReviewRequest ? "Submit Review Request" : "Submit Partnership Application"}
          </button>
        )}
      </form>
    </div>
  );
};
