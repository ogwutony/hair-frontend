// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../utils/constants';
import { styles } from '../utils/styles';

export const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socialError, setSocialError] = useState("");

  const handleLogin = async () => {
    setIsLoading(true);
    setSocialError("");
    try {
      const response = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) { onLogin(email, data.token, true, data.rank_title, data.rank_score); navigate("/profile"); }
      else { alert(data.error || "Invalid login"); }
    } catch (err) { alert("Server is waking up. Try again in 30s."); }
    finally { setIsLoading(false); }
  };

  const handleGoogleLogin = () => {
    setSocialError("");
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) { setSocialError("Google login is not configured."); return; }
    const redirectUri = window.location.origin + "/auth/google/callback";
    const scope = "openid email profile";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&prompt=select_account`;
    window.location.href = authUrl;
  };

  const handleInstagramLogin = () => {
    setSocialError("");
    const appId = process.env.REACT_APP_FACEBOOK_APP_ID;
    if (!appId) { setSocialError("Instagram login is not configured yet."); return; }
    const redirectUri = window.location.origin + "/auth/instagram/callback";
    const scope = "email,public_profile";
    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=token`;
    window.location.href = authUrl;
  };

  const handleTikTokLogin = () => {
    setSocialError("");
  };

  return (
    <div style={styles.authContainer}>
      <div style={{ ...styles.authCard, maxWidth: '420px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px', letterSpacing: '-0.5px' }}>The Majorities</h1>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>Sign in to your account</p>
        {socialError && <div style={{ background: '#fff0f0', color: '#c00', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', textAlign: 'left' }}>{socialError}</div>}
        <button onClick={handleGoogleLogin} style={{ ...styles.socialButton, backgroundColor: '#fff', color: '#222', border: '1px solid #ddd' }}>
          <svg style={{ width: '18px', height: '18px', marginRight: '10px' }} viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>
        <button onClick={handleInstagramLogin} style={{ ...styles.socialButton, background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff', border: 'none' }}>
          <svg style={{ width: '18px', height: '18px', marginRight: '10px', fill: '#fff' }} viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
          Continue with Instagram
        </button>
        <button onClick={handleTikTokLogin} style={{ ...styles.socialButton, backgroundColor: '#000', color: '#fff', border: 'none' }}>
          <svg style={{ width: '18px', height: '18px', marginRight: '10px', fill: '#fff' }} viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.42a8.21 8.21 0 0 0 4.76 1.52V6.5a4.83 4.83 0 0 1-1-.19z"/></svg>
          Continue with TikTok
        </button>
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
          <span style={{ padding: '0 12px', fontSize: '12px', color: '#999' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
        </div>
        <input type="email" placeholder="Email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
        <button style={styles.authButton} onClick={handleLogin}>{isLoading ? '...' : 'Login'}</button>
        <Link to="/forgot-password" style={{ display: 'block', marginTop: '12px', fontSize: '13px', color: '#666', textDecoration: 'none', textAlign: 'center' }}>
          Forgot password?
        </Link>
      </div>
    </div>
  );
};
