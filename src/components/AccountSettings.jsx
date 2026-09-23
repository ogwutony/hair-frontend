// src/components/AccountSettings.jsx
// Profile section: blocked accounts (with Unblock) and permanent account deletion.

import React, { useState } from 'react';
import { deleteAccountRequest, unblockUser, useModeration } from '../utils/moderation';

export const AccountSettings = ({ authToken, userEmail, onAccountDeleted }) => {
  const { blocked } = useModeration();
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  if (!authToken) return null;

  const handleDelete = async () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') return;
    setDeleting(true);
    setError('');
    try {
      await deleteAccountRequest(authToken);
    } catch (e) {
      setDeleting(false);
      setError(e.message || 'Account deletion failed. Please try again.');
      return;
    }
    window.alert('Your account and data have been permanently deleted.');
    if (onAccountDeleted) onAccountDeleted();
  };

  return (
    <section style={{ marginTop: '40px' }}>
      <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>Account</h2>

      <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '15px' }}>Blocked accounts</h3>
        {blocked.length === 0 ? (
          <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>You haven't blocked anyone.</p>
        ) : (
          blocked.map((b) => (
            <div key={b} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #f3f3f3' }}>
              <span style={{ fontSize: '13px', color: '#555', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b}</span>
              <button
                type="button"
                onClick={() => unblockUser(authToken, b)}
                style={{ border: '1px solid #ddd', background: '#fff', borderRadius: '6px', padding: '4px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Unblock
              </button>
            </div>
          ))
        )}
      </div>

      <div style={{ border: '1px solid #f5c6cb', borderRadius: '12px', padding: '20px', background: '#fffafa' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '15px', color: '#c0392b' }}>Delete account</h3>
        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#555', lineHeight: 1.5 }}>
          Permanently deletes your account{userEmail ? ` (${userEmail})` : ''}, profile, posts, votes, messages and reports. This cannot be undone.
        </p>
        {!showConfirm ? (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            style={{ border: '1px solid #c0392b', color: '#c0392b', background: '#fff', borderRadius: '8px', padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}
          >
            Delete my account
          </button>
        ) : (
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px' }}>
              Type <strong>DELETE</strong> to confirm:
            </label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginRight: '10px', width: '160px' }}
            />
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || confirmText.trim().toUpperCase() !== 'DELETE'}
              style={{ border: 'none', background: '#c0392b', color: '#fff', borderRadius: '8px', padding: '10px 16px', fontWeight: 700, cursor: 'pointer', opacity: deleting || confirmText.trim().toUpperCase() !== 'DELETE' ? 0.5 : 1 }}
            >
              {deleting ? 'Deleting…' : 'Permanently delete'}
            </button>
            <button
              type="button"
              onClick={() => { setShowConfirm(false); setConfirmText(''); setError(''); }}
              disabled={deleting}
              style={{ border: 'none', background: 'none', color: '#666', marginLeft: '8px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        )}
        {error && <p style={{ color: '#c0392b', fontSize: '13px', marginTop: '10px' }}>{error}</p>}
      </div>
    </section>
  );
};
