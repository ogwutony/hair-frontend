import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// --- 1. STRIPE INITIALIZATION ---
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// --- 2. BACKEND CONFIGURATION ---
const BACKEND_URL = "https://hair-backend-2.onrender.com";

// --- 3. RANK SYSTEM ---
const RANK_TIERS = [
  { title: "General Secretary",              min: 8500001 },
  { title: "Premier",                        min: 7000001 },
  { title: "Head of State",                  min: 5500001 },
  { title: "Politburo",                      min: 4000001 },
  { title: "Party National",                 min: 2500001 },
  { title: "Central committee",              min: 1000001 },
  { title: "Councils of ministers",          min: 500001  },
  { title: "Supreme soviets",                min: 250000  },
  { title: "Republican Party committeemen",  min: 160000  },
  { title: "Regional party head",            min: 80000   },
  { title: "City Party Head",                min: 40000   },
  { title: "District Party head",            min: 20000   },
  { title: "District Soviet",                min: 10000   },
  { title: "Executive",                      min: 5000    },
  { title: "Department head",                min: 2500    },
  { title: "enterprises",                    min: 2000    },
  { title: "Partymember",                    min: 800     },
  { title: "bold carp",                      min: 500     },
  { title: "crucian carp",                   min: 250     },
  { title: "elephants",                      min: 160     },
  { title: "Small elephants",                min: 80      },
  { title: "godok",                          min: 40      },
  { title: "podgodok",                       min: 20      },
  { title: "one-and-a-half",                 min: 10      },
  { title: "bolshevik",                      min: 1       },
];

const getRankTitle = (score) => {
  for (const tier of RANK_TIERS) {
    if (score >= tier.min) return tier.title;
  }
  return "bolshevik";
};

const getRankColor = (rankTitle) => {
  const topGold = ["General Secretary", "Premier", "Head of State"];
  const midPurple = ["Politburo", "Party National", "Central committee", "Councils of ministers"];
  const midBlue = ["Supreme soviets", "Republican Party committeemen", "Regional party head", "City Party Head", "District Party head", "District Soviet"];
  if (topGold.includes(rankTitle)) return '#FFD700';
  if (midPurple.includes(rankTitle)) return '#9b59b6';
  if (midBlue.includes(rankTitle)) return '#2980b9';
  return '#888';
};

// --- RANK BADGE COMPONENT ---
const RankBadge = ({ rankTitle, score }) => {
  const color = getRankColor(rankTitle);
  const isGenSec = rankTitle === "General Secretary";
  return (
    <span style={{
      fontSize: '11px',
      fontWeight: '700',
      color: color,
      padding: '2px 8px',
      borderRadius: '12px',
      border: `1px solid ${color}`,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      ...(isGenSec ? styles.generalSecretaryBadge : {})
    }}>
      {rankTitle}
    </span>
  );
};

// --- CREDENTIAL HEADER COMPONENT ---
const CredentialHeader = ({ email, rankTitle, rankScore }) => {
  const initial = (rankTitle || 'B')[0].toUpperCase();
  const color = getRankColor(rankTitle || 'bolshevik');
  const isGenSec = rankTitle === "General Secretary";
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: '700',
        color: '#fff',
        flexShrink: 0,
        ...(isGenSec ? { boxShadow: '0 0 12px rgba(255,215,0,0.8)' } : {})
      }}>
        {initial}
      </div>
      <div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#222' }}>{email}</div>
        <RankBadge rankTitle={rankTitle || 'bolshevik'} />
        <span style={{ fontSize: '11px', color: '#aaa', marginLeft: '6px' }}>
          {(rankScore || 1).toLocaleString()} pts
        </span>
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

// --- 5. STRIPE UI CONFIGURATION ---
const appearance = { theme: 'flat', variables: { colorPrimaryText: '#262626' } };
const paymentElementOptions = {
  layout: { type: 'accordion', defaultCollapsed: false, radios: 'always', spacedAccordionItems: false },
  business: { name: "Majority Hair Solutions" }
};

const productsData = {
  shampoos: [
    { name: "Hydrate Shampoo", desc: "Deep moisture for daily cleansing." },
    { name: "Repair Shampoo", desc: "Strengthens damaged hair." },
    { name: "Clarify Shampoo", desc: "Removes buildup and residue." },
    { name: "Balance Shampoo", desc: "Restores scalp balance." }
  ],
  conditioners: [
    { name: "Smooth Conditioner", desc: "Softens and detangles." },
    { name: "Moisture Conditioner", desc: "Long-lasting hydration." },
    { name: "Strength Conditioner", desc: "Reinforces hair fibers." },
    { name: "Shine Conditioner", desc: "Adds natural gloss." }
  ],
  oils: [
    { name: "Growth Oil", desc: "Supports healthy growth." },
    { name: "Scalp Oil", desc: "Soothes dry scalp." },
    { name: "Light Oil", desc: "Weightless daily oil." },
    { name: "Nourish Oil", desc: "Deep nourishment." }
  ]
};

// --- PROFILE PAGE COMPONENT - Enhanced with Photo & Video Features ---
const ProfilePage = ({ userEmail, savedSets, rankTitle, rankScore, authToken, onAddPoints }) => {
  const [videoSubmission, setVideoSubmission] = useState("");
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");
  const [videoMessage, setVideoMessage] = useState("");

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    setPhotoMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${BACKEND_URL}/api/profile/upload-photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });
      if (response.ok) {
        setPhotoMessage("✅ Profile picture uploaded! +5 points awarded");
        if (onAddPoints) onAddPoints(5);
      } else {
        setPhotoMessage("❌ Photo upload failed. Try again.");
      }
    } catch (err) {
      setPhotoMessage("❌ Server error. Try again in 30 seconds.");
    }
    setIsUploadingPhoto(false);
  };

  const handleVideoSubmission = async () => {
    if (!videoSubmission.trim()) return alert("Please enter your response.");
    setIsSubmittingVideo(true);
    setVideoMessage("");
    try {
      const response = await fetch(`${BACKEND_URL}/api/cultural/submit-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          question: "What makes a person beautiful?",
          response: videoSubmission,
          category: "Cultural",
        }),
      });
      if (response.ok) {
        setVideoMessage("✅ Video submission sent to Cultural Section! +10 points awarded");
        setVideoSubmission("");
        setShowVideoForm(false);
        if (onAddPoints) onAddPoints(10);
      } else {
        setVideoMessage("❌ Submission failed. Try again.");
      }
    } catch (err) {
      setVideoMessage("❌ Server error. Try again in 30 seconds.");
    }
    setIsSubmittingVideo(false);
  };

  return (
    <div style={{ padding: '40px 60px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Welcome back,</h1>
        <p style={{ color: '#666' }}>{userEmail}</p>
        {rankTitle && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
            <RankBadge rankTitle={rankTitle} />
            <span style={{ fontSize: '12px', color: '#aaa' }}>{(rankScore || 1).toLocaleString()} points</span>
          </div>
        )}
      </div>

      <section style={{ marginBottom: '40px' }}>
        <h3>Build Your Profile</h3>
        
        <div style={styles.dumaCard}>
          <h4 style={{ marginTop: 0 }}>Profile Picture</h4>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Upload a profile photo - earn 5 points!</p>
          <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={isUploadingPhoto} style={{ marginBottom: '10px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' }} />
          {photoMessage && <p style={{ fontSize: '12px', color: photoMessage.includes('✅') ? '#2a7a2a' : '#c00', marginBottom: 0 }}>{photoMessage}</p>}
        </div>

        <div style={styles.dumaCard}>
          <h4 style={{ marginTop: 0 }}>Share Your Perspective</h4>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}><strong>Question:</strong> "What makes a person beautiful?" - Earn 10 points!</p>
          {!showVideoForm ? (
            <button style={styles.authButton} onClick={() => setShowVideoForm(true)}>Submit Your Answer</button>
          ) : (
            <div>
              <textarea placeholder="Share your thoughts..." value={videoSubmission} onChange={(e) => setVideoSubmission(e.target.value)} style={{ ...styles.input, height: '100px', marginBottom: '10px' }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={styles.authButton} onClick={handleVideoSubmission} disabled={isSubmittingVideo}>{isSubmittingVideo ? "Submitting..." : "Submit to Cultural Section"}</button>
                <button style={{ ...styles.authButton, background: '#f5f5f5', color: '#222' }} onClick={() => setShowVideoForm(false)}>Cancel</button>
              </div>
            </div>
          )}
          {videoMessage && <p style={{ fontSize: '12px', color: videoMessage.includes('✅') ? '#2a7a2a' : '#c00', marginTop: '10px', marginBottom: 0 }}>{videoMessage}</p>}
        </div>
      </section>

      <section>
        <h3>Your Saved Formulas</h3>
        {savedSets.length === 0 ? (
          <div style={styles.dumaCard}>
            <p style={{ color: '#888' }}>You haven't saved any custom sets yet. Head home to build your first one!</p>
            <Link to="/"><button style={{ ...styles.authButton, width: '200px', marginTop: '10px' }}>Start Building</button></Link>
          </div>
        ) : (
          savedSets.map((set, index) => (
            <div key={index} style={styles.dumaCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>Formula #{savedSets.length - index}</h4>
                <span style={{ fontSize: '12px', color: '#888' }}>{set.date}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '20px' }}>
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

// --- STRIPE CHECKOUT COMPONENT ---
const CheckoutForm = ({ totalPrice, onPurchaseSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/orders` },
      redirect: 'if_required'
    });
    if (error) { setErrorMessage(error.message); setIsProcessing(false); }
    else { onPurchaseSuccess(); }
  };
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={paymentElementOptions} />
      <button disabled={!stripe || isProcessing} style={{ ...styles.authButton, marginTop: '20px' }}>
        {isProcessing ? "Processing..." : `Complete Purchase ($${totalPrice})`}
      </button>
      {errorMessage && <div style={{ color: 'red', marginTop: '10px', fontSize: '12px' }}>{errorMessage}</div>}
    </form>
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
          <div style={{ fontSize: '48px', margin: '20px 0' }}>📬</div>
          <p style={{ color: '#555', lineHeight: '1.6' }}>
            If that email is registered, we've sent a reset link.<br />
            Check your inbox (and spam folder).
          </p>
          <p style={{ color: '#888', fontSize: '13px', marginTop: '10px' }}>
            The email may have landed in your <strong>spam or junk folder</strong> — please check there if you don't see it in your inbox.
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
          ← Back to Sign In
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
          <div style={{ fontSize: '48px', margin: '20px 0' }}>✅</div>
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
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) { onLogin(email); navigate("/"); }
      else { alert(data.error || "Invalid login"); }
    } catch (err) { alert("Server is waking up. Try again in 30s."); }
    finally { setIsLoading(false); }
  };
  return (
    <div style={styles.authContainer}><div style={styles.authCard}>
      <h2>Sign In</h2>
      <input type="email" placeholder="Email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
      <button style={styles.authButton} onClick={handleLogin}>{isLoading ? "..." : "Login"}</button>
      <Link to="/forgot-password" style={{ display: 'block', marginTop: '12px', fontSize: '13px', color: '#666', textDecoration: 'none', textAlign: 'center' }}>
        Forgot password?
      </Link>
    </div></div>
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
function LandingPage({ saveSetToProfile }) {
  const navigate = useNavigate();
  const [selection, setSelection] = useState({ shampoo1: null, shampoo2: null, conditioner1: null, conditioner2: null, oil1: null, oil2: null });
  const [focusedItem, setFocusedItem] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [price, setPrice] = useState(0);
  const handleSelect = (slot, item) => {
    setFocusedItem(item);
    setSelection(prev => ({ ...prev, [slot]: prev[slot]?.name === item.name ? null : item }));
  };
  const selectedItems = Object.values(selection).filter(Boolean);
  const isSetComplete = selectedItems.length === 6;
  const initializePayment = async (amt) => {
    setPrice(amt);
    try {
      const response = await fetch(`${BACKEND_URL}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(amt * 100) }),
      });
      const data = await response.json();
      if (data.clientSecret) setClientSecret(data.clientSecret);
    } catch (err) { alert("Payment initialization failed."); }
  };
  const onPurchaseSuccess = () => { saveSetToProfile(selectedItems); navigate("/orders"); };
  const renderRow = (label, slot, category) => (
    <div style={styles.rowSection}>
      <h3 style={styles.rowLabel}>{label}</h3>
      <div style={styles.scrollRow}>
        {productsData[category].map(item => {
          const isSelected = selection[slot]?.name === item.name;
          return (
            <div key={item.name} onClick={() => handleSelect(slot, item)} style={{ ...styles.card, border: isSelected ? "2px solid #222" : "1px solid #eee" }}>
              <div style={styles.imagePlaceholder}>{item.name[0]}</div>
              <div style={styles.itemName}>{item.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
  return (
    <div style={styles.layout}>
      <div style={styles.left}>
        {renderRow("Pick Shampoo 1", "shampoo1", "shampoos")}
        {renderRow("Pick Shampoo 2", "shampoo2", "shampoos")}
        {renderRow("Pick Conditioner 1", "conditioner1", "conditioners")}
        {renderRow("Pick Conditioner 2", "conditioner2", "conditioners")}
        {renderRow("Pick Oil 1", "oil1", "oils")}
        {renderRow("Pick Oil 2", "oil2", "oils")}
      </div>
      <aside style={styles.right}>
        <div style={{ minHeight: '100px', marginBottom: '15px' }}>
          {focusedItem ? (<div><h3>{focusedItem.name}</h3><p style={{ fontSize: '13px', color: '#666' }}>{focusedItem.desc}</p></div>) : <p style={{color: '#888'}}>Select a product</p>}
        </div>
        <div style={styles.summaryContainer}>
          <h4 style={{ fontSize: '14px', borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0 }}>Your Custom Set ({selectedItems.length}/6)</h4>
          <div style={{ margin: '10px 0' }}>{selectedItems.map((item, idx) => (<p key={idx} style={{ fontSize: '11px', margin: '4px 0' }}>✓ {item.name}</p>))}</div>
          {isSetComplete ? (
            <div style={{ borderTop: '2px solid #222', paddingTop: '15px' }}>
              {!clientSecret ? (
                <>
                  <button style={styles.checkoutBtn} onClick={() => initializePayment(30)}>Checkout One-Time ($30.00)</button>
                  <button style={{ ...styles.checkoutBtn, background: '#222', color: '#fff' }} onClick={() => initializePayment(25)}>Subscribe ($25.00/mo)</button>
                </>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                  <CheckoutForm totalPrice={price} onPurchaseSuccess={onPurchaseSuccess} />
                  <button onClick={() => setClientSecret("")} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '11px', marginTop: '10px' }}>← Change Plan</button>
                </Elements>
              )}
            </div>
          ) : <p style={{ fontSize: '12px', color: '#888' }}>Select 6 products to checkout</p>}
        </div>
      </aside>
    </div>
  );
}

// --- RECOMMEND PAGE ---
const RecommendPage = ({ addDumaItem, userEmail, rankTitle, rankScore, authToken }) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validation
    if (!formData.name || !formData.company || !formData.productType || !formData.websiteLink || !formData.whyRecommend) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (formData.whyRecommend.split(' ').length < 15) {
      setErrorMsg("Justification must be at least 2–3 sentences (15+ words).");
      return;
    }

    // Check for valid URL
    try {
      new URL(formData.websiteLink);
    } catch (err) {
      setErrorMsg("Website Link must be a valid URL starting with http:// or https://");
      return;
    }

    setIsLoading(true);
    try {
      if (authToken) {
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
      }
      addDumaItem({ ...formData, id: Date.now(), type: "Product Recommendation", submittedBy: userEmail || "anonymous", submitterRank: rankTitle || 'bolshevik', section: "Commerce" });
      setSubmitted(true);
    } catch (err) {
      addDumaItem({ ...formData, id: Date.now(), type: "Product Recommendation", submittedBy: userEmail || "anonymous", submitterRank: rankTitle || 'bolshevik', section: "Commerce" });
      setSubmitted(true);
    }
    setIsLoading(false);
  };

  if (submitted) {
    return (
      <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ ...styles.dumaCard, textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ marginBottom: '10px' }}>Recommendation Submitted!</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Your product recommendation has been sent to The Majority's Duma Commerce section for community review and voting.</p>
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
        Submit high-quality, verified hair care products to <strong>The Majority's Duma Commerce</strong> section for community review and voting.
      </p>

      {userEmail && rankTitle && <div style={{ marginBottom: '20px' }}><CredentialHeader email={userEmail} rankTitle={rankTitle} rankScore={rankScore} /></div>}
      {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}

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
          <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Why Recommend? (2–3 sentences, focus on results) *</label>
          <textarea required placeholder="Good: 'Highly effective for type 4C hair; significantly reduced breakage within 3 weeks of consistent use without heavy buildup.' *" style={{ ...styles.input, height: '100px' }} value={formData.whyRecommend} onChange={e => setFormData({...formData, whyRecommend: e.target.value})} />

          <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginTop: '15px', marginBottom: '8px' }}>Upload Product Photo (high-resolution, label must be legible)</label>
          <input type="file" accept="image/*" style={styles.input} onChange={e => setFormData({...formData, photo: e.target.files?.[0] || null})} />

          <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginTop: '15px', marginBottom: '8px' }}>Upload Product Video (under 60s, or link to review)</label>
          <input type="file" accept="video/*" style={styles.input} onChange={e => setFormData({...formData, video: e.target.files?.[0] || null})} />
        </div>

        <button type="submit" style={styles.authButton} disabled={isLoading}>{isLoading ? "Submitting..." : "Submit to the Duma"}</button>
      </form>

      <div style={{ ...styles.dumaCard, background: '#f9f9f9', marginTop: '30px' }}>
        <h3 style={{ marginTop: 0, fontSize: '14px', fontWeight: '700' }}>📋 Before You Submit:</h3>
        <ul style={{ fontSize: '13px', color: '#555', lineHeight: '1.8', marginLeft: '20px' }}>
          <li>Verify you are logged in with your profile (displayed above) to ensure points are tracked</li>
          <li>Double-check the Website Link for valid access before submitting</li>
          <li>Ensure product photo label is legible and high-resolution</li>
          <li>Keep video under 60 seconds</li>
          <li>Justification must be 2–3 sentences focused on results, not personal opinions</li>
        </ul>
      </div>
    </div>
  );
};

const PartnerPage = ({ addDumaItem, userEmail, rankTitle, rankScore, authToken }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ company: "", product: "", desc: "", tier: "National Associate" });
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [buttonState, setButtonState] = useState("Submit Application");
  const canApplyPremium = (rankScore || 1) >= 4000001;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsProcessing(true);
    setButtonState("Submit to Review");
    if (formData.tier === "Premium Partner" && !canApplyPremium) { setErrorMsg("Premium Partner status requires a score of 4,000,001+. Keep building your influence!"); setIsProcessing(false); setButtonState("Submit Application"); return; }
    if (!formData.company || !formData.product || !formData.desc) { setErrorMsg("Please fill in all fields."); setIsProcessing(false); setButtonState("Submit Application"); return; }
    try {
      if (authToken) {
        const res = await fetch(`${BACKEND_URL}/api/duma/partner`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` }, body: JSON.stringify(formData) });
        const data = await res.json();
        if (!res.ok) { setErrorMsg(data.error || 'Submission failed'); setIsProcessing(false); setButtonState("Submit Application"); return; }
      }
      addDumaItem({ ...formData, id: Date.now(), type: "Partner", submittedBy: userEmail || "anonymous", submitterRank: rankTitle || 'bolshevik', section: "Commerce" });
      setSubmitted(true);
    } catch (err) {
      addDumaItem({ ...formData, id: Date.now(), type: "Partner", submittedBy: userEmail || "anonymous", submitterRank: rankTitle || 'bolshevik', section: "Commerce" });
      setSubmitted(true);
    }
  };
  if (submitted) {
    return (
      <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ ...styles.dumaCard, textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🤝</div>
          <h2>Partner Application Submitted!</h2>
          <p style={{ color: '#666' }}>Your application has been sent to The Majority's Duma Commerce section for review.</p>
          <button style={{ ...styles.authButton, marginTop: '20px', width: 'auto', padding: '12px 24px' }} onClick={() => navigate("/duma")}>View the Duma</button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2>Partner with The Majority</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Submit your partnership application for review by The Majority's Commerce committee.</p>
      {userEmail && rankTitle && <div style={{ marginBottom: '20px' }}><CredentialHeader email={userEmail} rankTitle={rankTitle} rankScore={rankScore} /></div>}
      {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}
      <form style={styles.dumaCard} onSubmit={handleSubmit}>
        <input required placeholder="Company Name *" style={styles.input} value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
        <input required placeholder="Product Name *" style={styles.input} value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})} />
        <textarea required placeholder="Description of Partnership *" style={{ ...styles.input, height: '100px' }} value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} />
        <div style={{ marginTop: '15px' }}>
          <label style={styles.formSectionTitle}>Partnership Tier</label>
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
              <input type="radio" name="tier" value="National Associate" checked={formData.tier === "National Associate"} onChange={e => setFormData({...formData, tier: e.target.value})} />
              National Associate
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: canApplyPremium ? 'pointer' : 'not-allowed', opacity: canApplyPremium ? 1 : 0.5 }}>
              <input type="radio" name="tier" value="Premium Partner" checked={formData.tier === "Premium Partner"} disabled={!canApplyPremium} onChange={e => setFormData({...formData, tier: e.target.value})} />
              Premium Partner {!canApplyPremium && <span style={{ fontSize: '11px', color: '#aaa' }}>(4M+ points only)</span>}
            </label>
          </div>
        </div>
        <button type="submit" style={{ ...styles.authButton, marginTop: '16px' }} disabled={isProcessing}>{isProcessing ? "Processing..." : buttonState}</button>
      </form>
    </div>
  );
};

const DumaPage = ({ items, authToken, userEmail, rankTitle, rankScore, onAddPoints }) => {
  const [dumaItems, setDumaItems] = useState(items);
  const [voting, setVoting] = useState({});
  const [activeSection, setActiveSection] = useState("Commerce");
  useEffect(() => { fetch(`${BACKEND_URL}/api/duma`).then(r => r.json()).then(data => { if (Array.isArray(data) && data.length > 0) setDumaItems([...data, ...items]); }).catch(() => {}); }, [items]);
  const handleVote = async (itemId, voteType) => {
    if (!authToken) return alert("Please log in to vote.");
    setVoting(prev => ({ ...prev, [itemId]: true }));
    try {
      const response = await fetch(`${BACKEND_URL}/api/duma/${itemId}/vote`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ vote: voteType }) });
      if (response.ok) { const data = await response.json(); if (voteType === 'upvote' && onAddPoints) onAddPoints(1); setDumaItems(prev => prev.map(item => item.id === itemId || item._id === itemId ? { ...item, votes: data.votes || item.votes } : item)); }
    } catch (err) {}
    setVoting(prev => ({ ...prev, [itemId]: false }));
  };
  const culturalItems = dumaItems.filter(item => item.section === "Cultural" || item.type === "Video");
  const commerceItems = dumaItems.filter(item => item.section === "Commerce" || (item.type === "Recommendation" || item.type === "Partner"));
  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h2 style={{ marginBottom: '6px' }}>The Majority's Duma</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Community recommendations, partnerships, and cultural contributions — vote to shape The Majority.</p>
        </div>
        {userEmail && rankTitle && <div style={{ textAlign: 'right', minWidth: '250px' }}><CredentialHeader email={userEmail} rankTitle={rankTitle} rankScore={rankScore} /></div>}
      </div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
        <button onClick={() => setActiveSection("Commerce")} style={{ padding: '10px 20px', backgroundColor: activeSection === "Commerce" ? '#222' : '#f5f5f5', color: activeSection === "Commerce" ? '#fff' : '#222', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>💼 Commerce ({commerceItems.length})</button>
        <button onClick={() => setActiveSection("Cultural")} style={{ padding: '10px 20px', backgroundColor: activeSection === "Cultural" ? '#222' : '#f5f5f5', color: activeSection === "Cultural" ? '#fff' : '#222', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>🎨 Cultural ({culturalItems.length})</button>
      </div>
      {activeSection === "Commerce" && (
        <div>
          {commerceItems.length === 0 ? (
            <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888' }}>No submissions yet. Be the first to recommend a product or partnership!</div>
          ) : (
            commerceItems.map(item => (
              <div key={item.id || item._id} style={styles.dumaCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={styles.typeTag}>{item.type}</span>
                  {item.submitterRank && <RankBadge rankTitle={item.submitterRank} />}
                </div>
                {item.submittedBy && <CredentialHeader email={item.submittedBy} rankTitle={item.submitterRank || 'bolshevik'} rankScore={null} />}
                <h3 style={{ marginTop: '8px', marginBottom: '6px' }}>{item.name || item.product} by {item.company}</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '14px' }}>{item.reason || item.desc}</p>
                {authToken && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button disabled={voting[item.id || item._id]} onClick={() => handleVote(item._id || item.id, 'upvote')} style={{ ...styles.voteBtn, borderColor: '#27ae60', color: '#27ae60' }}>👍 Upvote {item.votes?.upvote > 0 && `(${item.votes.upvote})`}</button>
                    <button disabled={voting[item.id || item._id]} onClick={() => handleVote(item._id || item.id, 'downvote')} style={{ ...styles.voteBtn, borderColor: '#e74c3c', color: '#e74c3c' }}>👎 Downvote {item.votes?.downvote > 0 && `(${item.votes.downvote})`}</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
      {activeSection === "Cultural" && (
        <div>
          {culturalItems.length === 0 ? (
            <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888' }}>No cultural submissions yet. Share your perspective on what makes a person beautiful!</div>
          ) : (
            culturalItems.map(item => (
              <div key={item.id || item._id} style={styles.dumaCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={styles.typeTag}>📹 Video Submission</span>
                  {item.submitterRank && <RankBadge rankTitle={item.submitterRank} />}
                </div>
                {item.submittedBy && <CredentialHeader email={item.submittedBy} rankTitle={item.submitterRank || 'bolshevik'} rankScore={null} />}
                <h4 style={{ marginTop: '12px', marginBottom: '8px', color: '#555' }}>Question: "What makes a person beautiful?"</h4>
                <p style={{ color: '#222', fontSize: '14px', lineHeight: '1.6', marginBottom: '14px' }}>{item.response || item.reason || item.desc}</p>
                {authToken && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button disabled={voting[item.id || item._id]} onClick={() => handleVote(item._id || item.id, 'upvote')} style={{ ...styles.voteBtn, borderColor: '#27ae60', color: '#27ae60' }}>❤️ Resonate {item.votes?.upvote > 0 && `(${item.votes.upvote})`}</button>
                    <button disabled={voting[item.id || item._id]} onClick={() => handleVote(item._id || item.id, 'downvote')} style={{ ...styles.voteBtn, borderColor: '#95a5a6', color: '#95a5a6' }}>👁️ View {item.votes?.downvote > 0 && `(${item.votes.downvote})`}</button>
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

// --- MAIN APP COMPONENT ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [rankTitle, setRankTitle] = useState("bolshevik");
  const [rankScore, setRankScore] = useState(1);
  const [savedSets, setSavedSets] = useState([]);
  const [dumaItems, setDumaItems] = useState([{ id: 1, type: "Partner", company: "EcoHair Labs", product: "Silk Serum", desc: "Organic serum for hair.", section: "Commerce", submitterRank: "bolshevik" }]);
  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const email = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
    const storedSets = localStorage.getItem("savedSets");
    if (storedSets) { try { setSavedSets(JSON.parse(storedSets)); } catch (e) {} }
    if (token) {
      fetch(`${BACKEND_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(data => {
        if (data.email) { setIsLoggedIn(true); setUserEmail(data.email); setAuthToken(token); setRankTitle(data.rank_title || 'bolshevik'); setRankScore(data.rank_score || 1); } else { localStorage.removeItem("authToken"); localStorage.removeItem("userEmail"); sessionStorage.removeItem("authToken"); sessionStorage.removeItem("userEmail"); }
      }).catch(() => { if (email) { setIsLoggedIn(true); setUserEmail(email); setAuthToken(token); const storedRank = localStorage.getItem("rankTitle") || sessionStorage.getItem("rankTitle"); const storedScore = parseInt(localStorage.getItem("rankScore") || sessionStorage.getItem("rankScore") || "1"); if (storedRank) setRankTitle(storedRank); setRankScore(storedScore); } });
    }
  }, []);
  const handleLoginSuccess = (email, token, rememberMe, rank, score) => {
    setIsLoggedIn(true); setUserEmail(email); setAuthToken(token); const resolvedRank = rank || 'bolshevik'; const resolvedScore = score || 1; setRankTitle(resolvedRank); setRankScore(resolvedScore);
    const storage = rememberMe ? localStorage : sessionStorage; storage.setItem("authToken", token); storage.setItem("userEmail", email); storage.setItem("rankTitle", resolvedRank); storage.setItem("rankScore", String(resolvedScore));
  };
  const handleLogout = () => {
    setIsLoggedIn(false); setUserEmail(""); setAuthToken(""); setRankTitle("bolshevik"); setRankScore(1);
    localStorage.removeItem("authToken"); localStorage.removeItem("userEmail"); localStorage.removeItem("rankTitle"); localStorage.removeItem("rankScore");
    sessionStorage.removeItem("authToken"); sessionStorage.removeItem("userEmail"); sessionStorage.removeItem("rankTitle"); sessionStorage.removeItem("rankScore");
  };
  const saveSetToProfile = (items) => { const newSet = { items, date: new Date().toLocaleDateString() }; const updatedSets = [newSet, ...savedSets]; setSavedSets(updatedSets); localStorage.setItem("savedSets", JSON.stringify(updatedSets)); };
  const addDumaItem = (item) => setDumaItems(prev => [item, ...prev]);
  const addPoints = (points) => {
    const newScore = rankScore + points; setRankScore(newScore); const newRank = getRankTitle(newScore); setRankTitle(newRank);
    const storage = localStorage.getItem("authToken") ? localStorage : sessionStorage; storage.setItem("rankScore", String(newScore)); storage.setItem("rankTitle", newRank);
    if (authToken) { fetch(`${BACKEND_URL}/api/profile/add-points`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ points }) }).catch(err => console.error("Error updating points:", err)); }
  };
  return (
    <Router>
      <ScrollToTop />
      <div style={styles.pageWrapper}>
        <header style={styles.header}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}><div style={styles.logo}>The Majority Hair Solution</div></Link>
          <nav style={styles.nav}>
            <Link to="/" style={styles.navLink}>Home</Link>
            {isLoggedIn ? (
              <>
                <Link to="/recommend" style={styles.navLink}>Recommend</Link>
                <Link to="/partner" style={styles.navLink}>Partner</Link>
                <Link to="/duma" style={styles.navLink}>Duma</Link>
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
          <Route path="/" element={<LandingPage saveSetToProfile={saveSetToProfile} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLoginSuccess} />} />
          <Route path="/signup" element={<SignupPage onLogin={handleLoginSuccess} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/recommend" element={<RecommendPage addDumaItem={addDumaItem} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} />} />
          <Route path="/partner" element={<PartnerPage addDumaItem={addDumaItem} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} />} />
          <Route path="/duma" element={<DumaPage items={dumaItems} authToken={authToken} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} onAddPoints={addPoints} />} />
          <Route path="/legislature" element={<DumaPage items={dumaItems} authToken={authToken} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} onAddPoints={addPoints} />} />
          <Route path="/profile" element={<ProfilePage userEmail={userEmail} savedSets={savedSets} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} onAddPoints={addPoints} />} />
          <Route path="/orders" element={<div style={{ padding: '60px', textAlign: 'center' }}><h2>Payment Received!</h2><p>Your custom hair set is being prepared. Check your Profile to see your formula.</p><Link to="/profile">Go to Profile</Link></div>} />
        </Routes>
      </div>
    </Router>
  );
}

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
};
