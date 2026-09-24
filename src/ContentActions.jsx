// src/components/ContentActions.jsx
// "•••" menu on other people's posts, listings and profiles: report the content
// or block the person who posted it.

import React, { useEffect, useRef, useState } from 'react';
import { REPORT_REASONS, blockUser, reportContent } from '../utils/moderation';

const menuBtn = {
  border: '1px solid #ddd',
  background: '#fff',
  color: '#555',
  borderRadius: '6px',
  padding: '4px 10px',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  lineHeight: 1,
};

const menuItem = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  background: 'none',
  border: 'none',
  padding: '10px 14px',
  fontSize: '13px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

export const ContentActions = ({
  contentId,
  contentType = 'duma',
  authorEmail,
  authorName,
  authToken,
  userEmail,
  onBlocked,
  onReported,
  style,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  // Only signed-in members can report or block.
  if (!authToken || !userEmail) return null;

  // Sample/placeholder posts (not saved on the server) can't be reported.
  if (contentType !== 'user' && !/^[a-f0-9]{24}$/i.test(String(contentId || ''))) return null;

  // Never offer report/block on your own content.
  if (authorEmail && userEmail && authorEmail.trim().toLowerCase() === userEmail.trim().toLowerCase()) {
    return null;
  }

  const who = authorName || authorEmail || 'this user';

  const requireLogin = () => {
    if (authToken) return true;
    window.alert('Please log in to report content or block users.');
    return false;
  };

  const handleBlock = async () => {
    setMenuOpen(false);
    if (!authorEmail || !requireLogin()) return;
    const ok = window.confirm(
      `Block ${who}?\n\nYou won't see their posts, listings or messages anymore. You can unblock them from your Profile.`,
    );
    if (!ok) return;
    await blockUser(authToken, authorEmail);
    window.alert(`You blocked ${who}.`);
    if (onBlocked) onBlocked();
  };

  const openReport = () => {
    setMenuOpen(false);
    if (!requireLogin()) return;
    setReportOpen(true);
  };

  const closeReport = () => {
    setReportOpen(false);
    setReason('');
    setDetails('');
  };

  const submitReport = async () => {
    if (!reason) {
      window.alert('Please choose a reason.');
      return;
    }
    setSubmitting(true);
    const ok = await reportContent(authToken, {
      contentType,
      contentId,
      reportedUser: authorEmail,
      reason,
      details: details.trim() || undefined,
    });
    setSubmitting(false);
    closeReport();
    if (onReported) onReported();
    window.alert(
      ok
        ? 'Report sent. Our team reviews every report within 24 hours and removes content that breaks our Community Guidelines. This content has been hidden for you.'
        : "We couldn't reach the server, but this content has been hidden for you. Please try reporting it again later.",
    );
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block', ...style }}>
      <button type="button" aria-label="Report or block" title="Report or block" style={menuBtn} onClick={() => setMenuOpen((v) => !v)}>
        •••
      </button>

      {menuOpen && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            background: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 50,
            minWidth: '170px',
            overflow: 'hidden',
          }}
        >
          <button type="button" role="menuitem" style={menuItem} onClick={openReport}>
            🚩 Report
          </button>
          {authorEmail && (
            <button type="button" role="menuitem" style={{ ...menuItem, color: '#c0392b' }} onClick={handleBlock}>
              ⛔ Block {authorName ? authorName : 'user'}
            </button>
          )}
        </div>
      )}

      {reportOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Report content"
          onClick={(e) => e.target === e.currentTarget && !submitting && closeReport()}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', width: '100%', maxWidth: '420px', textAlign: 'left' }}>
            <h3 style={{ margin: '0 0 4px' }}>Report</h3>
            <p style={{ margin: '0 0 14px', color: '#666', fontSize: '13px' }}>Why are you reporting this?</p>
            {REPORT_REASONS.map((r) => (
              <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 4px', fontSize: '14px', cursor: 'pointer' }}>
                <input type="radio" name={`report-reason-${contentId}`} value={r} checked={reason === r} onChange={() => setReason(r)} />
                {r}
              </label>
            ))}
            <textarea
              placeholder="Add details (optional)"
              value={details}
              maxLength={1000}
              onChange={(e) => setDetails(e.target.value)}
              style={{ width: '100%', minHeight: '70px', marginTop: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="button" onClick={closeReport} disabled={submitting} style={{ ...menuBtn, padding: '10px 16px', fontWeight: 600 }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReport}
                disabled={submitting || !reason}
                style={{ border: 'none', background: '#c0392b', color: '#fff', borderRadius: '8px', padding: '10px 16px', fontWeight: 700, cursor: 'pointer', opacity: submitting || !reason ? 0.6 : 1 }}
              >
                {submitting ? 'Sending…' : 'Submit report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
