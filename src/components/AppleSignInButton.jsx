// src/components/AppleSignInButton.jsx
// "Sign in with Apple" for the website, using Apple's official JS library in popup mode.
// Needs two environment variables (Vercel → Settings → Environment Variables):
//   REACT_APP_APPLE_SERVICE_ID    — the Services ID from the Apple Developer portal
//   REACT_APP_APPLE_REDIRECT_URI  — a Return URL registered on that Services ID
//                                   (e.g. https://themajorities.com/login)
// The button is hidden until both are set.

import React, { useEffect, useState } from 'react';
import { BACKEND_URL } from '../utils/constants';

const APPLE_SCRIPT = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
const SERVICE_ID = process.env.REACT_APP_APPLE_SERVICE_ID || '';
const REDIRECT_URI = process.env.REACT_APP_APPLE_REDIRECT_URI || '';

let scriptPromise = null;
const loadAppleScript = () => {
  if (window.AppleID) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = APPLE_SCRIPT;
      s.async = true;
      s.onload = resolve;
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error('Could not load Sign in with Apple.'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
};

export const AppleSignInButton = ({ onSuccess, onError, style }) => {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!SERVICE_ID || !REDIRECT_URI) return;
    loadAppleScript()
      .then(() => {
        window.AppleID.auth.init({
          clientId: SERVICE_ID,
          scope: 'name email',
          redirectURI: REDIRECT_URI,
          usePopup: true,
        });
        setReady(true);
      })
      .catch((e) => onError && onError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!SERVICE_ID || !REDIRECT_URI) return null;

  const handleClick = async () => {
    if (!ready || busy) return;
    setBusy(true);
    try {
      const response = await window.AppleID.auth.signIn();
      const identityToken = response?.authorization?.id_token;
      if (!identityToken) throw new Error('Apple sign in failed: no identity token was returned.');
      const name = response?.user?.name;
      const res = await fetch(`${BACKEND_URL}/api/auth/apple/mobile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identityToken,
          fullName: name ? { givenName: name.firstName, familyName: name.lastName } : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.token) throw new Error(data.error || 'Apple sign in failed. Please try again.');
      onSuccess(data);
    } catch (e) {
      // Closing the Apple popup is not an error.
      if (e && (e.error === 'popup_closed_by_user' || e.error === 'user_cancelled_authorize')) return;
      if (onError) onError(e?.message || 'Apple sign in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!ready || busy}
      aria-label="Sign in with Apple"
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        background: '#000',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '15px',
        fontWeight: 600,
        cursor: ready && !busy ? 'pointer' : 'default',
        opacity: ready ? 1 : 0.6,
        marginBottom: '12px',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <svg width="16" height="19" viewBox="0 0 17 20" fill="#fff" aria-hidden="true">
        <path d="M14.2 10.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.1zM11.7 3c.7-.9 1.2-2 1.1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.3-.6 3-1.5z" />
      </svg>
      {busy ? 'Signing in…' : 'Sign in with Apple'}
    </button>
  );
};
