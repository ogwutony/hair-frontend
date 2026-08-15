// src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BACKEND_URL } from '../utils/constants';
import { styles } from '../utils/styles';

export const ResetPasswordPage = () => {
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
          <div style={{ fontSize: '48px', margin: '20px 0' }}></div>
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
