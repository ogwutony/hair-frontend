// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../utils/constants';
import { styles } from '../utils/styles';
import { AppleSignInButton } from '../components/AppleSignInButton';
import { startGoogleSignIn, GoogleIcon } from '../utils/googleAuth';
import { TermsAgreement } from '../components/TermsAgreement';
import { TERMS_VERSION, setTermsPreAccepted } from '../utils/moderation';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SignupPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [termsNudge, setTermsNudge] = useState(false);

  // The Terms of Use (EULA) must be accepted before an account is created
  const requireTerms = () => {
    if (agreed) { setTermsPreAccepted(); return true; }
    setTermsNudge(true);
    setError("Please agree to the Terms of Use to create an account.");
    return false;
  };
  const guardClick = (e) => { if (!requireTerms()) { e.preventDefault(); e.stopPropagation(); } };

  const handleSignup = async (e) => {
    if (e) e.preventDefault();
    if (isLoading) return;
    setError("");
    if (!requireTerms()) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(cleanEmail)) return setError("Please enter a valid email address.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password, termsAccepted: true, termsVersion: TERMS_VERSION })
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.token) {
        if (onLogin) onLogin(data.email || cleanEmail, data.token, false, data.rank_title, data.rank_score);
        navigate("/profile");
      } else if (response.ok) {
        navigate("/login");
      } else {
        setError(data.error || "Could not create your account. Please try again.");
      }
    } catch (err) {
      setError("The server is waking up. Please try again in about 30 seconds.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = () => {
    if (!requireTerms()) return;
    setError("");
    const msg = startGoogleSignIn();
    if (msg) setError(msg);
  };

  return (
    <div style={styles.authContainer}>
      <div style={{ ...styles.authCard, maxWidth: '420px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px', letterSpacing: '-0.5px' }}>Sign Up</h1>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>Create your The Majorities account</p>

        {error && <div role="alert" style={{ background: '#fff0f0', color: '#c00', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', textAlign: 'left' }}>{error}</div>}

        <TermsAgreement checked={agreed} onChange={(v) => { setAgreed(v); if (v) { setTermsNudge(false); setError(""); } }} highlight={termsNudge} />

        <button type="button" onClick={handleGoogle} style={{ ...styles.socialButton, backgroundColor: '#fff', color: '#222', border: '1px solid #ddd' }}>
          <GoogleIcon />
          Sign up with Google
        </button>
        <div onClickCapture={guardClick}>
          <AppleSignInButton
            onSuccess={(data) => { if (onLogin) onLogin(data.email, data.token, true, data.rank_title, data.rank_score); navigate("/profile"); }}
            onError={setError}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
          <span style={{ padding: '0 12px', fontSize: '12px', color: '#999' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
        </div>

        <form onSubmit={handleSignup} noValidate>
          <input type="email" autoComplete="email" placeholder="Email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" autoComplete="new-password" placeholder="Password (8+ characters)" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="password" autoComplete="new-password" placeholder="Confirm password" style={styles.input} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <button type="submit" style={{ ...styles.authButton, opacity: isLoading ? 0.7 : 1 }} disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ fontSize: '13px', color: '#666', marginTop: '14px', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};
