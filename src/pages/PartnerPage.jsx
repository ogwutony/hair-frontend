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
      if (!formData.contentPitch) {
        setErrorMsg("Please share details about your routines, experiences, or commercial pitch.");
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
      // Append shared fields
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

      // Append category-specific fields dynamically
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
          <div style={{ fontSize: '40px', marginBottom: '16px' }}></div>
          <h2>Partnership Application Submitted!</h2>
          <p style={{ color: '#666' }}>Your partnership application has been sent to The Majorities' Duma for review.</p>
          <Link to="/duma" style={{ ...styles.authButton, marginTop: '20px', width: 'auto', padding: '12px 24px', textDecoration: 'none', display: 'inline-block' }}>View the Duma</Link>
        </div>
      </div>
    );
  }

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
        
        {/* SECTION 1: CATEGORY */}
        <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>1. PARTNERSHIP CATEGORY</h3>
          <select 
            style={{ ...styles.input, appearance: 'auto', backgroundColor: '#fff' }} 
            value={formData.partnerCategory} 
            onChange={e => setFormData({...formData, partnerCategory: e.target.value})}
          >
            <option value="Creator / Influencer Partners">Creator / Influencer Partners</option>
            <option value="Community / Venue Partners">Community / Venue Partners</option>
            <option value="Brand & Retail Partners">Brand & Retail Partners</option>
            <option value="Marketplace Access">Marketplace Access</option>
          </select>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', lineHeight: '1.4' }}>
            {formData.partnerCategory === "Creator / Influencer Partners" && "Share honest routines and product experiences. Product shout outs and commercials."}
            {formData.partnerCategory === "Community / Venue Partners" && "Local Dallas spots, run clubs, barbershops, salons, and event organizers who bring people together."}
            {formData.partnerCategory === "Brand & Retail Partners" && "Independent beauty and grooming brands seeking native sponsored placements and verified brand visibility in The Duma."}
            {formData.partnerCategory === "Marketplace Access" && "Gain verified access to sell directly on The Majorities marketplace."}
          </p>
        </div>

        {/* SECTION 2 & 3: CONTACT & COMPANY INFO (Always Visible) */}
        <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>2. CONTACT INFORMATION</h3>
          <input required placeholder="Full Name *" style={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input required placeholder="Business Email *" type="email" style={styles.input} value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
          <input required placeholder="Phone Number *" style={styles.input} value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
          <input required placeholder="EIN (Employer Identification Number) *" style={styles.input} value={formData.ein} onChange={e => setFormData({...formData, ein: e.target.value})} />
        </div>

        <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>3. COMPANY / ENTITY INFORMATION</h3>
          <input required placeholder="Company / Brand / Profile Name *" style={styles.input} value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
          <input required placeholder="Country of Origin *" style={styles.input} value={formData.countryOfOrigin} onChange={e => setFormData({...formData, countryOfOrigin: e.target.value})} />
          <input required placeholder="Operating Country *" style={styles.input} value={formData.operatingCountry} onChange={e => setFormData({...formData, operatingCountry: e.target.value})} />
          <input placeholder="Website or Social Media Link" style={styles.input} value={formData.websiteOrSocial} onChange={e => setFormData({...formData, websiteOrSocial: e.target.value})} />
        </div>

        {/* SECTION 4: CATEGORY SPECIFIC DETAILS */}
        
        {/* 4A: Marketplace Access */}
        {formData.partnerCategory === "Marketplace Access" && (
          <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
            <h3 style={styles.formSectionTitle}>4. PRODUCT DETAILS</h3>
            <input required placeholder="Product Type *" style={styles.input} value={formData.productType} onChange={e => setFormData({...formData, productType: e.target.value})} />
            <textarea required placeholder="Product Description *" style={{ ...styles.input, height: '80px' }} value={formData.productDescription} onChange={e => setFormData({...formData, productDescription: e.target.value})} />
            <textarea required placeholder="Why should we partner with you? *" style={{ ...styles.input, height: '100px' }} value={formData.whyPartner} onChange={e => setFormData({...formData, whyPartner: e.target.value})} />
          </div>
        )}

        {/* 4B: Creator / Influencer */}
        {formData.partnerCategory === "Creator / Influencer Partners" && (
          <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
            <h3 style={styles.formSectionTitle}>4. CONTENT & PITCH DETAILS</h3>
            <textarea required placeholder="Tell us about your routines, product experiences, and commercial pitch ideas *" style={{ ...styles.input, height: '120px' }} value={formData.contentPitch} onChange={e => setFormData({...formData, contentPitch: e.target.value})} />
          </div>
        )}

        {/* 4C: Community / Venue */}
        {formData.partnerCategory === "Community / Venue Partners" && (
          <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
            <h3 style={styles.formSectionTitle}>4. EVENT & VENUE DETAILS</h3>
            <textarea required placeholder="Tell us about your local spot, run club, barbershop, salon, or upcoming event *" style={{ ...styles.input, height: '80px' }} value={formData.eventDetails} onChange={e => setFormData({...formData, eventDetails: e.target.value})} />
            <textarea required placeholder="What role do you want The Majorities to play? *" style={{ ...styles.input, height: '80px' }} value={formData.majoritiesRole} onChange={e => setFormData({...formData, majoritiesRole: e.target.value})} />
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', marginTop: '14px' }}>
              <input type="checkbox" checked={formData.bulkOrderNeeded} onChange={e => setFormData({...formData, bulkOrderNeeded: e.target.checked})} />
              <span>We are interested in a one-time bulk order for our event</span>
            </label>
          </div>
        )}

        {/* 4D: Brand & Retail */}
        {formData.partnerCategory === "Brand & Retail Partners" && (
          <div style={{ borderBottom: '2px solid #eee', paddingBottom:
