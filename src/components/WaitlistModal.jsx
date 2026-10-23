import React, { useEffect, useState } from 'react';
import { BACKEND_URL } from '../utils/constants';

export function WaitlistModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [preference, setPreference] = useState('6-bottle-bundle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, preference }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || 'Something went wrong. Please try again.');
        return;
      }
      setSubmitted(true);
    } catch (error) {
      console.error('Waitlist submission failed:', error);
      setErrorMessage('Unable to connect to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="ms-waitlist-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <section className="ms-waitlist" role="dialog" aria-modal="true" aria-labelledby="ms-waitlist-title">
        <button type="button" className="ms-waitlist-close" onClick={onClose} disabled={isSubmitting} aria-label="Close waitlist">
          &times;
        </button>
        {!submitted ? (
          <>
            <h2 id="ms-waitlist-title">Join the VIP Order Waitlist</h2>
            <p>Get early access to upcoming hair and skincare drops, plus special perks.</p>
            {errorMessage && <div className="ms-waitlist-error" role="alert">{errorMessage}</div>}
            <form onSubmit={handleSubmit}>
              <label htmlFor="ms-waitlist-email">Email address</label>
              <input
                id="ms-waitlist-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
              <label htmlFor="ms-waitlist-preference">Interested routine</label>
              <select id="ms-waitlist-preference" value={preference} onChange={(event) => setPreference(event.target.value)}>
                <option value="6-bottle-bundle">6-Bottle Hair &amp; Face Routine ($54.99)</option>
                <option value="3-bottle-hair">3-Bottle Hair Routine</option>
                <option value="3-bottle-face">3-Bottle Face Routine</option>
                <option value="individual">Individual Essentials</option>
              </select>
              <button type="submit" className="ms-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Reserving…' : 'Reserve My Spot'}
              </button>
            </form>
          </>
        ) : (
          <div className="ms-waitlist-success">
            <h2 id="ms-waitlist-title">You're on the list!</h2>
            <p>Watch your inbox for early access drop notifications.</p>
            <button type="button" className="ms-btn" onClick={onClose}>Back to Store</button>
          </div>
        )}
      </section>
    </div>
  );
}
