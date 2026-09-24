// src/pages/AdminModerationPage.jsx
// Moderation queue for admins. The backend only allows emails listed in its ADMIN_EMAILS env var.
//   GET  /api/admin/reports?status=open|resolved
//   POST /api/admin/reports/:id/resolve   { action }
//   POST /api/admin/duma/:id/hide | /unhide
import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { BACKEND_URL } from '../utils/constants';

const card = { background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '20px', marginBottom: '14px' };
const btn = { border: '1px solid #222', background: '#fff', color: '#222', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' };

export const AdminModerationPage = ({ authToken }) => {
  const [status, setStatus] = useState('open');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState('');

  const call = useCallback((path, options = {}) => fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}`, ...(options.headers || {}) },
  }), [authToken]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await call(`/api/admin/reports?status=${status}`);
      const data = await res.json().catch(() => ({}));
      if (res.status === 403) throw new Error('Admins only. Add your email to ADMIN_EMAILS on the backend.');
      if (!res.ok) throw new Error(data.error || 'Could not load reports');
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [call, status]);

  useEffect(() => { if (authToken) load(); }, [authToken, load]);

  const act = async (reportOrPostId, fn, message) => {
    setBusyId(reportOrPostId);
    setNotice('');
    try {
      const res = await fn();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Action failed');
      setNotice(message);
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const setHidden = (postId, hidden) => act(postId,
    () => call(`/api/admin/duma/${postId}/${hidden ? 'hide' : 'unhide'}`, { method: 'POST' }),
    hidden ? 'Post hidden from the Duma.' : 'Post restored to the Duma.');

  const resolve = async (report, action) => {
    const ok = await act(report._id,
      () => call(`/api/admin/reports/${report._id}/resolve`, { method: 'POST', body: JSON.stringify({ action }) }),
      'Report resolved.');
    if (ok) setReports((prev) => prev.filter((r) => r._id !== report._id));
  };

  const hideAndResolve = async (report) => {
    if (await setHidden(report.contentId, true)) await resolve(report, 'post hidden');
  };

  // Group count of reports per post so repeat reports stand out
  const countByPost = reports.reduce((acc, r) => { acc[r.contentId] = (acc[r.contentId] || 0) + 1; return acc; }, {});

  if (!authToken) return <div style={{ padding: '60px', textAlign: 'center' }}>Please log in.</div>;

  return (
    <div style={{ padding: '30px 16px', maxWidth: '900px', margin: '0 auto' }}>
      <Helmet><title>Moderation | The Majorities</title><meta name="robots" content="noindex" /></Helmet>
      <h2 style={{ marginBottom: '6px' }}>Moderation</h2>
      <p style={{ color: '#666', fontSize: '14px', marginTop: 0 }}>Review reported Duma posts. Posts reported by 3 different people are hidden automatically.</p>

      <div style={{ display: 'flex', gap: '10px', margin: '20px 0', flexWrap: 'wrap' }}>
        {['open', 'resolved'].map((s) => (
          <button key={s} type="button" onClick={() => setStatus(s)}
            style={{ ...btn, background: status === s ? '#222' : '#fff', color: status === s ? '#fff' : '#222', padding: '8px 16px', fontSize: '13px' }}>
            {s === 'open' ? 'Open reports' : 'Resolved'}
          </button>
        ))}
        <button type="button" onClick={load} style={{ ...btn, marginLeft: 'auto', padding: '8px 16px', fontSize: '13px' }}>Refresh</button>
      </div>

      {notice && <div style={{ background: '#eef9f0', color: '#1e7e34', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>{notice}</div>}
      {error && <div style={{ background: '#fff0f0', color: '#c00', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>{error}</div>}
      {loading ? <p style={{ color: '#888' }}>Loading…</p> : !error && reports.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', color: '#888' }}>No {status} reports.</div>
      ) : reports.map((r) => (
        <div key={r._id} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <strong>{r.reason}</strong>
            <span style={{ fontSize: '12px', color: '#888' }}>{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</span>
          </div>
          {r.details && <p style={{ fontSize: '13px', color: '#444', margin: '0 0 8px' }}>{r.details}</p>}
          <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.7, wordBreak: 'break-all' }}>
            <div>Type: {r.contentType} · Post ID: <code>{r.contentId || '—'}</code>{countByPost[r.contentId] > 1 ? ` · ${countByPost[r.contentId]} reports in this list` : ''}</div>
            <div>Posted by: {r.reportedUser || '—'}</div>
            <div>Reported by: {r.reporterEmail || '—'}</div>
            {r.status === 'resolved' && <div>Resolved: {r.action || 'reviewed'}{r.resolvedAt ? ` · ${new Date(r.resolvedAt).toLocaleString()}` : ''}</div>}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            {r.contentType === 'duma' && r.contentId && (
              <>
                {r.status !== 'resolved' && (
                  <button type="button" disabled={busyId} onClick={() => hideAndResolve(r)} style={{ ...btn, background: '#c0392b', color: '#fff', border: 'none' }}>Hide post &amp; resolve</button>
                )}
                <button type="button" disabled={busyId} onClick={() => setHidden(r.contentId, true)} style={btn}>Hide post</button>
                <button type="button" disabled={busyId} onClick={() => setHidden(r.contentId, false)} style={btn}>Unhide post</button>
              </>
            )}
            {r.status !== 'resolved' && (
              <button type="button" disabled={busyId} onClick={() => resolve(r, 'no action')} style={btn}>Dismiss (no action)</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
