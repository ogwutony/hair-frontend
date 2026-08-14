// src/components/CredentialHeader.jsx
import React from 'react';
import { getRankColor, getFormattedRankTitle, getCompletedPromptIds, safeSocialUrl, normalizeMediaVideoUrl } from '../utils/helpers';
import { styles } from '../utils/styles';

const SnapchatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 448 418" fill="currentColor" style={{ marginRight: '6px', verticalAlign: 'text-bottom' }}>
    <path d="M447.8 285.9c-2.3-4.3-6.2-7.2-11.8-8.8-19.3-5-38.3-8.8-49.8-10.7-3.9-.6-6.1-2.1-6.4-4.5-.4-3.5 1-6.1 4.2-7.6 15.6-7.4 30.6-16.1 44.9-26.2 6.6-4.7 9.8-11.8 9.5-21.2-.3-9.5-4-16.3-11.1-20.5-25.1-14.7-52.6-25-82.6-30.8-6.1-1.2-9.4-4-9.8-8.5-.3-3.1 1.4-5.6 5.1-7.5 18.2-8.3 33.7-20 46.5-35 8.1-9.5 10.3-21 6.8-34.6-3.4-13.6-11.7-22.3-24.9-26.1-20.5-5.9-42-8.9-64.4-8.9-22.4 0-43.9 3-64.4 8.9-13.2 3.8-21.5 12.5-24.9 26.1-3.5 13.6-1.2 25.1 6.8 34.6 12.8 15 28.3 26.7 46.5 35 3.7 1.9 5.4 4.4 5.1 7.5-.4 4.5-3.7 7.3-9.8 8.5-30 5.8-57.5 16.1-82.6 30.8-7.1 4.2-10.8 11-11.1 20.5-.3 9.4 2.9 16.5 9.5 21.2 14.3 10.1 29.3 18.8 44.9 26.2 3.2 1.5 4.6 4.1 4.2 7.6-.3 2.4-2.5 3.9-6.4 4.5-11.5 1.9-30.5 5.7-49.8 10.7-5.6 1.6-9.5 4.5-11.8 8.8-2.3 4.3-1.6 9.4 2.1 15.2 24.3 38 60 62.6 107.1 73.9 4.3 1 7.4 3.4 9.1 7.4 2.8 6.4 8 9.6 15.6 9.6h63c7.6 0 12.8-3.2 15.6-9.6 1.7-4 4.8-6.4 9.1-7.4 47.1-11.3 82.8-35.9 107.1-73.9 3.7-5.8 4.4-10.9 2.1-15.2z"/>
  </svg>
);

export const CredentialHeader = ({ email, displayName, rankTitle, rankScore, avatarUrl, socialLinks = {} }) => {
  const nameToDisplay = displayName || email;
  const initial = (nameToDisplay || 'C')[0].toUpperCase();
  const color = getRankColor(rankTitle || 'Comrade');
  const isTopRank = rankTitle === "Nice and Helpful";
  const formattedRankTitle = getFormattedRankTitle(rankTitle || 'Comrade', getCompletedPromptIds(email).length);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#fff', flexWrap: 'wrap', marginBottom: '12px' }}>
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        border: '1.5px solid #1a1a1a',
        backgroundColor: avatarUrl ? 'transparent' : color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: '700',
        color: '#fff',
        flexShrink: 0,
        overflow: 'hidden',
        ...(isTopRank && !avatarUrl ? { boxShadow: '0 0 12px rgba(255,215,0,0.8)' } : {})
      }}>
        {avatarUrl ? (
          /\.(mp4|mov|webm)$/i.test(avatarUrl) || avatarUrl.includes('/video/upload/') ? (
            <video src={normalizeMediaVideoUrl(avatarUrl)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay loop muted playsInline />
          ) : (
            <img
              src={avatarUrl}
              alt={nameToDisplay}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameToDisplay)}&background=333&color=fff`;
              }}
            />
          )
        ) : (
          initial
        )}
      </div>
      <span style={{ fontWeight: '600', fontSize: '14px', color: '#333', letterSpacing: '-0.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
        {nameToDisplay}
      </span>
      <span style={{
        fontSize: rankTitle && rankTitle.length > 20 ? '9px' : '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        padding: '4px 10px',
        borderRadius: '4px',
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: '#000',
        color: '#fff',
        whiteSpace: 'nowrap',
        letterSpacing: rankTitle && rankTitle.length > 20 ? '0px' : '0.5px',
        lineHeight: '1.3',
        ...(isTopRank ? styles.generalSecretaryBadge : {})
      }}>
        {formattedRankTitle}
      </span>
      {rankScore != null && (
        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          padding: '4px 10px',
          borderRadius: '4px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          backgroundColor: '#f5f5f5',
          color: '#d4af37',
          border: '1px solid #e0e0e0',
          whiteSpace: 'nowrap',
          lineHeight: '1.3'
        }}>
          ★ {(rankScore || 1).toLocaleString()} pts
        </span>
      )}
      {socialLinks && (
        <>
          {socialLinks.instagram ? (
            <a
              href={safeSocialUrl(socialLinks.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', fontSize: '15px' }}
              title="Instagram"
            >{"📷"}</a>
          ) : null}
          {socialLinks.tiktok ? (
            <a
              href={safeSocialUrl(socialLinks.tiktok)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', fontSize: '15px' }}
              title="TikTok"
            >{"🎵"}</a>
          ) : null}
          {socialLinks.snapchat ? (
            <a
              href={safeSocialUrl(socialLinks.snapchat)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', fontSize: '11px', color: '#000000', backgroundColor: '#FFFC00', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}
              title="Snapchat"
            ><SnapchatIcon /> Snapchat</a>
          ) : null}
        </>
      )}
    </div>
  );
};
