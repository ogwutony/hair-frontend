// src/components/GuestSubmissionPrompt.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
  dumaCard: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '24px', padding: '30px', marginBottom: '20px' },
  authButton: { width: '100%', padding: '12px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }
};

export const GuestSubmissionPrompt = ({ message = "Please log in or create an account before submitting." }) => {
  return (
    <div style={{ ...styles.dumaCard, background: '#fff8e1', border: '1px solid #f1d78c', marginBottom: '20px' }}>
      <p style={{ marginTop: 0, marginBottom: '14px', color: '#5f4b00', fontSize: '13px' }}>{message}</p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <Link to="/login" style={{ ...styles.authButton, textDecoration: 'none', display: 'inline-block', textAlign: 'center', width: 'auto', padding: '10px 20px', boxSizing: 'border-box' }}>Log In</Link>
        <Link to="/signup" style={{ ...styles.authButton, background: '#fff', color: '#222', border: '1px solid #222', textDecoration: 'none', display: 'inline-block', textAlign: 'center', width: 'auto', padding: '10px 20px', boxSizing: 'border-box' }}>Register</Link>
      </div>
    </div>
  );
};
