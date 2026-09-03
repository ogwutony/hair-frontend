// src/pages/PartnerPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CredentialHeader } from '../components/CredentialHeader';
import { GuestSubmissionPrompt } from '../components/GuestSubmissionPrompt';
import { BACKEND_URL } from '../utils/constants';
import { isPolitburoOrHigher } from '../utils/helpers';
import { styles } from '../utils/styles';

export const PartnerPage = ({ addDumaItem, userEmail, rankTitle, rankScore, authToken, userAvatar }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    partnerCategory: "Brand & Retail Partners",
    name: "",
    contactEmail: "",
    phoneNumber: "",
    ein: "",
    company: "",
    websiteOrSocial: "",
    countryOfOrigin: "",
    operatingCountry: "",
    // Marketplace fields
    productType: "",
    productDescription: "",
    whyPartner: "",
    unitsOf34Oz: "500",
    desiredOrderQuantity: "",
    pricing5Gallon: "",
    standardUnitPrice: "5",
    promotionalUnitPrice: "4",
    commission25AgreedTo: false,
    customerRewardAgreed: false,
    shippingReturnsAgreed: false,
    ownershipTitleAgreed: false,
    // Creator fields
    contentTypes: [],          // ["Routine Videos", "Product Experience Videos", "Commercial Pitches"]
    contentPitch: "",
    commission8Agreed: false,
    // Community fields
    eventDetails: "",
    majoritiesRole: "",
    bulkOrderNeeded: false,
    // Brand fields
    advertisingInterest: false,
    wholesaleInterest: false,
    sponsoredDumaInterest: false,
    sponsoredMarketplaceInterest: false,
    // Shared Media
    photoFile: null,
    videoFile: null,
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

  const toggleContentType = (type) => {
    const current = formData.contentTypes;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    setFormData({...formData, contentTypes: updated});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setShowGuestPrompt(false);

    // Global Validations
    if (!formData.name || !formData.contactEmail || !formData.phoneNumber || !formData.ein) {
      setErrorMsg("Please fill in all contact information fields.");
      return;
    }
    if (!formData.company || !formData.countryOfOrigin || !formData.operatingCountry) {
      setErrorMsg("Please fill in all company information fields.");
      return;
    }

    // Category-Specific Validations
    if (formData.partnerCategory === "Marketplace Access") {
      if (!formData.productType || !formData.productDescription || !formData.whyPartner) {
        setErrorMsg("Please fill in all product details.");
        return;
      }
      if (!formData.desiredOrderQuantity) {
        setErrorMsg("Please provide your desired inventory fulfillment quantity.");
        return;
      }
      if (!formData.standardUnitPrice || !formData.promotionalUnitPrice) {
        setErrorMsg("Please provide both standard and promotional unit prices.");
        return;
      }
      if (!formData.commission25AgreedTo || !formData.shippingReturnsAgreed || !formData.ownershipTitleAgreed || !formData.customerRewardAgreed) {
        setErrorMsg("You must agree to all marketplace policies and agreements.");
        return;
      }
    }

    if (formData.partnerCategory === "Creator / Influencer Partners") {
      if (formData.contentTypes.length === 0) {
        setErrorMsg("Please select at least one content type.");
        return;
      }
      if (!formData.contentPitch) {
        setErrorMsg("Please share your pitch details.");
        return;
      }
      if (!formData.commission8Agreed) {
        setErrorMsg("You must agree to the 8% referral commission rate.");
        return;
      }
    }

    if (formData.partnerCategory === "Community / Venue Partners") {
      if (!formData.eventDetails || !formData.majoritiesRole) {
        setErrorMsg("Please provide event details and the role you want The Majorities to play.");
        return;
      }
    }

    if (formData.partnerCategory === "Brand & Retail Partners") {
      if (!formData.advertisingInterest && !formData.wholesaleInterest && !formData.sponsoredDumaInterest && !formData.sponsoredMarketplaceInterest) {
        setErrorMsg("Please select at least one brand opportunity you are interested in.");
        return;
      }
    }

    // Tier Validation
    if (formData.tier === "Premium Partner" && !canApplyPremium) {
      setErrorMsg("Premium Partner status requires Politburo rank or higher.");
      return;
    }

    if (!authToken) {
      setShowGuestPrompt(true);
      return;
    }

    try {
      const formDataObj = new FormData();
      formDataObj.append('partnerCategory', formData.partnerCategory);
      formDataObj.append('name', formData.name);
      formDataObj.append('contactEmail', formData.contactEmail);
      formDataObj.append('phoneNumber', formData.phoneNumber);
      formDataObj.append('ein', formData.ein);
      formDataObj.append('company', formData.company);
      formDataObj.append('websiteOrSocial', formData.websiteOrSocial);
      formDataObj.append('countryOfOrigin', formData.countryOfOrigin);
      formDataObj.append('operatingCountry', formData.operatingCountry);
      formDataObj.append('tier', formData.tier);
      if (formData.photoFile) formDataObj.append('photo', formData.photoFile);
      if (formData.videoFile) formDataObj.append('video', formData.videoFile);

      if (formData.partnerCategory === "Marketplace Access") {
        formDataObj.append('productType', formData.productType);
        formDataObj.append('productDescription', formData.productDescription);
        formDataObj.append('whyPartner', formData.whyPartner);
        formDataObj.append('unitsOf34Oz', formData.unitsOf34Oz);
        formDataObj.append('desiredOrderQuantity', formData.desiredOrderQuantity);
        formDataObj.append('pricing5Gallon', formData.pricing5Gallon);
        formDataObj.append('standardUnitPrice', formData.standardUnitPrice);
        formDataObj.append('promotionalUnitPrice', formData.promotionalUnitPrice);
      } else if (formData.partnerCategory === "Creator / Influencer Partners") {
        formDataObj.append('contentTypes', formData.contentTypes.join(', '));
        formDataObj.append('contentPitch', formData.contentPitch);
      } else if (formData.partnerCategory === "Community / Venue Partners") {
        formDataObj.append('eventDetails', formData.eventDetails);
        formDataObj.append('majoritiesRole', formData.majoritiesRole);
        formDataObj.append('bulkOrderNeeded', formData.bulkOrderNeeded);
      } else if (formData.partnerCategory === "Brand & Retail Partners") {
        formDataObj.append('advertisingInterest', formData.advertisingInterest);
        formDataObj.append('wholesaleInterest', formData.wholesaleInterest);
        formDataObj.append('sponsoredDumaInterest', formData.sponsoredDumaInterest);
        formDataObj.append('sponsoredMarketplaceInterest', formData.sponsoredMarketplaceInterest);
      }

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
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🤝</div>
          <h2>Partnership Application Submitted!</h2>
          <p style={{ color: '#666' }}>Your partnership application has been sent to The Majorities' Duma for review.</p>
          <Link to="/duma" style={{ ...styles.authButton, marginTop: '20px', width: 'auto', padding: '12px 24px', textDecoration: 'none', display: 'inline-block' }}>View the Duma</Link>
        </div>
      </div>
    );
  }

  // ─── Shared checkbox style ───────────────────────────────────────────────────
  const checkLabel = { display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer', marginTop: '12px' };
  const cardOption = {
    border: '1.5px solid #e0e0e0',
    borderRadius: '10px',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'border-color 0.2s'
  };

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2>Partner with The Majorities</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Apply to become a partner in The Duma</p>

      {userEmail && rankTitle && (
        <div style={{ marginBottom: '20px' }}>
          <CredentialHeader email={userEmail} rankTitle={rankTitle} rankScore={rankScore} avatarUrl={userAvatar} />
        </div>
      )}

      {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}
      {showGuestPrompt && <GuestSubmissionPrompt message="Log in or register to submit this partnership application to The Duma." />}

      <form style={styles.dumaCard} onSubmit={handleSubmit}>

        {/* ── SECTION 1: PARTNERSHIP CATEGORY ───────────────────────────────── */}
        <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>1. PARTNERSHIP CATEGORY</h3>
          <select
            style={{ ...styles.input, appearance: 'auto', backgroundColor: '#fff' }}
            value={formData.partnerCategory}
            onChange={e => setFormData({...formData, partnerCategory: e.target.value})}
          >
            <option value="Creator / Influencer Partners">Creator / Influencer Partners</option>
            <option value="Community / Venue Partners">Community / Venue Partners</option>
            <option value="Brand & Retail Partners">Brand &amp; Retail Partners</option>
            <option value="Marketplace Access">Marketplace Access</option>
          </select>

          {/* Category description pills */}
          <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', lineHeight: '1.6' }}>
            {formData.partnerCategory === "Creator / Influencer Partners" &&
              "Share honest routines and product experiences through video content. Earn 8% commission on every referral sale you drive."}
            {formData.partnerCategory === "Community / Venue Partners" &&
              "Local Dallas spots — run clubs, barbershops, salons, and event organizers who bring people together."}
            {formData.partnerCategory === "Brand & Retail Partners" &&
              "Independent beauty and grooming brands seeking advertising, wholesale access, and verified sponsored visibility across The Duma and The Majorities Marketplace."}
            {formData.partnerCategory === "Marketplace Access" &&
              "Gain verified access to sell directly on The Majorities Marketplace."}
          </p>
        </div>

        {/* ── SECTION 2: CONTACT INFORMATION (always visible) ───────────────── */}
        <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>2. CONTACT INFORMATION</h3>
          <input required placeholder="Full Name *" style={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input required placeholder="Business Email *" type="email" style={styles.input} value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
          <input required placeholder="Phone Number *" style={styles.input} value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
          <input required placeholder="EIN (Employer Identification Number) *" style={styles.input} value={formData.ein} onChange={e => setFormData({...formData, ein: e.target.value})} />
        </div>

        {/* ── SECTION 3: COMPANY / ENTITY INFO (always visible) ─────────────── */}
        <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>3. COMPANY / ENTITY INFORMATION</h3>
          <input required placeholder="Company / Brand / Profile Name *" style={styles.input} value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
          <input required placeholder="Country of Origin *" style={styles.input} value={formData.countryOfOrigin} onChange={e => setFormData({...formData, countryOfOrigin: e.target.value})} />
          <input required placeholder="Operating Country *" style={styles.input} value={formData.operatingCountry} onChange={e => setFormData({...formData, operatingCountry: e.target.value})} />
          <input placeholder="Website or Social Media Link" style={styles.input} value={formData.websiteOrSocial} onChange={e => setFormData({...formData, websiteOrSocial: e.target.value})} />
        </div>

        {/* ── SECTION 4 — MARKETPLACE ACCESS ────────────────────────────────── */}
        {formData.partnerCategory === "Marketplace Access" && (
          <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
            <h3 style={styles.formSectionTitle}>4. PRODUCT DETAILS</h3>
            <input required placeholder="Product Type *" style={styles.input} value={formData.productType} onChange={e => setFormData({...formData, productType: e.target.value})} />
            <textarea required placeholder="Product Description *" style={{ ...styles.input, height: '80px' }} value={formData.productDescription} onChange={e => setFormData({...formData, productDescription: e.target.value})} />
            <textarea required placeholder="Why should we partner with you? *" style={{ ...styles.input, height: '100px' }} value={formData.whyPartner} onChange={e => setFormData({...formData, whyPartner: e.target.value})} />
          </div>
        )}

        {/* ── SECTION 4 — CREATOR / INFLUENCER ─────────────────────────────── */}
        {formData.partnerCategory === "Creator / Influencer Partners" && (
          <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
            <h3 style={styles.formSectionTitle}>4. CONTENT TYPE & PITCH</h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '14px' }}>
              Select the types of content you create for The Majorities (select all that apply):
            </p>

            {/* Content type cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {[
                {
                  id: 'Routine Videos',
                  icon: '🎬',
                  title: 'Routine Videos',
                  desc: 'Step-by-step hair and grooming routines using The Majorities products — wash day, styling, maintenance.'
                },
                {
                  id: 'Product Experience Videos',
                  icon: '✨',
                  title: 'Product Experience Videos',
                  desc: 'Honest first impressions, reviews, before-and-afters, and unboxings that showcase real results.'
                },
                {
                  id: 'Commercial Pitches',
                  icon: '📣',
                  title: 'Commercial Pitches',
                  desc: 'Scripted or ad-style short-form content — reels, spots, and brand-forward promotional videos.'
                }
              ].map(({ id, icon, title, desc }) => {
                const selected = formData.contentTypes.includes(id);
                return (
                  <label
                    key={id}
                    style={{
                      ...cardOption,
                      borderColor: selected ? '#1a1a1a' : '#e0e0e0',
                      backgroundColor: selected ? '#f9f9f9' : '#fff'
                    }}
                    onClick={() => toggleContentType(id)}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleContentType(id)}
                      style={{ marginTop: '3px', flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '3px' }}>{icon} {title}</div>
                      <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>{desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <textarea
              required
              placeholder="Pitch your idea — describe your content style, audience size, and what you'd create for The Majorities *"
              style={{ ...styles.input, height: '120px' }}
              value={formData.contentPitch}
              onChange={e => setFormData({...formData, contentPitch: e.target.value})}
            />

            {/* Video upload directly in this section for creators */}
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginTop: '16px', marginBottom: '6px' }}>
              📹 Upload a Sample Video (routine, experience, or pitch)
            </label>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
              Upload one video that best represents your content style. This is your audition reel.
            </p>
            <input type="file" accept="video/*" style={styles.input} onChange={handleVideoChange} />
            {videoPreview && (
              <video src={videoPreview} style={{ maxWidth: '220px', marginTop: '10px', borderRadius: '8px' }} controls />
            )}
          </div>
        )}

        {/* ── SECTION 4 — COMMUNITY / VENUE ────────────────────────────────── */}
        {formData.partnerCategory === "Community / Venue Partners" && (
          <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
            <h3 style={styles.formSectionTitle}>4. EVENT DETAILS</h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
              Local Dallas spots — run clubs, barbershops, salons, and event organizers who bring people together.
            </p>
            <textarea
              required
              placeholder="Tell us about your space or upcoming event — location, audience, and what you're organizing *"
              style={{ ...styles.input, height: '90px' }}
              value={formData.eventDetails}
              onChange={e => setFormData({...formData, eventDetails: e.target.value})}
            />
            <textarea
              required
              placeholder="What role do you want The Majorities to play at your event or venue? *"
              style={{ ...styles.input, height: '80px' }}
              value={formData.majoritiesRole}
              onChange={e => setFormData({...formData, majoritiesRole: e.target.value})}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', marginTop: '14px' }}>
              <input
                type="checkbox"
                checked={formData.bulkOrderNeeded}
                onChange={e => setFormData({...formData, bulkOrderNeeded: e.target.checked})}
              />
              <span>We are interested in a one-time bulk order for our event</span>
            </label>
          </div>
        )}

        {/* ── SECTION 4 — BRAND & RETAIL ────────────────────────────────────── */}
        {formData.partnerCategory === "Brand & Retail Partners" && (
          <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
            <h3 style={styles.formSectionTitle}>4. BRAND OPPORTUNITIES</h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '14px' }}>Select all partnership opportunities you're interested in:</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                {
                  key: 'advertisingInterest',
                  icon: '📢',
                  title: 'Advertising Campaigns',
                  desc: 'Run paid ads and co-branded campaigns across The Majorities channels and audience network.'
                },
                {
                  key: 'wholesaleInterest',
                  icon: '📦',
                  title: 'Wholesale Orders',
                  desc: 'Purchase The Majorities products in bulk at wholesale pricing for resale through your own channels.'
                },
                {
                  key: 'sponsoredDumaInterest',
                  icon: '🏛️',
                  title: 'Sponsored Placements in The Duma',
                  desc: 'Verified brand visibility and native sponsored content placements inside The Duma community.'
                },
                {
                  key: 'sponsoredMarketplaceInterest',
                  icon: '🛒',
                  title: 'Sponsored Placements on The Marketplace',
                  desc: 'Featured product slots and promoted listings on The Majorities Marketplace.'
                }
              ].map(({ key, icon, title, desc }) => {
                const selected = formData[key];
                return (
                  <label
                    key={key}
                    style={{
                      ...cardOption,
                      borderColor: selected ? '#1a1a1a' : '#e0e0e0',
                      backgroundColor: selected ? '#f9f9f9' : '#fff'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={e => setFormData({...formData, [key]: e.target.checked})}
                      style={{ marginTop: '3px', flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '3px' }}>{icon} {title}</div>
                      <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>{desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SECTION 5: MEDIA ─────────────────────────────────────────────── */}
        {/* For creators, video is already captured in Section 4. Show photo only. */}
        <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>5. MEDIA</h3>

          {formData.partnerCategory === "Creator / Influencer Partners" ? (
            <>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                Upload a profile photo or banner image to represent yourself.
              </p>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Photo / Banner Upload</label>
              <input type="file" accept="image/*" style={styles.input} onChange={handlePhotoChange} />
              {photoPreview && <img src={photoPreview} style={{ maxWidth: '150px', marginTop: '10px', borderRadius: '8px' }} alt="Preview" />}
            </>
          ) : (
            <>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                Upload photos or videos of your product, venue, or brand.
              </p>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Photo Upload</label>
              <input type="file" accept="image/*" style={styles.input} onChange={handlePhotoChange} />
              {photoPreview && <img src={photoPreview} style={{ maxWidth: '150px', marginTop: '10px', borderRadius: '8px' }} alt="Preview" />}

              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginTop: '14px', marginBottom: '8px' }}>Video Upload</label>
              <input type="file" accept="video/*" style={styles.input} onChange={handleVideoChange} />
              {videoPreview && <video src={videoPreview} style={{ maxWidth: '150px', marginTop: '10px', borderRadius: '8px' }} controls />}
            </>
          )}
        </div>

        {/* ── SECTIONS 6 & 7: LOGISTICS & REVENUE — Marketplace only ──────── */}
        {formData.partnerCategory === "Marketplace Access" && (
          <>
            <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
              <h3 style={styles.formSectionTitle}>6. LOGISTICS</h3>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Fulfillment Quantity *</label>
              <input required placeholder="Quantity" type="number" min="500" style={styles.input} value={formData.desiredOrderQuantity} onChange={e => setFormData({...formData, desiredOrderQuantity: e.target.value})} />
              <p style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>Minimum 500 units</p>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginTop: '14px', marginBottom: '8px' }}>Pricing for 5-gallon units (optional)</label>
              <input placeholder="Bulk 5-gallon pricing" style={styles.input} value={formData.pricing5Gallon} onChange={e => setFormData({...formData, pricing5Gallon: e.target.value})} />
            </div>

            <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
              <h3 style={styles.formSectionTitle}>7. REVENUE AGREEMENT</h3>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>One-time Unit Price *</label>
              <input required placeholder="e.g., 5" style={styles.input} value={formData.standardUnitPrice} onChange={e => setFormData({...formData, standardUnitPrice: e.target.value})} />
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginTop: '14px', marginBottom: '8px' }}>Subscription Unit Price *</label>
              <input required placeholder="e.g., 4" style={styles.input} value={formData.promotionalUnitPrice} onChange={e => setFormData({...formData, promotionalUnitPrice: e.target.value})} />
              <label style={{ ...checkLabel, marginTop: '14px' }}>
                <input type="checkbox" required checked={formData.customerRewardAgreed} onChange={e => setFormData({...formData, customerRewardAgreed: e.target.checked})} style={{ marginTop: '4px' }} />
                <span>I agree to the Customer Reward program *</span>
              </label>
              <label style={checkLabel}>
                <input type="checkbox" required checked={formData.commission25AgreedTo} onChange={e => setFormData({...formData, commission25AgreedTo: e.target.checked})} style={{ marginTop: '4px' }} />
                <span>I agree to the 25% commission structure *</span>
              </label>
              <label style={checkLabel}>
                <input type="checkbox" required checked={formData.shippingReturnsAgreed} onChange={e => setFormData({...formData, shippingReturnsAgreed: e.target.checked})} style={{ marginTop: '4px' }} />
                <span>I agree to the Shipping &amp; Returns Policy *</span>
              </label>
              <label style={checkLabel}>
                <input type="checkbox" required checked={formData.ownershipTitleAgreed} onChange={e => setFormData({...formData, ownershipTitleAgreed: e.target.checked})} style={{ marginTop: '4px' }} />
                <span>I agree to the Ownership &amp; Title Policy *</span>
              </label>
            </div>
          </>
        )}

        {/* ── SECTION 6: CREATOR COMMISSION AGREEMENT ───────────────────────── */}
        {formData.partnerCategory === "Creator / Influencer Partners" && (
          <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
            <h3 style={styles.formSectionTitle}>6. COMMISSION AGREEMENT</h3>
            <div style={{
              backgroundColor: '#f5f5f5',
              borderRadius: '10px',
              padding: '14px 16px',
              marginBottom: '14px',
              fontSize: '13px',
              lineHeight: '1.6',
              color: '#444'
            }}>
              <strong>8% Referral Commission</strong> — You earn 8% of every sale made through your unique referral link or code. Commissions are tracked and paid out on a monthly basis. No cap on earnings.
            </div>
            <label style={{ ...checkLabel, marginTop: '4px' }}>
              <input type="checkbox" required checked={formData.commission8Agreed} onChange={e => setFormData({...formData, commission8Agreed: e.target.checked})} style={{ marginTop: '4px' }} />
              <span>I agree to an 8% commission rate on all successful referrals *</span>
            </label>
          </div>
        )}

        {/* ── PARTNER TIER ──────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>PARTNER TIER</h3>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
              <input type="radio" name="tier" value="National Associate" checked={formData.tier === "National Associate"} onChange={e => setFormData({...formData, tier: e.target.value})} />
              National Associate
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: canApplyPremium ? 'pointer' : 'not-allowed', opacity: canApplyPremium ? 1 : 0.5 }}>
              <input type="radio" name="tier" value="Premium Partner" checked={formData.tier === "Premium Partner"} disabled={!canApplyPremium} onChange={e => setFormData({...formData, tier: e.target.value})} />
              Premium Partner {!canApplyPremium && <span style={{ fontSize: '11px', color: '#aaa' }}>(Politburo+ only)</span>}
            </label>
          </div>
        </div>

        <button type="submit" style={{ ...styles.authButton, marginTop: '20px' }}>Submit Partnership Application</button>
      </form>
    </div>
  );
};
