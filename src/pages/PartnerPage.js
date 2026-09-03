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
          <Link to="/duma" style={{ ...styles.authButton, marginTop: '20px', width: 'auto', padding: '12px 24px', textDecoration: 'none', display: 'inline-block' }}>View the Duma</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2>Partner with The Majorities</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Apply to become a partner and sell on our marketplace</p>
      {userEmail && rankTitle && (
        <div style={{ marginBottom: '20px' }}>
          <CredentialHeader email={userEmail} rankTitle={rankTitle} rankScore={rankScore} avatarUrl={userAvatar} />
        </div>
      )}
      {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}
      {showGuestPrompt && <GuestSubmissionPrompt message="Log in or register to submit this partnership application to The Duma." />}

      <form style={styles.dumaCard} onSubmit={handleSubmit}>
        
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

        <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>2. CONTACT INFORMATION</h3>
          <input required placeholder="Full Name *" style={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input required placeholder="Business Email *" type="email" style={styles.input} value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
          <input required placeholder="Phone Number *" style={styles.input} value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
          <input required placeholder="EIN (Employer Identification Number) *" style={styles.input} value={formData.ein} onChange={e => setFormData({...formData, ein: e.target.value})} />
        </div>

        <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>3. COMPANY INFORMATION</h3>
          <input required placeholder="Company Name *" style={styles.input} value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
          <input required placeholder="Country of Origin *" style={styles.input} value={formData.countryOfOrigin} onChange={e => setFormData({...formData, countryOfOrigin: e.target.value})} />
          <input required placeholder="Operating Country *" style={styles.input} value={formData.operatingCountry} onChange={e => setFormData({...formData, operatingCountry: e.target.value})} />
          <input placeholder="Website or Social Media" style={styles.input} value={formData.websiteOrSocial} onChange={e => setFormData({...formData, websiteOrSocial: e.target.value})} />
        </div>

        <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>4. PRODUCT DETAILS</h3>
          <input required placeholder="Product Type *" style={styles.input} value={formData.productType} onChange={e => setFormData({...formData, productType: e.target.value})} />
          <textarea required placeholder="Product Description *" style={{ ...styles.input, height: '80px' }} value={formData.productDescription} onChange={e => setFormData({...formData, productDescription: e.target.value})} />
          <textarea required placeholder="Why should we partner with you? *" style={{ ...styles.input, height: '100px' }} value={formData.whyPartner} onChange={e => setFormData({...formData, whyPartner: e.target.value})} />
        </div>

        <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>5. MEDIA</h3>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Product Photo</label>
          <input type="file" accept="image/*" style={styles.input} onChange={handlePhotoChange} />
          {photoPreview && <img src={photoPreview} style={{ maxWidth: '150px', marginTop: '10px', borderRadius: '8px' }} alt="Preview" />}
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginTop: '14px', marginBottom: '8px' }}>Product Video</label>
          <input type="file" accept="video/*" style={styles.input} onChange={handleVideoChange} />
          {videoPreview && <video src={videoPreview} style={{ maxWidth: '150px', marginTop: '10px', borderRadius: '8px' }} controls />}
        </div>

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
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer', marginTop: '14px' }}>
            <input type="checkbox" required checked={formData.customerRewardAgreed} onChange={e => setFormData({...formData, customerRewardAgreed: e.target.checked})} style={{ marginTop: '4px' }} />
            <span>I agree to the Customer Reward program *</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer', marginTop: '12px' }}>
            <input type="checkbox" required checked={formData.commission25AgreedTo} onChange={e => setFormData({...formData, commission25AgreedTo: e.target.checked})} style={{ marginTop: '4px' }} />
            <span>I agree to the 25% commission structure *</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer', marginTop: '12px' }}>
            <input type="checkbox" required checked={formData.shippingReturnsAgreed} onChange={e => setFormData({...formData, shippingReturnsAgreed: e.target.checked})} style={{ marginTop: '4px' }} />
            <span>I agree to the Shipping & Returns Policy *</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer', marginTop: '12px' }}>
            <input type="checkbox" required checked={formData.ownershipTitleAgreed} onChange={e => setFormData({...formData, ownershipTitleAgreed: e.target.checked})} style={{ marginTop: '4px' }} />
            <span>I agree to the Ownership & Title Policy *</span>
          </label>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={styles.formSectionTitle}>8. PARTNER TIER</h3>
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