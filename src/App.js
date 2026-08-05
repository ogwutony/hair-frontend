 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/App.js b/src/App.js
index 6d402a7ec411b4fc47a87c1f1dc1bb98af115e97..fb46d390654ac507ae27265fff69d24e64a43c70 100644
--- a/src/App.js
+++ b/src/App.js
@@ -1,33 +1,35 @@
 import React, { useState, useEffect, useCallback } from "react";
 import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation, useParams } from "react-router-dom";
 import AdMonetization, { trackEvent } from "./components/AdMonetization";
 // --- 1. SHOPIFY CONFIGURATION ---
 const SHOP_DOMAIN = "c0bqfe-z2.myshopify.com";
 
 const DEFAULT_SELLING_PLAN_ID = "1467875506";
 
+const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || "";
+
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
@@ -91,51 +93,51 @@ const RANK_TIERS = [
   { title: "Crow",              min: 100     },
   { title: "Comrade",           min: 1       },
 ];
 
 const getRankTitle = (score) => {
   for (const tier of RANK_TIERS) {
     if (score >= tier.min) return tier.title;
   }
   return "Comrade";
 };
 // --- LOWER HIERARCHY TITLES (used for "Lord " prefix eligibility) ---
 const LOWER_HIERARCHY_TITLES = RANK_TIERS.slice(RANK_TIERS.findIndex(t => t.title === "Perun")).map(t => t.title);
 // Adds a "Lord " prefix once a user has answered all 15 perspective prompts while in a Lower Hierarchy rank
 const getFormattedRankTitle = (rankTitle, completedPromptsCount = 0) => {
   if (LOWER_HIERARCHY_TITLES.includes(rankTitle) && completedPromptsCount >= 15) {
     return `Lord ${rankTitle}`;
   }
   return rankTitle;
 };
 // --- PROMPT COMPLETION TRACKING (for "Lord " prefix) ---
 const COMPLETED_PROMPTS_KEY = "majorities_completed_prompts";
 const getCompletedPromptIds = (userEmail) => {
   if (typeof window === "undefined" || !userEmail) return [];
   try {
     const stored = JSON.parse(window.localStorage.getItem(COMPLETED_PROMPTS_KEY) || "{}");
-    return stored[userEmail] || [];
+    return Array.isArray(stored[userEmail]) ? stored[userEmail] : [];
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
 const isPolitburoOrHigher = (score) => score >= 10000000; // "Politburo Member of The Majorities" and above
 // --- CALCULATE POINTS TO NEXT RANK ---
 const getPointsToNextRank = (currentScore, currentRankTitle) => {
     const currentIndex = RANK_TIERS.findIndex(r => r.title === currentRankTitle);
   
   if (currentIndex <= 0) return 0;
   const nextRank = RANK_TIERS[currentIndex - 1];
   return Math.max(0, nextRank.min - currentScore);
@@ -570,60 +572,65 @@ const ProfilePage = ({ userEmail, savedSets, rankTitle, rankScore, authToken, on
 
     // 🍿 MOVIES & TV SHOWS
     { id: 12, text: "What TV show or series are you currently binge-watching that everyone needs to check out?" },
     { id: 13, text: "What is a movie you can watch over and over again without ever getting tired of it?" },
     { id: 14, text: "Recommend an underrated movie or show that doesn't get enough hype!" },
 
     // ✨ ANYTHING GOES (WILDCARD)
     { id: 15, text: "Post Anything! Share whatever is on your mind today—a random thought, life update, or funny hot take." }
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
     if (e.target.files && e.target.files.length > 0) {
+      cultureMediaPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
       const selectedFiles = Array.from(e.target.files).slice(0, 6);
       setCultureMediaFiles(selectedFiles);
       const previews = selectedFiles.map((file) => ({
         url: URL.createObjectURL(file),
         type: file.type.startsWith("video/") ? "video" : "image",
       }));
       setCultureMediaPreviews(previews);
     }
   };
 
+  useEffect(() => () => {
+    cultureMediaPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
+  }, [cultureMediaPreviews]);
+
   const handleCultureSubmit = async (e) => {
     e.preventDefault();
     const selectedPrompt = perspectivePrompts[activePromptIndex]?.text || "";
     const selectedPromptId = perspectivePrompts[activePromptIndex]?.id;
     if (!selectedPrompt || !cultureResponse.trim()) {
       setCultureErrorMsg("Please select a prompt and provide your response.");
       return;
     }
     setCultureErrorMsg("");
     setCultureSubmitStatus("uploading");
 
     try {
       let uploadedMediaUrls = [];
 
       if (cultureMediaFiles.length > 0 && authToken) {
         for (const file of cultureMediaFiles) {
           const formData = new FormData();
           formData.append("file", file);
           formData.append("type", file.type.startsWith("video/") ? "video" : "image");
           const uploadRes = await fetch(`${BACKEND_URL}/api/media/upload`, {
             method: "POST",
             headers: { Authorization: `Bearer ${authToken}` },
             body: formData
           });
           if (uploadRes.ok) {
@@ -651,50 +658,55 @@ const ProfilePage = ({ userEmail, savedSets, rankTitle, rankScore, authToken, on
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
           mediaUrls: uploadedMediaUrls.length > 0 ? uploadedMediaUrls : cultureMediaPreviews.map(p => p.url),
           submittedBy: userEmail,
           submitterRank: rankTitle || 'Comrade',
           submitterAvatar: userAvatar || null,
           votes: { yes: 0 }
         });
       }
 
       if (onAddPoints) onAddPoints(100);
       if (userEmail && selectedPromptId) markPromptCompleted(userEmail, selectedPromptId);
+      if (uploadedMediaUrls.length > 0) {
+        cultureMediaPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
+        setCultureMediaPreviews([]);
+        setCultureMediaFiles([]);
+      }
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
@@ -1360,51 +1372,51 @@ const ProfilePage = ({ userEmail, savedSets, rankTitle, rankScore, authToken, on
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
-            <div key={index} style={styles.dumaCard}>
+            <div key={set.id || `${set.date}-${set.items?.map(item => item.name).join("-")}`} style={styles.dumaCard}>
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
@@ -1791,60 +1803,65 @@ function LandingPage({ saveSetToProfile, onAddPoints, savedSets }) {
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
-          <div style={{ margin: '10px 0' }}>
-            {(() => {
-              const counts = {};
-              selectedItems.forEach(item => { counts[item.name] = (counts[item.name] || 0) + 1; });
-              return Object.entries(counts).map(([name, count]) => (
-                <p key={name} style={{ fontSize: '11px', margin: '4px 0' }}>
-                  {name}{count > 1 ? ` x${count}` : ''} · {formatCurrency(getProductCommerceConfig(name).pricing.oneTime)} / {formatCurrency(getProductCommerceConfig(name).pricing.subscription)}
-                </p>
-              ));
-            })()}
+          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '10px 0 16px' }}>
+            {selectedItems.length === 0 ? (
+              <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>Select products from the left to build your custom bundle.</p>
+            ) : (
+              selectedItems.map(item => {
+                const { pricing } = getProductCommerceConfig(item.name);
+                return (
+                  <div key={item.name} style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: '#f9f9f9', border: '1px solid #eee' }}>
+                    <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px', color: '#222' }}>{item.name}</div>
+                    <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4', marginBottom: '6px' }}>{item.desc}</div>
+                    <div style={{ fontSize: '11px', color: '#555' }}>One-time {formatCurrency(pricing.oneTime)} · Subscribe {formatCurrency(pricing.subscription)}</div>
+                  </div>
+                );
+              })
+            )}
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
@@ -2011,63 +2028,70 @@ const PartnerPage = ({ addDumaItem, userEmail, rankTitle, rankScore, authToken,
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
+      if (photoPreview) URL.revokeObjectURL(photoPreview);
       setFormData({...formData, photoFile: file});
       setPhotoPreview(URL.createObjectURL(file));
     }
   };
 
   const handleVideoChange = (e) => {
     const file = e.target.files[0];
     if (file) {
+      if (videoPreview) URL.revokeObjectURL(videoPreview);
       setFormData({...formData, videoFile: file});
       setVideoPreview(URL.createObjectURL(file));
     }
   };
 
+  useEffect(() => () => {
+    if (photoPreview) URL.revokeObjectURL(photoPreview);
+    if (videoPreview) URL.revokeObjectURL(videoPreview);
+  }, [photoPreview, videoPreview]);
+
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
@@ -2116,61 +2140,69 @@ const PartnerPage = ({ addDumaItem, userEmail, rankTitle, rankScore, authToken,
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
+      if (photoPreview) URL.revokeObjectURL(photoPreview);
+      if (videoPreview) URL.revokeObjectURL(videoPreview);
+      setPhotoPreview(null);
+      setVideoPreview(null);
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
+      if (photoPreview) URL.revokeObjectURL(photoPreview);
+      if (videoPreview) URL.revokeObjectURL(videoPreview);
+      setPhotoPreview(null);
+      setVideoPreview(null);
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
@@ -2404,60 +2436,65 @@ export const CultureLabPage = ({ addDumaItem, userEmail, rankTitle, rankScore, a
       })
       .catch(err => console.error("Failed to load community socials:", err));
   }, []);
 
   const activePrompt = prompts[activePromptIndex];
 
   const selectedPrompt = activePrompt?.text || "";
 const selectedPromptId = activePrompt?.id;
 
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
 
   const handleMediaChange = (e) => {
     if (e.target.files && e.target.files.length > 0) {
+      mediaPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
       const selectedFiles = Array.from(e.target.files).slice(0, 6);
       setMediaFiles(selectedFiles);
       const previews = selectedFiles.map((file) => ({
         url: URL.createObjectURL(file),
         type: file.type.startsWith("video/") ? "video" : "image",
       }));
       setMediaPreviews(previews);
     }
   };
 
+  useEffect(() => () => {
+    mediaPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
+  }, [mediaPreviews]);
+
   const handleSubmit = async (e) => {
     e.preventDefault();
     if (!selectedPrompt || !response.trim()) {
       setErrorMsg("Please select a prompt and provide your response.");
       return;
     }
     
     setErrorMsg("");
     
     try {
       let uploadedMediaUrls = [];
 
       if (mediaFiles.length > 0 && authToken) {
         for (const file of mediaFiles) {
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
@@ -2476,50 +2513,55 @@ const selectedPromptId = activePrompt?.id;
             category: "Culture",
             mediaUrls: uploadedMediaUrls
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
         mediaUrls: uploadedMediaUrls.length > 0 ? uploadedMediaUrls : mediaPreviews.map(p => p.url),
         submittedBy: userEmail,
         submitterRank: rankTitle || 'Comrade',
         submitterAvatar: userAvatar || null,
         votes: { yes: 0 }
       });
 
       if (onAddPoints) onAddPoints(100);
         if (userEmail && selectedPromptId) markPromptCompleted(userEmail, selectedPromptId);
       
+      if (uploadedMediaUrls.length > 0) {
+        mediaPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
+        setMediaPreviews([]);
+        setMediaFiles([]);
+      }
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
         mediaUrls: mediaPreviews.map(p => p.url),
         submittedBy: userEmail,
         submitterRank: rankTitle || 'Comrade',
         submitterAvatar: userAvatar || null,
         votes: { yes: 0 }
       });
       if (onAddPoints) onAddPoints(100);
 if (userEmail && selectedPromptId) markPromptCompleted(userEmail, selectedPromptId);
       setSubmitted(true);
     }
   };
 
   if (submitted) {
@@ -2670,55 +2712,56 @@ if (userEmail && selectedPromptId) markPromptCompleted(userEmail, selectedPrompt
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
-        // De-duplicate items by ID so only one unique entry is rendered per submission
+        // De-duplicate items by ID and assign stable render keys to prevent duplicate React keys.
         const uniqueMap = new Map();
-        [...data, ...items].forEach(item => {
-          const id = item._id || item.id;
-          if (id) uniqueMap.set(String(id), item);
+        [...data, ...items].forEach((item, idx) => {
+          const rawId = item._id || item.id || `duma-item-${idx}`;
+          const key = String(rawId);
+          uniqueMap.set(key, { ...item, _uniqueKey: key });
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
@@ -2740,56 +2783,56 @@ const DumaPage = ({ items, authToken, userEmail, rankTitle, rankScore, onAddPoin
 
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
         <button onClick={() => window.location.href = authToken ? '/culture' : '/login'} style={{ padding: '8px 14px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', marginLeft: 'auto' }}>{authToken ? '+ Share Your Perspective' : 'Log in to Share'}</button>
       </div>
 
       <AdMonetization placement="duma_page" />
 
       {activeSection === "Culture" && (
         <div>
           {culturalItems.length === 0 ? (
             <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888' }}>No perspectives shared yet. Share yours and contribute to our culture section!</div>
           ) : (
             culturalItems.map(item => {
-              const itemId = item._id || item.id;
+              const itemId = item._id || item.id || item._uniqueKey;
               // Dynamically recalculate rank badge from stored score to always reflect correct tier
               const verifiedRank = item.rankScore ? getRankTitle(item.rankScore) : (item.submitterRank || "Comrade");
 
               return (
-                <div key={itemId} style={styles.dumaCard}>
+                <div key={item._uniqueKey || itemId} style={styles.dumaCard}>
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
                   {(() => {
                     const mediaList = Array.isArray(item.mediaUrls) && item.mediaUrls.length > 0
                       ? item.mediaUrls
                       : item.mediaUrl ? [item.mediaUrl] : [];
                     if (mediaList.length === 0) return null;
                     return (
@@ -2843,51 +2886,51 @@ const DumaPage = ({ items, authToken, userEmail, rankTitle, rankScore, onAddPoin
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
-              <div key={item.id || item._id} style={styles.dumaCard}>
+              <div key={item._uniqueKey || item.id || item._id} style={styles.dumaCard}>
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
@@ -2916,51 +2959,51 @@ const DumaPage = ({ items, authToken, userEmail, rankTitle, rankScore, onAddPoin
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
-              <div key={item.id || item._id} style={styles.dumaCard}>
+              <div key={item._uniqueKey || item.id || item._id} style={styles.dumaCard}>
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
@@ -3155,75 +3198,75 @@ const PerspectivesPage = ({ items, authToken, userEmail, rankTitle, rankScore, f
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
-            <div key={item.id || item._id} style={styles.dumaCard}>
+            <div key={item._uniqueKey || item.id || item._id} style={styles.dumaCard}>
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
 
-  // Security Gate: Replace with your exact company owner email address
-  const isOwner = userEmail === "YOUR_EMAIL@domain.com";
+  // Security Gate: configure REACT_APP_ADMIN_EMAIL for the company owner
+  const isOwner = Boolean(ADMIN_EMAIL) && userEmail?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
 
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
@@ -3623,51 +3666,58 @@ export default function App() {
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
-  const saveSetToProfile = (items) => { const newSet = { items, date: new Date().toLocaleDateString() }; const updatedSets = [newSet, ...savedSets]; setSavedSets(updatedSets); localStorage.setItem("savedSets", JSON.stringify(updatedSets)); };
+  const saveSetToProfile = (items) => {
+    const newSet = { id: `set-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, items, date: new Date().toLocaleDateString() };
+    setSavedSets(prev => {
+      const updatedSets = [newSet, ...prev];
+      localStorage.setItem("savedSets", JSON.stringify(updatedSets));
+      return updatedSets;
+    });
+  };
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
       addPoints(1); // +1 point for following someone
@@ -3680,51 +3730,51 @@ export default function App() {
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
             {/* Publicly visible links */}
               <Link to="/duma" style={styles.navLink}>The Duma</Link>
 {isLoggedIn ? (
             <>
               <Link to="/perspectives" style={styles.navLink}>Culture</Link>
- {isLoggedIn && userEmail === "YOUR_EMAIL@domain.com" && (
+ {isLoggedIn && Boolean(ADMIN_EMAIL) && userEmail?.toLowerCase() === ADMIN_EMAIL.toLowerCase() && (
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
 
EOF
)
