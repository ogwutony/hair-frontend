// src/components/EzoicAd.jsx
// Renders one Ezoic ad placeholder and tells Ezoic to fill it.
// The site is a single-page app, so each placeholder is shown when it mounts
// and destroyed when it unmounts (route or tab change) to avoid duplicate ads.
import React, { useEffect } from 'react';

export const EzoicAd = ({ placeholderId }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    window.ezstandalone = window.ezstandalone || {};
    window.ezstandalone.cmd = window.ezstandalone.cmd || [];
    window.ezstandalone.cmd.push(() => {
      window.ezstandalone.showAds(placeholderId);
    });
    return () => {
      window.ezstandalone.cmd.push(() => {
        if (typeof window.ezstandalone.destroyPlaceholders === 'function') {
          window.ezstandalone.destroyPlaceholders(placeholderId);
        }
      });
    };
  }, [placeholderId]);

  return (
    <div style={{ margin: '20px 0', minHeight: '1px' }} aria-label="Advertisement">
      <div id={`ezoic-pub-ad-placeholder-${placeholderId}`} />
    </div>
  );
};

// Ezoic in-content placeholder IDs used in the Duma feed (create these in the Ezoic dashboard).
export const DUMA_AD_PLACEHOLDER_START = 101;
export const DUMA_AD_EVERY_N_POSTS = 3;
export const DUMA_AD_MAX_SLOTS = 10;
