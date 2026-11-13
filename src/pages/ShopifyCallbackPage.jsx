import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { finishShopifySignIn } from '../utils/shopifyAuth';
import { styles } from '../utils/styles';

export function ShopifyCallbackPage({ onLogin }) {
  const started = useRef(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const search = window.location.search;
    // Clear the single-use code from the visible URL and referrer immediately.
    window.history.replaceState({}, '', window.location.pathname);
    finishShopifySignIn(search).then(data => {
      onLogin(data.email, data.token, false, data.rank_title, data.rank_score);
      navigate('/duma', { replace: true });
    }).catch(e => setError(e.message));
  }, [navigate, onLogin]);
  return <main style={styles.authContainer}><div style={styles.authCard}>
    {error ? <><p role="alert">{error}</p><Link to="/login">Return to sign in</Link></> : <p role="status">Completing your sign-in…</p>}
  </div></main>;
}
