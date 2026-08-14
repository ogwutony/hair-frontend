// src/pages/ModelFriendlyPage.jsx
import React from 'react';
import { PRODUCT_VARIANT_MAP, SHOP_DOMAIN } from '../utils/constants';

export const ModelFriendlyPage = () => {
  const products = Object.keys(PRODUCT_VARIANT_MAP).map(name => {
    const config = PRODUCT_VARIANT_MAP[name];
    let category = "Skin Care";
    if (name.includes("Shampoo")) category = "Hair Care - Shampoo";
    else if (name.includes("Conditioner")) category = "Hair Care - Conditioner";
    else if (name.includes("Oil")) category = "Hair Care - Treatment Oil";
    else if (name.includes("Scrub")) category = "Skin Care - Exfoliant";
    else if (name.includes("Toner")) category = "Skin Care - Toner";
    else if (name.includes("Lotion")) category = "Skin Care - Moisturizer";
    return {
      name: name,
      category: category,
      pricing: {
        oneTime: `$${config.pricing.oneTime}.00`,
        subscription: `$${config.pricing.subscription}.00/month`
      },
      merchandiseId: config.merchandiseId,
      keyIngredients: name.includes("Shampoo") ? ["Provitamin B5 (Panthenol)", "Polyquaternium-10"] : ["Premium Ingredients"],
      benefits: ["High-grade community formula"],
    };
  });

  const siteInfo = {
    name: "The Majorities",
    shopDomain: SHOP_DOMAIN,
    description: "The Majorities is a community-driven haircare and skincare brand offering a curated set of 6 products spanning hair and face care.",
    purchaseModel: "Custom 6-product set builder. Select one product from each category. Buy as a one-time purchase or subscribe monthly.",
    totalOneTimePrice: `$${Object.keys(PRODUCT_VARIANT_MAP).length * 7}.00 for full 6-product set`,
    totalSubscriptionPrice: `$${Object.keys(PRODUCT_VARIANT_MAP).length * 6}.00/month for full 6-product set`,
    subscriptionSavings: `$${Object.keys(PRODUCT_VARIANT_MAP).length * (7 - 6)}.00/month savings with subscription`
  };

  const routes = [
    { path: "/", label: "Home - Product Builder", description: "Select and purchase a custom 6-product set" },
    { path: "/recommend", label: "Recommend", description: "Submit product recommendations to the community Duma feed" },
    { path: "/partner", label: "Partner Program", description: "Apply to become a distribution partner (25% commission structure)" },
    { path: "/duma", label: "The Duma Ledger", description: "Community feed with Culture posts, product recommendations, and partner listings" },
    { path: "/profile", label: "Profile", description: "User profile with rank system, avatar, social links, and saved product formulas" },
    { path: "/login", label: "Login", description: "Email/password authentication" },
    { path: "/signup", label: "Sign Up", description: "Create a new account" },
    { path: "/model", label: "Model-Friendly View", description: "This page - structured data for AI models and crawlers" }
  ];

  const rankSystem = {
    description: "50-tier loyalty rank system. Users earn points through community participation. Ranks range from Comrade (1+ pts) up to Servant of the People (50,000,000+ pts).",
    lowestRank: { title: "Comrade", minPoints: 1 },
    highestRank: { title: "Servant of the People", minPoints: 50000000 },
    notableRanks: [
      { title: "Comrade", minPoints: 1 },
      { title: "Schout-bij-nacht", minPoints: 250 },
      { title: "Rusalka", minPoints: 1000 },
      { title: "Domovoi", minPoints: 1500 },
      { title: "Chernobog", minPoints: 10000 },
      { title: "Morana", minPoints: 50000 },
      { title: "Lada", minPoints: 100000 },
      { title: "Politburo Member of The Majorities", minPoints: 10000000 },
      { title: "Servant of the People", minPoints: 50000000 }
    ]
  };

  const containerStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "monospace",
    color: "#111",
    lineHeight: "1.7"
  };

  const sectionStyle = {
    marginBottom: "40px",
    borderTop: "2px solid #111",
    paddingTop: "20px"
  };

  const headingStyle = {
    fontSize: "16px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "2px",
    marginBottom: "16px"
  };

  const subHeadingStyle = {
    fontSize: "14px",
    fontWeight: "700",
    marginBottom: "8px",
    marginTop: "16px"
  };

  const labelStyle = {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "#666",
    display: "block",
    marginBottom: "2px"
  };

  const valueStyle = {
    fontSize: "13px",
    marginBottom: "8px",
    paddingLeft: "12px"
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: "40px", paddingBottom: "20px", borderBottom: "2px solid #111" }}>
        <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "#666", marginBottom: "8px" }}>
          AI / Model-Friendly View
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 8px 0" }}>The Majorities — Structured Site Data</h1>
        <p style={{ fontSize: "13px", color: "#444", margin: 0 }}>
          This page provides a clean, structured representation of The Majorities website for AI assistants,
          search crawlers, and accessibility tools. All product data, pricing, routes, and community features
          are listed below in a readable, machine-parseable format.
        </p>
      </div>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Site Overview</h2>
        <span style={labelStyle}>Brand Name</span>
        <div style={valueStyle}>{siteInfo.name}</div>
        <span style={labelStyle}>Description</span>
        <div style={valueStyle}>{siteInfo.description}</div>
        <span style={labelStyle}>Purchase Model</span>
        <div style={valueStyle}>{siteInfo.purchaseModel}</div>
        <span style={labelStyle}>Full Set — One-Time Price</span>
        <div style={valueStyle}>{siteInfo.totalOneTimePrice}</div>
        <span style={labelStyle}>Full Set — Subscription Price</span>
        <div style={valueStyle}>{siteInfo.totalSubscriptionPrice}</div>
        <span style={labelStyle}>Subscription Savings</span>
        <div style={valueStyle}>{siteInfo.subscriptionSavings}</div>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Products ({products.length} Total)</h2>
        {products.map((product, idx) => (
          <div key={product.merchandiseId} style={{ marginBottom: "28px", paddingLeft: "12px", borderLeft: "3px solid #eee" }}>
            <div style={subHeadingStyle}>{idx + 1}. {product.name}</div>
            <span style={labelStyle}>Category</span>
            <div style={valueStyle}>{product.category}</div>
            <span style={labelStyle}>One-Time Price</span>
            <div style={valueStyle}>{product.pricing.oneTime}</div>
            <span style={labelStyle}>Subscription Price</span>
            <div style={valueStyle}>{product.pricing.subscription}</div>
            <span style={labelStyle}>Key Ingredients</span>
            <div style={valueStyle}>{product.keyIngredients.join(", ")}</div>
            <span style={labelStyle}>Benefits</span>
            <div style={valueStyle}>{product.benefits.join(" · ")}</div>
            <span style={labelStyle}>Shopify Merchandise ID</span>
            <div style={valueStyle}>{product.merchandiseId}</div>
          </div>
        ))}
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Site Routes and Pages</h2>
        {routes.map(route => (
          <div key={route.path} style={{ marginBottom: "12px", paddingLeft: "12px", borderLeft: "3px solid #eee" }}>
            <div style={subHeadingStyle}>{route.label} — <span style={{ fontFamily: "monospace", fontWeight: "400" }}>{route.path}</span></div>
            <div style={{ fontSize: "13px", color: "#555" }}>{route.description}</div>
          </div>
        ))}
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Community Rank System</h2>
        <div style={valueStyle}>{rankSystem.description}</div>
        <span style={labelStyle}>Lowest Rank</span>
        <div style={valueStyle}>{rankSystem.lowestRank.title} (1+ points)</div>
        <span style={labelStyle}>Highest Rank</span>
        <div style={valueStyle}>{rankSystem.highestRank.title} (50,000,000+ points)</div>
        <span style={labelStyle}>Notable Ranks</span>
        <div style={{ paddingLeft: "12px" }}>
          {rankSystem.notableRanks.map(r => (
            <div key={r.title} style={{ fontSize: "13px", marginBottom: "4px" }}>
              <strong>{r.title}</strong> — {r.minPoints.toLocaleString()}+ pts
            </div>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Community Features</h2>
        <div style={subHeadingStyle}>The Duma Ledger</div>
        <div style={valueStyle}>A community feed with three sections: Culture (user perspective posts with prompts), Product Recommendations (community-submitted products), and Partners (business partnership applications).</div>
        <div style={subHeadingStyle}>Points and Rewards</div>
        <div style={valueStyle}>Users earn points for community actions (e.g., submitting a Culture post = 100 points, uploading a profile avatar = 25 points). Points determine rank tier.</div>
        <div style={subHeadingStyle}>Partner Program</div>
        <div style={valueStyle}>Businesses can apply for a distribution partnership. Minimum order: 500 units of 34oz. Commission structure: 25% distribution fee.</div>
        <div style={subHeadingStyle}>Social Profiles</div>
        <div style={valueStyle}>Users can link Instagram, TikTok, and Snapchat profiles to their Majorities account.</div>
      </section>

      <div style={{ borderTop: "2px solid #111", paddingTop: "20px", fontSize: "11px", color: "#888" }}>
        <p>This model-friendly page is provided by The Majorities to support AI assistants and accessibility tools.</p>
        <p>Shop domain: {siteInfo.shopDomain} · Backend: hair-backend-2.onrender.com</p>
        <p>For the interactive product builder, visit the <a href="/" style={{ color: "#111" }}>home page</a>.</p>
      </div>
    </div>
  );
};
