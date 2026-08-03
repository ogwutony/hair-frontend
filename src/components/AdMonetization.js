import React, { useEffect, useState } from "react";

const AD_STATUS_STORAGE_KEY = "majorities_ads_enabled";

export const trackEvent = (eventName, payload = {}) => {
  if (typeof window === "undefined" || !eventName) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...payload
  });
};

export const getAdStatus = () => {
  if (typeof window === "undefined") return true;

  const storedValue = window.localStorage.getItem(AD_STATUS_STORAGE_KEY);
  if (storedValue === null) return true;

  return storedValue === "true";
};

export const setAdStatus = (enabled) => {
  if (typeof window === "undefined") return enabled;

  const normalizedValue = Boolean(enabled);
  window.localStorage.setItem(AD_STATUS_STORAGE_KEY, String(normalizedValue));
  return normalizedValue;
};

export default function AdMonetization({ placement = "landing_sidebar" }) {
  const [adsEnabled, setAdsEnabledState] = useState(getAdStatus);

  useEffect(() => {
    trackEvent("ad_module_viewed", {
      placement,
      adsEnabled
    });
  }, [placement, adsEnabled]);

  const handleToggle = () => {
    const nextValue = setAdStatus(!adsEnabled);
    setAdsEnabledState(nextValue);
    trackEvent("ad_preferences_updated", {
      placement,
      adsEnabled: nextValue
    });
  };

  const handleSponsorClick = (destination) => {
    trackEvent("sponsored_cta_clicked", {
      placement,
      destination
    });
  };

  return (
    <section style={{
      marginTop: "16px",
      padding: "16px",
      border: "1px solid #eee",
      borderRadius: "12px",
      background: "#faf8f2"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: 0, fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#8a6d3b", fontWeight: 700 }}>
            Sponsored Discovery
          </p>
          <h4 style={{ margin: "6px 0 8px", fontSize: "16px", color: "#222" }}>
            Control partner highlights
          </h4>
          <p style={{ margin: 0, fontSize: "12px", lineHeight: 1.6, color: "#555" }}>
            Opt in to see partner promotions while keeping checkout and product selection unchanged.
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          style={{
            border: "1px solid #222",
            borderRadius: "999px",
            background: adsEnabled ? "#222" : "#fff",
            color: adsEnabled ? "#fff" : "#222",
            fontSize: "11px",
            fontWeight: 700,
            padding: "8px 12px",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          {adsEnabled ? "Ads On" : "Ads Off"}
        </button>
      </div>

      <div style={{
        marginTop: "14px",
        padding: "14px",
        borderRadius: "10px",
        background: "#fff",
        border: "1px solid #eadfbe"
      }}>
        <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: 700, color: "#222" }}>
          {adsEnabled ? "Partner offers are enabled." : "Partner offers are hidden."}
        </p>
        <p style={{ margin: 0, fontSize: "12px", lineHeight: 1.6, color: "#666" }}>
          {adsEnabled
            ? "Browse sponsored community submissions and partner applications without changing your saved set or account state."
            : "You can re-enable partner highlights at any time from this panel."}
        </p>

        {adsEnabled && (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }}>
            <a
              href="/partner"
              onClick={() => handleSponsorClick("partner")}
              style={{
                display: "inline-block",
                textDecoration: "none",
                borderRadius: "999px",
                padding: "10px 14px",
                background: "#222",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 700
              }}
            >
              Explore partner applications
            </a>
            <a
              href="/recommend"
              onClick={() => handleSponsorClick("recommend")}
              style={{
                display: "inline-block",
                textDecoration: "none",
                borderRadius: "999px",
                padding: "10px 14px",
                background: "#fff",
                color: "#222",
                border: "1px solid #222",
                fontSize: "12px",
                fontWeight: 700
              }}
            >
              See sponsored recommendations
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
