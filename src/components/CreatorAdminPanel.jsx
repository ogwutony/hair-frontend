// src/components/CreatorAdminPanel.jsx
// Admin tools for the creator program (shown on the Moderation page; backend checks ADMIN_EMAILS).
//   GET  /api/admin/creators                  creator applicants and code holders
//   POST /api/admin/creators/code { email, reissue }   approve: issue a code and email it
//   POST /api/admin/creators/revoke { email }  the code stops working at once
//   POST /api/admin/duma/:id/hide | /unhide    remove a Duma post (e.g. a creator review) at once
import React, { useCallback, useEffect, useState } from 'react';
import { BACKEND_URL } from '../utils/constants';

const card = { background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '20px', marginBottom: '14px' };
const btn = { border: '1px solid #222', background: '#fff', color: '#222', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' };
const input = { flex: '1 1 220px', padding: '8px', border: '1px solid #aaa', borderRadius: '6px', fontSize: '13px' };

// Accepts a post id or any link that ends in one (e.g. community.themajorities.com/duma/<id>)
export const extractPostId = (value) => {
  const match = String(value || '').trim().match(/([a-f0-9]{24})(?:[/?#].*)?$/i);
  return match ? match[1] : '';
};

export const CreatorAdminPanel = ({ authToken }) => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState('');
  const [email, setEmail] = useState('');
  const [postRef, setPostRef] = useState('');

  const call = useCallback(async (path, body) => {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 403) throw new Error('Admins only. Add your email to ADMIN_EMAILS on the backend.');
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }, [authToken]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await call('/api/admin/creators');
      setCreators(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [call]);

  useEffect(() => { if (authToken) load(); }, [authToken, load]);

  const run = async (key, fn) => {
    setBusy(key);
    setNotice('');
    setError('');
    try {
      setNotice(await fn());
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const issue = (target, reissue = false) => run(target, async () => {
    if (reissue && !window.confirm(`Give ${target} a new code? Their old code stops working.`)) return '';
    const data = await call('/api/admin/creators/code', { email: target, reissue });
    return data.issued ? `Code ${data.creatorCode} issued to ${data.email} and emailed to them.` : `${data.email} already has code ${data.creatorCode}.`;
  });

  const revoke = (target) => run(target, async () => {
    if (!window.confirm(`Revoke ${target}'s creator code? They can no longer submit.`)) return '';
    await call('/api/admin/creators/revoke', { email: target });
    return `Code revoked for ${target}.`;
  });

  const hidePost = (hidden) => run('post', async () => {
    const id = extractPostId(postRef);
    if (!id) throw new Error('Paste a Duma post link or its 24-character ID.');
    await call(`/api/admin/duma/${id}/${hidden ? 'hide' : 'unhide'}`, {});
    setPostRef('');
    return hidden ? 'Post hidden from the Duma.' : 'Post restored to the Duma.';
  });

  return (
    <section aria-labelledby="creator-admin-title" style={{ marginBottom: '28px' }}>
      <h3 id="creator-admin-title" style={{ marginBottom: '6px' }}>Creator program</h3>
      <p style={{ color: '#666', fontSize: '14px', marginTop: 0 }}>
        Approve a creator by issuing a code; it is emailed to them. They enter it with their account email on themajorities.com/pages/influencers.
      </p>

      <div style={{ ...card, display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <label htmlFor="creator-admin-email" style={{ fontSize: '13px', fontWeight: 700 }}>Issue a code:</label>
        <input id="creator-admin-email" type="email" placeholder="creator's account email" value={email} onChange={(e) => setEmail(e.target.value)} style={input} />
        <button type="button" disabled={!!busy || !email.trim()} onClick={() => issue(email.trim().toLowerCase())} style={{ ...btn, background: '#1f5a46', color: '#fff', border: 'none' }}>Issue code</button>
      </div>

      <div style={{ ...card, display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <label htmlFor="creator-admin-post" style={{ fontSize: '13px', fontWeight: 700 }}>Hide a Duma post:</label>
        <input id="creator-admin-post" type="text" placeholder="post link or ID" value={postRef} onChange={(e) => setPostRef(e.target.value)} style={input} />
        <button type="button" disabled={!!busy || !postRef.trim()} onClick={() => hidePost(true)} style={{ ...btn, background: '#c0392b', color: '#fff', border: 'none' }}>Hide now</button>
        <button type="button" disabled={!!busy || !postRef.trim()} onClick={() => hidePost(false)} style={btn}>Unhide</button>
      </div>

      <div role="status" aria-live="polite">
        {notice && <div style={{ background: '#eef9f0', color: '#1e7e34', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>{notice}</div>}
      </div>
      {error && <div role="alert" style={{ background: '#fff0f0', color: '#c00', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>{error}</div>}

      {loading ? <p style={{ color: '#888' }}>Loading creators…</p> : creators.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', color: '#888' }}>No creator applicants yet.</div>
      ) : (
        <div style={{ ...card, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                <th scope="col" style={{ padding: '6px' }}>Creator</th>
                <th scope="col" style={{ padding: '6px' }}>Code</th>
                <th scope="col" style={{ padding: '6px' }}>Program points</th>
                <th scope="col" style={{ padding: '6px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {creators.map((c) => (
                <tr key={c.email} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '6px', wordBreak: 'break-all' }}>{c.displayName ? `${c.displayName} · ` : ''}{c.email}{c.banned ? ' (banned)' : ''}</td>
                  <td style={{ padding: '6px' }}><code>{c.creatorCode || '—'}</code></td>
                  <td style={{ padding: '6px' }}>{c.creatorPoints} ({c.submissions} posts)</td>
                  <td style={{ padding: '6px', whiteSpace: 'nowrap' }}>
                    {c.creatorCode ? (
                      <>
                        <button type="button" disabled={!!busy} onClick={() => issue(c.email, true)} style={{ ...btn, marginRight: '6px' }}>New code</button>
                        <button type="button" disabled={!!busy} onClick={() => revoke(c.email)} style={btn}>Revoke</button>
                      </>
                    ) : (
                      <button type="button" disabled={!!busy || c.banned} onClick={() => issue(c.email)} style={{ ...btn, background: '#1f5a46', color: '#fff', border: 'none' }}>Approve &amp; issue code</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
