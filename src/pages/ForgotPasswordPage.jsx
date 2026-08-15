// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BACKEND_URL } from '../utils/constants';
import { styles } from '../utils/styles';

export const ForgotPasswordPage = () => {
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
          <div style={{ fontSize: '48px', margin: '20px 0' }}></div>
          <p style={{ color: '#555', lineHeight: '1.6' }}>
            If that email is registered, we've sent a reset link.<br />
            Check your inbox (and spam folder).
          </p>
          <p style={{ color: '#888', fontSize: '13px', marginTop: '10px' }}>
            The email may have landed in your <strong>spam or junk folder</strong> - please check there if you don't see it in your inbox.
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
          Back to Sign In
        </Link>
      </div>
    </div>
  );
};
