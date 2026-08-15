// src/pages/OAuthCallbackPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../utils/constants';
import { styles } from '../utils/styles';

export const OAuthCallbackPage = ({ onLogin, provider }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("Authenticating...");

  useEffect(() => {
    const hash = location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const queryParams = new URLSearchParams(location.search);
    const accessToken = hashParams.get("access_token");
    const code = queryParams.get("code");
    const error = queryParams.get("error") || hashParams.get("error");

    if (error) { setStatus(provider + " authentication was cancelled."); setTimeout(() => navigate("/login"), 2500); return; }
    if (provider === "google" && !code) { setStatus("Authentication failed. No authorization code received."); setTimeout(() => navigate("/login"), 2500); return; }
    if (provider !== "google" && !accessToken) { setStatus("Authentication failed. No token received."); setTimeout(() => navigate("/login"), 2500); return; }

    const endpoint = provider === "instagram" ? "/api/auth/instagram" : "/api/auth/google";
    const body = provider === "google"
      ? { code, redirectUri: window.location.origin + "/auth/google/callback" }
      : { accessToken };

    fetch(BACKEND_URL + endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (ok && data.token) { onLogin(data.email, data.token, true, data.rank_title, data.rank_score); navigate("/profile"); }
        else { setStatus(data.error || "Account not linked. Please try again."); setTimeout(() => navigate("/login"), 3000); }
      })
      .catch(() => { setStatus("Server error. Please try again."); setTimeout(() => navigate("/login"), 3000); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={styles.authContainer}>
      <div style={{ ...styles.authCard, textAlign: 'center' }}>
        <h2 style={{ marginBottom: '12px' }}>{provider.charAt(0).toUpperCase() + provider.slice(1)}</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>{status}</p>
      </div>
    </div>
  );
};
