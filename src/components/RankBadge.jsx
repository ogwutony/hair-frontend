// src/components/RankBadge.jsx
import React from 'react';
import { getRankColor } from '../utils/helpers';
import { styles } from '../utils/styles';
import { RANK_TIERS } from '../utils/constants';

export const RankBadge = ({ rankTitle, score }) => {
  const color = getRankColor(rankTitle);
  const isTopRank = rankTitle === RANK_TIERS[0].title;
  const isLongTitle = rankTitle && rankTitle.length > 20;
  return (
    <span style={{
      fontSize: isLongTitle ? '9px' : '11px',
      fontWeight: '700',
      color: color,
      padding: '3px 8px',
      borderRadius: '4px',
      border: `1px solid ${color}`,
      textTransform: 'uppercase',
      letterSpacing: isLongTitle ? '0px' : '0.5px',
      whiteSpace: 'nowrap',
      display: 'inline-flex',
      alignItems: 'center',
      maxWidth: '200px',
      lineHeight: '1.3',
      ...(isTopRank ? styles.generalSecretaryBadge : {})
    }}>
      {rankTitle}
    </span>
  );
};
