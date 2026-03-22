import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// --- LOADING SPINNER COMPONENT ---
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 9999,
    backdropFilter: 'blur(4px)'
  }}>
    <div style={{
      width: '60px',
      height: '60px',
      border: '4px solid #f0f0f0',
      borderTop: '4px solid #222',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      marginBottom: '20px'
    }} />
    <div style={{ fontSize: '18px', fontWeight: '600', color: '#222', marginBottom: '8px' }}>
      {message}
    </div>
    <div style={{ fontSize: '13px', color: '#888' }}>
      This may take up to 60 seconds on our free tier.
    </div>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// --- ENHANCED LOADING SPINNER ---
const EnhancedLoadingSpinner = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  
  const messages = [
    "⏳ Initializing server...",
    "⏳ Still waking up...",
    "⏳ Almost there...",
    "⏳ Service coming online...",
    "⏳ Final preparations...",
    "✅ Server ready!"
  ];

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((now - startTime) / 1000);
      setElapsed(diff);
      
      if (diff < 5) setMessageIndex(0);
      else if (diff < 15) setMessageIndex(1);
      else if (diff < 30) setMessageIndex(2);
      else if (diff < 45) setMessageIndex(3);
      else if (diff < 60) setMessageIndex(4);
      else setMessageIndex(5);
    }, 500);
    return () => clearInterval(interval);
  }, [startTime]);

  const progress = Math.min((elapsed / 60) * 100, 100);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      zIndex: 9999
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '3px solid #e0e0e0',
        borderTop: '3px solid #222',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginBottom: '30px'
      }} />
      
      <div style={{ fontSize: '18px', fontWeight: '600', color: '#222', marginBottom: '8px', minHeight: '24px' }}>
        {messages[messageIndex]}
      </div>
      
      <div style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
        {elapsed} / ~60 seconds
      </div>
      
      <div style={{ width: '160px', height: '4px', backgroundColor: '#e0e0e0', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: '#222',
          transition: 'width 0.3s ease'
        }} />
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// --- 1. STRIPE INITIALIZATION ---
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// --- 2. BACKEND CONFIGURATION ---
const BACKEND_URL = "https://hair-backend-2.onrender.com";

// --- GOOGLE OAUTH CONFIG ---
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const GOOGLE_ENABLED = !!GOOGLE_CLIENT_ID;

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

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: '8px' }}>
    <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
    <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
    <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
    <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
  </svg>
);

const OrDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
    <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }} />
    <span style={{ margin: '0 12px', fontSize: '12px', color: '#aaa' }}>or</span>
    <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }} />
  </div>
);

// --- VALIDATION HELPERS ---
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '#ddd' };
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*]/.test(password)) strength++;
  
  const levels = [
    { score: 0, label: 'Too weak', color: '#ccc' },
    { score: 1, label: 'Weak', color: '#e74c3c' },
    { score: 2, label: 'Fair', color: '#f39c12' },
    { score: 3, label: 'Good', color: '#f1c40f' },
    { score: 4, label: 'Strong', color: '#2ecc71' },
    { score: 5, label: 'Very strong', color: '#27ae60' }
  ];
  return levels[strength] || levels[0];
};

// --- PASSWORD INPUT COMPONENT ---
const PasswordInputField = ({ value, onChange, onKeyDown, placeholder = 'Password' }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const strength = getPasswordStrength(value);

  const handleKeyDown = (e) => {
    setCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'));
    if (onKeyDown) onKeyDown(e);
  };

  return (
    <div style={{ marginBottom: '14px', position: 'relative' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '12px 36px 12px 12px',
            borderRadius: '8px',
            border: `1.5px solid ${value ? (strength.score >= 3 ? '#2ecc71' : '#f39c12') : '#ddd'}`,
            boxSizing: 'border-box',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            backgroundColor: '#fafafa'
          }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: '10px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666'
          }}
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>

      {value && (
        <div style={{ marginTop: '6px', display: 'flex', gap: '4px', alignItems: 'center' }}>
          <div style={{ flex: 1, height: '3px', backgroundColor: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${(strength.score / 5) * 100}%`,
                backgroundColor: strength.color,
                transition: 'width 0.3s ease, background-color 0.3s ease'
              }}
            />
          </div>
          <span style={{ fontSize: '11px', color: strength.color, fontWeight: '600', minWidth: '70px' }}>
            {strength.label}
          </span>
        </div>
      )}

      {capsLockOn && (
        <div style={{
          marginTop: '6px',
          padding: '8px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#856404',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          ⌨️ Caps Lock is on
        </div>
      )}
    </div>
  );
};

// --- EMAIL INPUT COMPONENT ---
const EmailInputField = ({ value, onChange, onKeyDown, placeholder = 'Email' }) => {
  const isValid = !value || validateEmail(value);
  const hasError = value && !isValid;

  return (
    <div style={{ marginBottom: '14px', position: 'relative' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="email"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          style={{
            width: '100%',
            padding: '12px 36px 12px 12px',
            borderRadius: '8px',
            border: `1.5px solid ${hasError ? '#e74c3c' : isValid && value ? '#2ecc71' : '#ddd'}`,
            boxSizing: 'border-box',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            backgroundColor: '#fafafa'
          }}
        />
        {value && (
          <div style={{ position: 'absolute', right: '10px', fontSize: '16px' }}>
            {hasError ? '✗' : '✓'}
          </div>
        )}
      </div>
      {hasError && (
        <div style={{
          marginTop: '6px',
          fontSize: '12px',
          color: '#e74c3c',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          ⚠️ Please enter a valid email
        </div>
      )}
    </div>
  );
};

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

// Color for rank badge based on tier level
const getRankColor = (rankTitle) => {
  const topGold = ["General Secretary", "Premier", "Head of State"];
  const midPurple = ["Politburo", "Party National", "Central committee", "Councils of ministers"];
  const midBlue = ["Supreme soviets", "Republican Party committeemen", "Regional party head", "City Party Head", "District Party head", "District Soviet"];
  if (topGold.includes(rankTitle)) return '#FFD700';
  if (midPurple.includes(rankTitle)) return '#9b59b6';
  if (midBlue.includes(rankTitle)) return '#2980b9';
  return '#888';
};

const isPolitburoOrHigher = (score) => score >= 4000001;

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

// --- UI HELPERS ---
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
const ProfilePage = ({ userEmail, savedSets, rankTitle, rankScore }) => (
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
  const [isServerWaking, setIsServerWaking] = useState(false);
  const [serverWakeStartTime, setServerWakeStartTime] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) return setErrorMsg("Please enter your email and password.");
    setIsLoading(true);
    setIsServerWaking(false);
    setErrorMsg("");
    
    const serverWakeTimer = setTimeout(() => {
      setIsServerWaking(true);
    }, 3000);

    try {
      const response = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe })
      });
      clearTimeout(serverWakeTimer);
      const data = await response.json();
      if (response.ok) {
        onLogin(data.email, data.token, rememberMe, data.rank_title, data.rank_score);
        navigate("/");
      } else {
        setErrorMsg(data.error || "Invalid email or password.");
        setIsLoading(false);
        setIsServerWaking(false);
      }
    } catch (err) {
      clearTimeout(serverWakeTimer);
      if (isServerWaking) {
        setErrorMsg("Server is still waking up. Please try again in a moment.");
      } else {
        setErrorMsg("Server is waking up â€” please try again in 30 seconds.");
      }
      setIsLoading(false);
      setIsServerWaking(false);
    }
  };

  if (isServerWaking) {
    return <LoadingSpinner message="Waking up server..." />;
  }

  const handleGoogle = () => {
    setErrorMsg("");
    signInWithGoogle(async (accessToken) => {
      setIsLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ accessToken })
        });
        const data = await response.json();
        if (response.ok) { onLogin(data.email, data.token, true, data.rank_title, data.rank_score); navigate("/"); }
        else setErrorMsg(data.error || "Google sign-in failed.");
      } catch (err) { setErrorMsg("Google sign-in failed. Please try again."); }
      setIsLoading(false);
    }, (err) => setErrorMsg(err));
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.authCard}>
        <h2 style={{ marginBottom: '8px', fontSize: '28px', fontWeight: '700' }}>Welcome Back</h2>
        <p style={{ color: '#888', fontSize: '14px', marginTop: 0, marginBottom: '24px', lineHeight: '1.4' }}>
          Sign in to your Majority Hair Solutions account
        </p>
        {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}
        {GOOGLE_ENABLED && (
          <>
            <button 
              style={styles.googleButtonEnhanced} 
              onClick={handleGoogle} 
              disabled={isLoading}
              title="Sign in with your Google account for faster authentication"
            >
              <GoogleIcon /> 
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: '600' }}>Continue with Google</span>
                <span style={{ fontSize: '11px', opacity: 0.7 }}>Fast & secure</span>
              </div>
            </button>
            <OrDivider />
          </>
        )}
        <EmailInputField 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && isFormValid && handleSubmit()} 
          placeholder="Email address"
        />
        <PasswordInputField 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && isFormValid && handleSubmit()} 
          placeholder="Password"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0 20px' }}>
          <label style={{ fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#555' }}>
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ accentColor: '#222' }} />
            Remember me
          </label>
          <Link to="/forgot-password" style={{ fontSize: '13px', color: '#666', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#222'} onMouseLeave={(e) => e.target.style.color = '#666'}>
            Forgot password?
          </Link>
        </div>
        <button 
          style={{...styles.authButton, opacity: isFormValid ? 1 : 0.6, cursor: isFormValid ? 'pointer' : 'not-allowed'}} 
          onClick={handleSubmit} 
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', margin: '14px 0', fontSize: '12px', color: '#aaa' }}>
          🔒 Secure login with encryption
        </div>
        <p style={{ textAlign: 'center', fontSize: '13px', marginTop: '20px', color: '#666' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#222', fontWeight: '600', textDecoration: 'none' }}>Create one</Link>
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
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) { 
        onLogin(data.email, data.token, false, data.rank_title, 1); 
        const redirect = sessionStorage.getItem("redirectAfterSignup");
        sessionStorage.removeItem("redirectAfterSignup");
        navigate(redirect === "checkout" ? "/" : "/");
      }
      else setErrorMsg(data.error || "Signup failed. Please try again.");
    } catch (err) { setErrorMsg("Server is waking up â€” please try again in 30 seconds."); }
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
          credentials: 'include',
          body: JSON.stringify({ accessToken })
        });
        const data = await response.json();
        if (response.ok) { 
          onLogin(data.email, data.token, true, data.rank_title, data.rank_score); 
          const redirect = sessionStorage.getItem("redirectAfterSignup");
          sessionStorage.removeItem("redirectAfterSignup");
          navigate(redirect === "checkout" ? "/" : "/");
        }
        else setErrorMsg(data.error || "Google sign-up failed.");
      } catch (err) { setErrorMsg("Google sign-up failed. Please try again."); }
      setIsLoading(false);
    }, (err) => setErrorMsg(err));
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.authCard}>
        <h2 style={{ marginBottom: '8px', fontSize: '28px', fontWeight: '700' }}>Create Account</h2>
        <p style={{ color: '#888', fontSize: '14px', marginTop: 0, marginBottom: '24px', lineHeight: '1.4' }}>Join Majority Hair Solutions and build your custom hair care formulas</p>
        {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}
        {GOOGLE_ENABLED && (
          <>
            <button 
              style={styles.googleButtonEnhanced} 
              onClick={handleGoogle} 
              disabled={isLoading}
              title="Sign up with your Google account for faster registration"
            >
              <GoogleIcon /> 
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: '600' }}>Sign up with Google</span>
                <span style={{ fontSize: '11px', opacity: 0.7 }}>Fast & secure</span>
              </div>
            </button>
            <OrDivider />
          </>
        )}
        <EmailInputField 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email address"
        />
        <PasswordInputField 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password"
        />
        <div style={{ marginBottom: '14px', position: 'relative' }}>
          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && isFormValid && handleSubmit()}
            style={{
              width: '100%',
              padding: '12px 36px 12px 12px',
              borderRadius: '8px',
              border: `1.5px solid ${confirmPassword && passwordsMatch ? '#2ecc71' : confirmPassword ? '#e74c3c' : '#ddd'}`,
              boxSizing: 'border-box',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              backgroundColor: '#fafafa'
            }}
          />
          {confirmPassword && (
            <div style={{ position: 'absolute', right: '10px', top: '12px', fontSize: '16px' }}>
              {passwordsMatch ? '✓' : '✗'}
            </div>
          )}
          {confirmPassword && !passwordsMatch && (
            <div style={{
              marginTop: '6px',
              fontSize: '12px',
              color: '#e74c3c',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              ⚠️ Passwords don't match
            </div>
          )}
        </div>
        <button 
          style={{...styles.authButton, opacity: isFormValid ? 1 : 0.6, cursor: isFormValid ? 'pointer' : 'not-allowed'}} 
          onClick={handleSubmit} 
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', margin: '14px 0', fontSize: '12px', color: '#aaa' }}>
          🔒 Secure signup with encryption
        </div>
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
        credentials: 'include',
        body: JSON.stringify({ email })
      });
      if (response.ok) { setSent(true); }
      else setErrorMsg("Something went wrong. Please try again.");
    } catch (err) { setErrorMsg("Server is waking up â€” please try again in 30 seconds."); }
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
        credentials: 'include',
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
function LandingPage({ saveSetToProfile, authToken }) {
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

  const initializePayment = async (amt, type) => {
    // Subscription requires login
    if (type === "subscription" && !authToken) {
      sessionStorage.setItem("redirectAfterSignup", "checkout");
      navigate("/signup");
      return;
    }

    // One-time purchase allowed for guests - proceed directly
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
    <>
      <style>{`
        @media (max-width: 768px) {
          .landing-layout { display: flex; flex-direction: column; padding: 15px !important; }
          .landing-left { width: 100% !important; padding-right: 0 !important; }
          .landing-right { width: 100% !important; position: static !important; margin-top: 20px; }
        }
      `}</style>
      <div style={styles.layout} className="landing-layout">
        <div style={styles.left} className="landing-left">
        {renderRow("Pick Shampoo 1", "shampoo1", "shampoos")}
        {renderRow("Pick Shampoo 2", "shampoo2", "shampoos")}
        {renderRow("Pick Conditioner 1", "conditioner1", "conditioners")}
        {renderRow("Pick Conditioner 2", "conditioner2", "conditioners")}
        {renderRow("Pick Oil 1", "oil1", "oils")}
        {renderRow("Pick Oil 2", "oil2", "oils")}
      </div>
      <aside style={styles.right} className="landing-right">
        <div style={{ minHeight: '100px', marginBottom: '15px' }}>
          {focusedItem ? (<div><h3>{focusedItem.name}</h3><p style={{ fontSize: '13px', color: '#666' }}>{focusedItem.desc}</p></div>) : <p style={{color: '#888'}}>Select a product</p>}
        </div>
        <div style={styles.summaryContainer}>
          <h4 style={{ fontSize: '14px', borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0 }}>Your Custom Set ({selectedItems.length}/6)</h4>
          <div style={{ margin: '10px 0' }}>{selectedItems.map((item, idx) => (<p key={idx} style={{ fontSize: '11px', margin: '4px 0' }}>âœ“ {item.name}</p>))}</div>
          {isSetComplete ? (
            <div style={{ borderTop: '2px solid #222', paddingTop: '15px' }}>
              {!clientSecret ? (
                <>
                  <button style={styles.checkoutBtn} onClick={() => initializePayment(30, "one-time")}>One-Time Purchase — $30.00</button>
                  <button style={{ ...styles.checkoutBtn, background: '#222', color: '#fff' }} onClick={() => initializePayment(25, "subscription")}>Monthly Subscription — $25.00/mo</button>
                </>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                  <CheckoutForm totalPrice={price} onPurchaseSuccess={onPurchaseSuccess} />
                  <button onClick={() => setClientSecret("")} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '11px', marginTop: '10px' }}>â† Change Plan</button>
                </Elements>
              )}
            </div>
          ) : <p style={{ fontSize: '12px', color: '#888' }}>Select 6 products to checkout</p>}
        </div>
      </aside>
    </div>
    </>
  );
}

// --- RECOMMEND PAGE ---
const RecommendPage = ({ addDumaItem, userEmail, rankTitle, rankScore, authToken }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", company: "", reason: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      // Try backend first if logged in
      if (authToken) {
        const res = await fetch(`${BACKEND_URL}/api/duma/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (!res.ok) { setErrorMsg(data.error || 'Submission failed'); return; }
      }
      // Also update local state
      addDumaItem({
        ...formData,
        id: Date.now(),
        type: "Recommendation",
        submittedBy: userEmail,
        submitterRank: rankTitle || 'bolshevik'
      });
      setSubmitted(true);
    } catch (err) {
      // Fallback to local only
      addDumaItem({ ...formData, id: Date.now(), type: "Recommendation", submittedBy: userEmail, submitterRank: rankTitle || 'bolshevik' });
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ ...styles.dumaCard, textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>âœ…</div>
          <h2 style={{ marginBottom: '10px' }}>Recommendation Submitted!</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Your recommendation has been sent to The Majority's Duma for voting.
          </p>
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
      <h2>Recommend Products</h2>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Recommendations go directly to <strong>The Majority's Duma</strong> for community voting.
      </p>
      {userEmail && rankTitle && (
        <div style={{ marginBottom: '20px' }}>
          <CredentialHeader email={userEmail} rankTitle={rankTitle} rankScore={rankScore} />
        </div>
      )}
      {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}
      <form style={styles.dumaCard} onSubmit={handleSubmit}>
        <input required placeholder="Product Name *" style={styles.input} onChange={e => setFormData({...formData, name: e.target.value})} />
        <input required placeholder="Company Name *" style={styles.input} onChange={e => setFormData({...formData, company: e.target.value})} />
        <textarea required placeholder="Reason *" style={{ ...styles.input, height: '100px' }} onChange={e => setFormData({...formData, reason: e.target.value})} />
        <button type="submit" style={styles.authButton}>Submit to the Duma</button>
      </form>
    </div>
  );
};

// --- PARTNER PAGE ---
const PartnerPage = ({ addDumaItem, userEmail, rankTitle, rankScore, authToken }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ company: "", product: "", desc: "", tier: "National Associate" });
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const userScore = rankScore || 1;
  const canApplyPremium = isPolitburoOrHigher(userScore);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.tier === "Premium Partner" && !canApplyPremium) {
      setErrorMsg("Premium Partner status requires Politburo rank or higher. Keep building your influence!");
      return;
    }

    try {
      if (authToken) {
        const res = await fetch(`${BACKEND_URL}/api/duma/partner`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (!res.ok) { setErrorMsg(data.error || 'Submission failed'); return; }
      }
      addDumaItem({ ...formData, id: Date.now(), type: "Partner", submittedBy: userEmail, submitterRank: rankTitle || 'bolshevik' });
      setSubmitted(true);
    } catch (err) {
      addDumaItem({ ...formData, id: Date.now(), type: "Partner", submittedBy: userEmail, submitterRank: rankTitle || 'bolshevik' });
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ ...styles.dumaCard, textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>ðŸ¤</div>
          <h2>Partner Application Submitted!</h2>
          <p style={{ color: '#666' }}>Your application has been sent to The Majority's Duma.</p>
          <button style={{ ...styles.authButton, marginTop: '20px', width: 'auto', padding: '12px 24px' }} onClick={() => navigate("/duma")}>View the Duma</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2>Partner with The Majority</h2>
      {userEmail && rankTitle && (
        <div style={{ marginBottom: '20px' }}>
          <CredentialHeader email={userEmail} rankTitle={rankTitle} rankScore={rankScore} />
        </div>
      )}
      {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}
      <form style={styles.dumaCard} onSubmit={handleSubmit}>
        <input required placeholder="Company Name *" style={styles.input} onChange={e => setFormData({...formData, company: e.target.value})} />
        <input required placeholder="Product Name *" style={styles.input} onChange={e => setFormData({...formData, product: e.target.value})} />
        <textarea required placeholder="Description *" style={styles.input} onChange={e => setFormData({...formData, desc: e.target.value})} />

        <div style={{ marginTop: '10px' }}>
          <label style={styles.formSectionTitle}>Partner Tier</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
              <input type="radio" name="tier" value="National Associate"
                checked={formData.tier === "National Associate"}
                onChange={e => setFormData({...formData, tier: e.target.value})} />
              National Associate
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: canApplyPremium ? 'pointer' : 'not-allowed', opacity: canApplyPremium ? 1 : 0.5 }}>
              <input type="radio" name="tier" value="Premium Partner"
                checked={formData.tier === "Premium Partner"}
                disabled={!canApplyPremium}
                onChange={e => setFormData({...formData, tier: e.target.value})} />
              Premium Partner {!canApplyPremium && <span style={{ fontSize: '11px', color: '#aaa' }}>(Politburo+ only)</span>}
            </label>
          </div>
        </div>

        <button type="submit" style={{ ...styles.authButton, marginTop: '16px' }}>Submit Application</button>
      </form>
    </div>
  );
};

// --- DUMA PAGE (formerly Legislature) ---
const DumaPage = ({ items, authToken, userEmail, rankTitle, rankScore }) => {
  const [dumaItems, setDumaItems] = useState(items);
  const [voting, setVoting] = useState({});

  useEffect(() => {
    // Try to load from backend
    fetch(`${BACKEND_URL}/api/duma`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setDumaItems([...data, ...items]); })
      .catch(() => {});
  }, []);

  const handleVote = async (itemId, vote) => {
    if (!authToken) return alert("Please log in to vote.");
    setVoting(prev => ({ ...prev, [itemId]: true }));
    try {
      await fetch(`${BACKEND_URL}/api/duma/${itemId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ vote })
      });
    } catch (err) {}
    setVoting(prev => ({ ...prev, [itemId]: false }));
  };

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h2 style={{ marginBottom: '6px' }}>The Majority's Duma</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Community recommendations and partner applications â€” vote to shape The Majority.
          </p>
        </div>
        {userEmail && rankTitle && (
          <div style={{ textAlign: 'right' }}>
            <CredentialHeader email={userEmail} rankTitle={rankTitle} rankScore={rankScore} />
          </div>
        )}
      </div>

      {dumaItems.length === 0 && (
        <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888' }}>
          No submissions yet. Be the first to recommend a product!
        </div>
      )}

      {dumaItems.map(item => (
        <div key={item.id || item._id} style={styles.dumaCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={styles.typeTag}>{item.type}</span>
            {item.submitterRank && <RankBadge rankTitle={item.submitterRank} />}
          </div>
          {item.submittedBy && (
            <CredentialHeader
              email={item.submittedBy}
              rankTitle={item.submitterRank || 'bolshevik'}
              rankScore={null}
            />
          )}
          <h3 style={{ marginTop: '8px', marginBottom: '6px' }}>{item.name || item.product} by {item.company}</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>{item.reason || item.desc}</p>
          {authToken && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button
                disabled={voting[item.id || item._id]}
                onClick={() => handleVote(item._id || item.id, 'yay')}
                style={{ ...styles.voteBtn, borderColor: '#27ae60', color: '#27ae60' }}>
                ðŸ‘ Yay {item.votes?.yay > 0 && `(${item.votes.yay})`}
              </button>
              <button
                disabled={voting[item.id || item._id]}
                onClick={() => handleVote(item._id || item.id, 'nay')}
                style={{ ...styles.voteBtn, borderColor: '#e74c3c', color: '#e74c3c' }}>
                ðŸ‘Ž Nay {item.votes?.nay > 0 && `(${item.votes.nay})`}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [savedSets, setSavedSets] = useState([]);
  const [rankTitle, setRankTitle] = useState("bolshevik");
  const [rankScore, setRankScore] = useState(1);
  const [isServerWaking, setIsServerWaking] = useState(true);
  const [dumaItems, setDumaItems] = useState([
    { id: 1, type: "Partner", company: "EcoHair Labs", product: "Silk Serum", desc: "Organic serum for hair.", submitterRank: "bolshevik" }
  ]);

  // Health check to wake up backend server
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/health`, { timeout: 10000 });
        if (response.ok) {
          setIsServerWaking(false);
        }
      } catch (err) {
        // Retry once after 2 seconds
        setTimeout(() => {
          fetch(`${BACKEND_URL}/api/health`)
            .then(() => setIsServerWaking(false))
            .catch(() => setIsServerWaking(false));
        }, 2000);
      }
    };

    checkServerHealth();
  }, []);

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

  // Restore session and validate token
  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const email = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
    const storedSets = localStorage.getItem("savedSets");
    if (storedSets) { try { setSavedSets(JSON.parse(storedSets)); } catch (e) {} }
    if (token) {
      fetch(`${BACKEND_URL}/api/auth/me`, { 
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })
        .then(r => r.json())
        .then(data => {
          if (data.email) {
            setIsLoggedIn(true);
            setUserEmail(data.email);
            setAuthToken(token);
            setRankTitle(data.rank_title || 'bolshevik');
            setRankScore(data.rank_score || 1);
          } else {
            localStorage.removeItem("authToken"); localStorage.removeItem("userEmail");
            sessionStorage.removeItem("authToken"); sessionStorage.removeItem("userEmail");
          }
        })
        .catch(() => {
          if (email) {
            setIsLoggedIn(true);
            setUserEmail(email);
            setAuthToken(token);
            const storedRank = localStorage.getItem("rankTitle") || sessionStorage.getItem("rankTitle");
            const storedScore = parseInt(localStorage.getItem("rankScore") || sessionStorage.getItem("rankScore") || "1");
            if (storedRank) setRankTitle(storedRank);
            setRankScore(storedScore);
          }
        });
    }
  }, []);

  const handleLoginSuccess = (email, token, rememberMe, rank, score) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setAuthToken(token);
    const resolvedRank = rank || 'bolshevik';
    const resolvedScore = score || 1;
    setRankTitle(resolvedRank);
    setRankScore(resolvedScore);
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("authToken", token);
    storage.setItem("userEmail", email);
    storage.setItem("rankTitle", resolvedRank);
    storage.setItem("rankScore", String(resolvedScore));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    setAuthToken("");
    setRankTitle("bolshevik");
    setRankScore(1);
    localStorage.removeItem("authToken"); localStorage.removeItem("userEmail");
    localStorage.removeItem("rankTitle"); localStorage.removeItem("rankScore");
    sessionStorage.removeItem("authToken"); sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("rankTitle"); sessionStorage.removeItem("rankScore");
  };

  const saveSetToProfile = (items) => {
    const newSet = { items, date: new Date().toLocaleDateString() };
    const updatedSets = [newSet, ...savedSets];
    setSavedSets(updatedSets);
    localStorage.setItem("savedSets", JSON.stringify(updatedSets));
  };

  const addDumaItem = (item) => setDumaItems(prev => [item, ...prev]);

  return (
    <Router>
      <ScrollToTop />
      <div style={styles.pageWrapper}>
        <header style={styles.header}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={styles.logo}>The Majority Hair Solution</div>
          </Link>
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
          <Route path="/" element={<LandingPage saveSetToProfile={saveSetToProfile} authToken={authToken} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLoginSuccess} />} />
          <Route path="/signup" element={<SignupPage onLogin={handleLoginSuccess} />} />
          <Route path="/recommend" element={
            <RecommendPage
              addDumaItem={addDumaItem}
              userEmail={userEmail}
              rankTitle={rankTitle}
              rankScore={rankScore}
              authToken={authToken}
            />
          } />
          <Route path="/partner" element={
            <PartnerPage
              addDumaItem={addDumaItem}
              userEmail={userEmail}
              rankTitle={rankTitle}
              rankScore={rankScore}
              authToken={authToken}
            />
          } />
          <Route path="/duma" element={
            <DumaPage
              items={dumaItems}
              authToken={authToken}
              userEmail={userEmail}
              rankTitle={rankTitle}
              rankScore={rankScore}
            />
          } />
          {/* Legacy redirect for old /legislature links */}
          <Route path="/legislature" element={
            <DumaPage
              items={dumaItems}
              authToken={authToken}
              userEmail={userEmail}
              rankTitle={rankTitle}
              rankScore={rankScore}
            />
          } />
          <Route path="/profile" element={
            <ProfilePage
              userEmail={userEmail}
              savedSets={savedSets}
              rankTitle={rankTitle}
              rankScore={rankScore}
            />
          } />
          <Route path="/orders" element={
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <h2>Payment Received!</h2>
              <p>Your custom hair set is being prepared. Check your Profile to see your formula.</p>
              <Link to="/profile">Go to Profile</Link>
            </div>
          } />
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
  layout: { display: "flex", padding: "20px 60px", flexWrap: "wrap" },
  left: { width: "70%", paddingRight: "40px", minWidth: "300px" },
  right: { width: "30%", padding: "20px",borderRadius: "24px", backgroundColor: "#f9f9f9", height: "fit-content", position: 'sticky', top: '20px', minWidth: "280px" },
  rowSection: { marginBottom: "20px" },
  rowLabel: { fontSize: "14px", color: "#666", fontWeight: "600", marginBottom: "10px" },
  scrollRow: { display: "flex", gap: "12px", overflowX: "auto", paddingBottom: '10px' },
  card: { minWidth: "140px", padding: "10px", borderRadius: "16px", textAlign: "center", cursor: "pointer", backgroundColor: "#fff" },
  imagePlaceholder: { width: '100%', height: '60px', backgroundColor: '#f0f0f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: "12px", marginTop: "6px" },
  summaryContainer: { backgroundColor: '#fff', padding: '15px', borderRadius: '20px', border: '1px solid #eee' },
  checkoutBtn: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #222', background: '#fff', cursor: 'pointer', marginBottom: '10px', fontWeight: '600' },
  authContainer: { display: 'flex', justifyContent: 'center', minHeight: '70vh', alignItems: 'center', padding: '20px' },
  authCard: { width: '100%', maxWidth: '420px', padding: '40px', border: '1px solid #e0e0e0', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', backgroundColor: '#fff' },
  input: { width: '100%', padding: '12px', margin: '6px 0', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' },
  authButton: { width: '100%', padding: '12px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s ease' },
  googleButton: { width: '100%', padding: '11px', backgroundColor: '#fff', color: '#222', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  googleButtonEnhanced: { 
    width: '100%', 
    padding: '13px 14px', 
    backgroundColor: '#fff', 
    color: '#222', 
    border: '1px solid #e0e0e0', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: '600', 
    fontSize: '14px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    ':hover': { border: '1px solid #4285F4', boxShadow: '0 2px 8px rgba(66,133,244,0.12)' }
  },
  errorMsg: { background: '#fff3f3', color: '#c00', border: '1px solid #fcc', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '12px', textAlign: 'left' },
  formSectionTitle: { fontSize: '13px', fontWeight: '800', marginTop: '20px', borderBottom: '1px solid #eee', paddingBottom: '5px', textTransform: 'uppercase' },
  uploadBox: { border: '2px dashed #ddd', borderRadius: '12px', padding: '20px', textAlign: 'center', backgroundColor: '#fafafa' },
  // Renamed from legislatureCard â†’ dumaCard
  dumaCard: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '24px', padding: '30px', marginBottom: '20px' },
  typeTag: { background: '#222', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '10px' },
  voteBtn: { padding: '8px 16px', borderRadius: '8px', border: '1px solid', background: 'transparent', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  // Gold Glow for General Secretary badge
  generalSecretaryBadge: {
    color: '#FFD700',
    fontWeight: 'bold',
    textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.4)',
    borderColor: '#FFD700',
    boxShadow: '0 0 8px rgba(255, 215, 0, 0.5)',
  },
};


