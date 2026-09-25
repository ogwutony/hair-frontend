// src/pages/PerspectiveDetailPage.jsx
// One Duma perspective on its own public URL (/duma/:id) so it can be read,
// shared and indexed. Voting, posting and messaging stay members-only.
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CredentialHeader } from '../components/CredentialHeader';
import { GuestSubmissionPrompt } from '../components/GuestSubmissionPrompt';
import { BACKEND_URL } from '../utils/constants';
import { getRankTitle, normalizeMediaVideoUrl } from '../utils/helpers';
import { styles } from '../utils/styles';

const clip = (text, max) => {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
};

export const PerspectiveDetailPage = ({ authToken }) => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetch(`${BACKEND_URL}/api/duma`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const found = Array.isArray(data) ? data.find(d => String(d._id || d.id) === String(id)) : null;
        setItem(found || null);
        setStatus(found ? 'ready' : 'missing');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [id]);

  const wrap = { padding: '40px 20px', maxWidth: '760px', margin: '0 auto' };

  if (status === 'loading') return <div style={wrap}><p style={{ color: '#888' }}>Loading perspective…</p></div>;
  if (status !== 'ready') {
    return (
      <div style={wrap}>
        <Helmet><title>Perspective not found | The Majorities</title><meta name="robots" content="noindex" /></Helmet>
        <h1 style={{ fontSize: '24px' }}>{status === 'missing' ? 'This perspective isn’t available' : 'We couldn’t load this perspective'}</h1>
        <p><Link to="/duma">Browse the Duma</Link></p>
      </div>
    );
  }

  const title = item.prompt || 'A perspective from The Majorities';
  const body = item.response || item.reason || item.desc || '';
  const canonical = `https://themajorities.com/duma/${id}`;
  const media = Array.isArray(item.mediaUrls) && item.mediaUrls.length > 0
    ? item.mediaUrls
    : item.mediaUrl ? [item.mediaUrl] : item.videoUrl ? [item.videoUrl] : [];
  const posted = item.createdAt ? new Date(item.createdAt) : null;

  return (
    <article style={wrap}>
      <Helmet>
        <title>{`${clip(title, 60)} | The Majorities`}</title>
        <meta name="description" content={clip(body, 155)} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        <meta property="og:title" content={clip(title, 90)} />
        <meta property="og:description" content={clip(body, 155)} />
      </Helmet>
      <p style={{ fontSize: '13px', marginTop: 0 }}><Link to="/duma" style={{ color: '#1f4f99' }}>← The Duma</Link></p>
      <span style={styles.typeTag}>Perspective</span>
      <h1 style={{ fontSize: '28px', lineHeight: 1.3, margin: '14px 0 10px' }}>{title}</h1>
      {posted && !Number.isNaN(posted.getTime()) && (
        <p style={{ color: '#888', fontSize: '13px', margin: '0 0 12px' }}>
          <time dateTime={posted.toISOString()}>{posted.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
          {item.location ? ` · ${item.location}` : ''}
        </p>
      )}
      {item.submittedBy && (
        <CredentialHeader
          email={item.submittedBy}
          displayName={item.submitterDisplayName || null}
          rankTitle={item.rankScore ? getRankTitle(item.rankScore) : (item.submitterRank || 'Comrade')}
          rankScore={null}
          avatarUrl={item.submitterAvatar || null}
          socialLinks={item.submitterSocialLinks || null}
        />
      )}
      <div style={{ fontSize: '17px', lineHeight: 1.75, color: '#222', whiteSpace: 'pre-wrap' }}>{body}</div>
      {media.length > 0 && (
        <div style={{ display: 'grid', gap: '10px', margin: '24px 0' }}>
          {media.map((url, idx) => {
            const isVideo = /\.(mp4|mov|hevc|webm)$/i.test(url) || url.includes('/video/upload/');
            return isVideo
              ? <video key={idx} src={normalizeMediaVideoUrl(url)} controls playsInline preload="metadata" style={{ width: '100%', borderRadius: '12px', background: '#000' }} />
              : <img key={idx} src={url} alt={`${clip(title, 60)} — attachment ${idx + 1}`} style={{ width: '100%', borderRadius: '12px' }} />;
          })}
        </div>
      )}
      <div style={{ marginTop: '32px' }}>
        {authToken
          ? <Link to="/duma" style={{ fontWeight: 600, color: '#1f4f99' }}>Vote and discuss on the Duma →</Link>
          : <GuestSubmissionPrompt message="Log in or register to vote on perspectives, follow this member, and share your own." />}
      </div>
    </article>
  );
};
