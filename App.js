import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// --- 1. STRIPE INITIALIZATION ---
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// --- 2. BACKEND CONFIGURATION ---
const BACKEND_URL = "https://hair-backend-2.onrender.com";

// --- GOOGLE OAUTH CONFIG ---
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const GOOGLE_ENABLED = !!GOOGLE_CLIENT_ID;

// Launches Google One-Tap / popup and returns an access token
const signInWithGoogle = (onSuccess, onError) => {
  if (!window.google) { onError("Google Sign-In not loaded."); return; }
  window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: "email profile",
    callback: (res) => {
      if (res.error) { onError(res.error); return; }
      onSuccess(res.access_token);
    },
  }).requestAccessToken();
};

// Google "G" icon SVG
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: '8px' }}>
    <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
    <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
    <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
    <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
  </svg>
);

// "Or continue with email" divider
const OrDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
    <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }} />
    <span style={{ margin: '0 12px', fontSize: '12px', color: '#aaa' }}>or</span>
    <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }} />
  </div>
);

// --- 3. UI HELPERS ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// --- 4. STRIPE UI CONFIGURATION ---
const appearance = {
  theme: 'flat',
  variables: { colorPrimaryText: '#262626' }
};

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

// --- PROFILE PAGE COMPONENT ---
const ProfilePage = ({ userEmail, savedSets }) => (
  <div style={{ padding: '40px 60px', maxWidth: '900px', margin: '0 auto' }}>
    <div style={{ marginBottom: '40px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Welcome back,</h1>
      <p style={{ color: '#666' }}>{userEmail}</p>
    </div>

    <section>
      <h3>Your Saved Formulas</h3>
      {savedSets.length === 0 ? (
        <div style={styles.legislatureCard}>
          <p style={{ color: '#888' }}>You haven't saved any custom sets yet. Head home to build your first one!</p>
          <Link to="/"><button style={{ ...styles.authButton, width: '200px', marginTop: '10px' }}>Start Building</button></Link>
        </div>
      ) : (
        savedSets.map((set, index) => (
          <div key={index} style={styles.legislatureCard}>
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
      confirmParams: {
        return_url: `${window.location.origin}/orders`,
      },
      redirect: 'if_required'
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else {
      onPurchaseSuccess();
    }
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

// --- LOGIN PAGE ---
const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) return setErrorMsg("Please enter your email and password.");
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });
      const data = await response.json();
      if (response.ok) {
        onLogin(data.email, data.token, rememberMe);
        navigate("/");
      } else {
        setErrorMsg(data.error || "Invalid email or password.");
      }
    } catch (err) {
      setErrorMsg("Server is waking up — please try again in 30 seconds.");
    }
    setIsLoading(false);
  };

  const handleGoogle = () => {
    setErrorMsg("");
    signInWithGoogle(async (accessToken) => {
      setIsLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken })
        });
        const data = await response.json();
        if (response.ok) { onLogin(data.email, data.token, true); navigate("/"); }
        else setErrorMsg(data.error || "Google sign-in failed.");
      } catch (err) { setErrorMsg("Google sign-in failed. Please try again."); }  // FIX: was bare catch {}
      setIsLoading(false);
    }, (err) => setErrorMsg(err));
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.authCard}>
        <h2 style={{ marginBottom: '6px' }}>Sign In</h2>
        <p style={{ color: '#888', fontSize: '13px', marginTop: 0, marginBottom: '20px' }}>Welcome back to Majority Hair Solutions</p>
        {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}
        {GOOGLE_ENABLED && (
          <>
            <button style={styles.googleButton} onClick={handleGoogle} disabled={isLoading}>
              <GoogleIcon /> Continue with Google
            </button>
            <OrDivider />
          </>
        )}
        <input type="email" placeholder="Email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
        <input type="password" placeholder="Password" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 0 14px' }}>
          <label style={{ fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#555' }}>
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ accentColor: '#222' }} />
            Remember me
          </label>
          <Link to="/forgot-password" style={{ fontSize: '13px', color: '#666', textDecoration: 'none' }}>Forgot password?</Link>
        </div>
        <button style={styles.authButton} onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Signing in…" : "Sign In"}
        </button>
        <p style={{ textAlign: 'center', fontSize: '13px', marginTop: '20px', color: '#666' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#222', fontWeight: '600', textDecoration: 'none' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

// --- SIGNUP PAGE ---
const SignupPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) return setErrorMsg("Please fill in all fields.");
    if (password !== confirmPassword) return setErrorMsg("Passwords do not match.");
    if (password.length < 8) return setErrorMsg("Password must be at least 8 characters.");
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch(`${BACKEND_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) { onLogin(data.email, data.token, false); navigate("/"); }
      else setErrorMsg(data.error || "Signup failed. Please try again.");
    } catch (err) { setErrorMsg("Server is waking up — please try again in 30 seconds."); }  // FIX: was bare catch {}
    setIsLoading(false);
  };

  const handleGoogle = () => {
    setErrorMsg("");
    signInWithGoogle(async (accessToken) => {
      setIsLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken })
        });
        const data = await response.json();
        if (response.ok) { onLogin(data.email, data.token, true); navigate("/"); }
        else setErrorMsg(data.error || "Google sign-up failed.");
      } catch (err) { setErrorMsg("Google sign-up failed. Please try again."); }  // FIX: was bare catch {}
      setIsLoading(false);
    }, (err) => setErrorMsg(err));
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.authCard}>
        <h2 style={{ marginBottom: '6px' }}>Create Account</h2>
        <p style={{ color: '#888', fontSize: '13px', marginTop: 0, marginBottom: '20px' }}>Join Majority Hair Solutions</p>
        {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}
        {GOOGLE_ENABLED && (
          <>
            <button style={styles.googleButton} onClick={handleGoogle} disabled={isLoading}>
              <GoogleIcon /> Sign up with Google
            </button>
            <OrDivider />
          </>
        )}
        <input type="email" placeholder="Email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password (min. 8 characters)" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder="Confirm Password" style={styles.input} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
        <button style={styles.authButton} onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Creating account…" : "Create Account"}
        </button>
        <p style={{ textAlign: 'center', fontSize: '13px', marginTop: '20px', color: '#666' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#222', fontWeight: '600', textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

// --- FORGOT PASSWORD PAGE ---
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    if (!email) return setErrorMsg("Please enter your email address.");
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.ok) { setSent(true); }
      else setErrorMsg("Something went wrong. Please try again.");
    } catch (err) { setErrorMsg("Server is waking up — please try again in 30 seconds."); }  // FIX: was bare catch {}
    setIsLoading(false);
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.authCard}>
        <h2 style={{ marginBottom: '6px' }}>Forgot Password?</h2>
        {sent ? (
          <p style={{ color: '#222', fontWeight: '600', fontSize: '14px', marginTop: '16px' }}>Check your email for a reset link!</p>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: '#666', marginTop: 0, marginBottom: '16px' }}>Enter your email and we'll send you a reset link.</p>
            {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}
            <input type="email" placeholder="Email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
            <button style={styles.authButton} onClick={handleSubmit}>{isLoading ? "Sending..." : "Send Reset Link"}</button>
          </>
        )}
      </div>
    </div>
  );
};

// --- RESET PASSWORD PAGE ---
const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = async () => {
    if (password !== confirmPassword) return setMessage("Passwords do not match.");
    if (password.length < 8) return setMessage("Password must be at least 8 characters.");
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (response.ok) {
        setIsSuccess(true);
        setMessage("Password reset! You can now log in.");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setMessage(data.error || "Reset link may have expired. Please request a new one.");
      }
    } catch (err) {
      setMessage("Server error. Try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.authContainer}><div style={styles.authCard}>
      <h2>Reset Password</h2>
      {message ? (
        <p style={{ color: isSuccess ? '#2a7a2a' : '#c0392b', fontWeight: '600', fontSize: '14px' }}>{message}</p>
      ) : null}
      {!isSuccess && (
        <>
          <input type="password" placeholder="New Password" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="password" placeholder="Confirm New Password" style={styles.input} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <button style={styles.authButton} onClick={handleReset}>{isLoading ? "Resetting..." : "Reset Password"}</button>
        </>
      )}
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

  const onPurchaseSuccess = () => {
    saveSetToProfile(selectedItems);
    navigate("/orders");
  };

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
                  <button style={styles.checkoutBtn} onClick={() => initializePayment(24.99)}>Checkout One-Time ($24.99)</button>
                  <button style={{ ...styles.checkoutBtn, background: '#222', color: '#fff' }} onClick={() => initializePayment(19.99)}>Subscribe ($19.99/mo)</button>
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

// --- RECOMMEND & PARTNER & LEGISLATURE ---
const RecommendPage = ({ addLegislatureItem }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", company: "", website: "", reason: "" });
  const handleSubmit = (e) => { e.preventDefault(); addLegislatureItem({ ...formData, id: Date.now(), type: "Recommendation" }); navigate("/legislature"); };
  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2>Recommend Products</h2>
      <form style={styles.legislatureCard} onSubmit={handleSubmit}>
        <input required placeholder="Product Name *" style={styles.input} onChange={e => setFormData({...formData, name: e.target.value})} />
        <input required placeholder="Company Name *" style={styles.input} onChange={e => setFormData({...formData, company: e.target.value})} />
        <textarea required placeholder="Reason *" style={{ ...styles.input, height: '100px' }} onChange={e => setFormData({...formData, reason: e.target.value})} />
        <button type="submit" style={styles.authButton}>Submit to Legislature</button>
      </form>
    </div>
  );
};

const PartnerPage = ({ addLegislatureItem }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ company: "", product: "", desc: "" });
  const handleSubmit = (e) => { e.preventDefault(); addLegislatureItem({ ...formData, id: Date.now(), type: "Partner" }); navigate("/legislature"); };
  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2>Partner with The Majority</h2>
      <form style={styles.legislatureCard} onSubmit={handleSubmit}>
        <input required placeholder="Company Name *" style={styles.input} onChange={e => setFormData({...formData, company: e.target.value})} />
        <input required placeholder="Product Name *" style={styles.input} onChange={e => setFormData({...formData, product: e.target.value})} />
        <textarea required placeholder="Description *" style={styles.input} onChange={e => setFormData({...formData, desc: e.target.value})} />
        <button type="submit" style={styles.authButton}>Submit Application</button>
      </form>
    </div>
  );
};

const LegislaturePage = ({ items }) => (
  <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
    <h2>The Majority's Legislature</h2>
    {items.map(item => (
      <div key={item.id} style={styles.legislatureCard}>
        <span style={styles.typeTag}>{item.type}</span>
        <h3>{item.name || item.product} by {item.company}</h3>
        <p>{item.reason || item.desc}</p>
      </div>
    ))}
  </div>
);

// --- MAIN APP COMPONENT ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [savedSets, setSavedSets] = useState([]);
  const [legislatureItems, setLegislatureItems] = useState([
    { id: 1, type: "Partner", company: "EcoHair Labs", product: "Silk Serum", desc: "Organic serum for hair." }
  ]);

  // Load Google Sign-In script
  useEffect(() => {
    if (GOOGLE_ENABLED) {
      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      document.head.appendChild(script);
      return () => { if (document.head.contains(script)) document.head.removeChild(script); };
    }
  }, []);

  // Restore session on load and validate token with backend
  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const email = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
    const storedSets = localStorage.getItem("savedSets");
    if (storedSets) { try { setSavedSets(JSON.parse(storedSets)); } catch (e) {} }
    if (token) {
      fetch(`${BACKEND_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          if (data.email) { setIsLoggedIn(true); setUserEmail(data.email); setAuthToken(token); }
          else {
            localStorage.removeItem("authToken"); localStorage.removeItem("userEmail");
            sessionStorage.removeItem("authToken"); sessionStorage.removeItem("userEmail");
          }
        })
        .catch(() => { if (email) { setIsLoggedIn(true); setUserEmail(email); setAuthToken(token); } });
    }
  }, []);

  const handleLoginSuccess = (email, token, rememberMe) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setAuthToken(token);
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("authToken", token);
    storage.setItem("userEmail", email);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    setAuthToken("");
    localStorage.removeItem("authToken"); localStorage.removeItem("userEmail");
    sessionStorage.removeItem("authToken"); sessionStorage.removeItem("userEmail");
  };

  const saveSetToProfile = (items) => {
    const newSet = { items, date: new Date().toLocaleDateString() };
    const updatedSets = [newSet, ...savedSets];
    setSavedSets(updatedSets);
    localStorage.setItem("savedSets", JSON.stringify(updatedSets));
  };

  const addLegislatureItem = (item) => setLegislatureItems([item, ...legislatureItems]);

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
                <Link to="/legislature" style={styles.navLink}>Legislature</Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid #eee', paddingLeft: '15px' }}>
                   <Link to="/profile" style={{ ...styles.navLink, fontWeight: '700' }}>Profile</Link>
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
          <Route path="/recommend" element={<RecommendPage addLegislatureItem={addLegislatureItem} />} />
          <Route path="/partner" element={<PartnerPage addLegislatureItem={addLegislatureItem} />} />
          <Route path="/legislature" element={<LegislaturePage items={legislatureItems} />} />
          <Route path="/profile" element={<ProfilePage userEmail={userEmail} savedSets={savedSets} />} />
          <Route path="/orders" element={<div style={{ padding: '60px', textAlign: 'center' }}><h2>Payment Received!</h2><p>Your custom hair set is being prepared. Check your Profile to see your formula.</p><Link to="/profile">Go to Profile</Link></div>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
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
  authContainer: { display: 'flex', justifyContent: 'center', minHeight: '70vh', alignItems: 'center', padding: '20px' },
  authCard: { width: '100%', maxWidth: '400px', padding: '36px', border: '1px solid #eee', borderRadius: '24px' },
  input: { width: '100%', padding: '12px', margin: '6px 0', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' },
  authButton: { width: '100%', padding: '12px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  googleButton: { width: '100%', padding: '11px', backgroundColor: '#fff', color: '#222', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  errorMsg: { background: '#fff3f3', color: '#c00', border: '1px solid #fcc', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '12px', textAlign: 'left' },
  formSectionTitle: { fontSize: '13px', fontWeight: '800', marginTop: '20px', borderBottom: '1px solid #eee', paddingBottom: '5px', textTransform: 'uppercase' },
  uploadBox: { border: '2px dashed #ddd', borderRadius: '12px', padding: '20px', textAlign: 'center', backgroundColor: '#fafafa' },
  legislatureCard: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '24px', padding: '30px', marginBottom: '20px' },
  typeTag: { background: '#222', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '10px' },
};