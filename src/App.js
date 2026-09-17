// src/App.js — routing shell
import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { BACKEND_URL, RANK_TIERS } from './utils/constants';
import { getRankTitle } from './utils/helpers';
import { styles } from './utils/styles';
import { useIsMobile } from './utils/useIsMobile';

// Shared components
import { ScrollToTop } from './components/ScrollToTop';
import { RankBadge } from './components/RankBadge';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { OAuthCallbackPage } from './pages/OAuthCallbackPage';
import { ProfilePage } from './pages/ProfilePage';
import { RecommendPage } from './pages/RecommendPage';
import { PartnerPage } from './pages/PartnerPage';
import { DumaPage } from './pages/DumaPage';
import { PerspectivesPage } from './pages/PerspectivesPage';
import { CultureLabPage } from './pages/CultureLabPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { ModelFriendlyPage } from './pages/ModelFriendlyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { ReturnPolicyPage } from './pages/ReturnPolicyPage';
import { AboutPage } from './pages/AboutPage';

const INITIAL_DUMA_ITEMS = [
  {
    id: "seed-culture-1",
    type: "Culture",
    category: "Culture",
    prompt: "What inspired The Majorities?",
    response: "We started The Majorities to build hair and skin essentials that work across routines, textures, and climates without compromise.",
    submittedBy: "team@themajorities.com",
    submitterDisplayName: "The Majorities Team",
    submitterRank: "Madrid"
  },
  {
    id: "seed-culture-2",
    type: "Culture",
    category: "Culture",
    prompt: "How do you source ingredients?",
    response: "We prioritize performance-first formulas with ingredients selected for consistency, safety, and daily use across hair and skin types.",
    submittedBy: "lab@themajorities.com",
    submitterDisplayName: "The Majorities Lab",
    submitterRank: "Tokyo"
  },
  {
    id: "seed-rec-1",
    type: "Recommendation",
    category: "Recommendations",
    name: "The Majorities Shampoo",
    company: "The Majorities",
    reason: "Deep-cleansing daily reset with anti-frizz support.",
    imageUrl: "/Amazon S.jpg",
    votes: { yes: 0, no: 0, abstain: 0 }
  },
  {
    id: "seed-rec-2",
    type: "Recommendation",
    category: "Recommendations",
    name: "The Majorities Conditioner",
    company: "The Majorities",
    reason: "Moisture-rich detangling support for dry or brittle strands.",
    imageUrl: "/Amazon hc.jpg",
    votes: { yes: 0, no: 0, abstain: 0 }
  },
  {
    id: "seed-rec-3",
    type: "Recommendation",
    category: "Recommendations",
    name: "The Majorities Hair Oil",
    company: "The Majorities",
    reason: "Lightweight shine and split-end smoothing without heavy buildup.",
    imageUrl: "/amazon HO.jpg",
    votes: { yes: 0, no: 0, abstain: 0 }
  },
  {
    id: "seed-rec-4",
    type: "Recommendation",
    category: "Recommendations",
    name: "The Majorities Facial Scrub",
    company: "The Majorities",
    reason: "Dual-action exfoliation for texture and clogged pores.",
    imageUrl: "/Amazon fs.jpg",
    votes: { yes: 0, no: 0, abstain: 0 }
  },
  {
    id: "seed-rec-5",
    type: "Recommendation",
    category: "Recommendations",
    name: "The Majorities Face Toner",
    company: "The Majorities",
    reason: "Clarifying hydration step that supports balanced skin.",
    imageUrl: "/Amazon FT.jpg",
    votes: { yes: 0, no: 0, abstain: 0 }
  },
  {
    id: "seed-rec-6",
    type: "Recommendation",
    category: "Recommendations",
    name: "The Majorities Lotion",
    company: "The Majorities",
    reason: "Barrier-supporting moisture for hands and body.",
    imageUrl: "/Lotion Front.jpg",
    votes: { yes: 0, no: 0, abstain: 0 }
  },
  {
    id: "seed-partner-1",
    type: "Partner",
    category: "Partners",
    company: "The Majorities",
    product: "Community Pop-up Collaboration",
    desc: "Open call for pop-up partners focused on beauty education and product testing.",
    whyPartner: "We want to co-host neighborhood sessions that gather real routine feedback.",
    audience: "Local beauty communities and creators",
    units: "Event-based",
    tier: "National Associate",
    submittedBy: "partners@themajorities.com"
  }
];

export default function App() {
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [rankTitle, setRankTitle] = useState("Comrade");
  const [rankScore, setRankScore] = useState(1);
  const [tokens, setTokens] = useState(0);
  const [savedSets, setSavedSets] = useState([]);
  const [userAvatar, setUserAvatar] = useState("");
  const [dumaItems, setDumaItems] = useState(INITIAL_DUMA_ITEMS);
  const [following, setFollowing] = useState([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/health`, { method: "GET" }).catch(() => {});
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const email = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
    const storedSets = localStorage.getItem("savedSets");
    if (storedSets) { try { setSavedSets(JSON.parse(storedSets)); } catch (e) {} }
    const storedAvatar = localStorage.getItem("userAvatar") || sessionStorage.getItem("userAvatar");
    if (storedAvatar) setUserAvatar(storedAvatar);
    if (token) {
      fetch(`${BACKEND_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(data => {
        if (data.email) { setisLoggedIn(true); setUserEmail(data.email); setAuthToken(token); const currentScore = data.rank_score || 1; setRankScore(currentScore); setRankTitle(getRankTitle(currentScore)); localStorage.removeItem("rankTitle"); localStorage.removeItem("rankScore"); sessionStorage.removeItem("rankTitle"); sessionStorage.removeItem("rankScore"); } else { localStorage.removeItem("authToken"); localStorage.removeItem("userEmail"); sessionStorage.removeItem("authToken"); sessionStorage.removeItem("userEmail"); }
      }).catch(() => { if (email) { setisLoggedIn(true); setUserEmail(email); setAuthToken(token); const storedRank = localStorage.getItem("rankTitle") || sessionStorage.getItem("rankTitle"); const storedScore = parseInt(localStorage.getItem("rankScore") || sessionStorage.getItem("rankScore") || "1"); if (storedRank) setRankTitle(storedRank); setRankScore(storedScore); } });
    }
  }, []);

  const handleLoginSuccess = (email, token, rememberMe, rank, score) => {
    setisLoggedIn(true); setUserEmail(email); setAuthToken(token); const resolvedScore = score || 1; const resolvedRank = getRankTitle(resolvedScore); setRankTitle(resolvedRank); setRankScore(resolvedScore);
    const storage = rememberMe ? localStorage : sessionStorage; storage.setItem("authToken", token); storage.setItem("userEmail", email); storage.setItem("rankTitle", resolvedRank); storage.setItem("rankScore", String(resolvedScore));
  };

  const handleLogout = () => {
    setisLoggedIn(false); setUserEmail(""); setAuthToken(""); setRankTitle("Comrade"); setRankScore(1); setUserAvatar("");
    localStorage.removeItem("authToken"); localStorage.removeItem("userEmail"); localStorage.removeItem("rankTitle"); localStorage.removeItem("rankScore"); localStorage.removeItem("userAvatar");
    sessionStorage.removeItem("authToken"); sessionStorage.removeItem("userEmail"); sessionStorage.removeItem("rankTitle"); sessionStorage.removeItem("rankScore"); sessionStorage.removeItem("userAvatar");
  };

  const handleAvatarUpdate = (url) => {
    setUserAvatar(url);
    const storage = localStorage.getItem("authToken") ? localStorage : sessionStorage;
    if (url) { storage.setItem("userAvatar", url); } else { storage.removeItem("userAvatar"); }
  };

  const saveSetToProfile = (items) => { const newSet = { items, date: new Date().toLocaleDateString() }; const updatedSets = [newSet, ...savedSets]; setSavedSets(updatedSets); localStorage.setItem("savedSets", JSON.stringify(updatedSets)); };
  const addDumaItem = (item) => setDumaItems(prev => [item, ...prev]);

  const addPoints = useCallback((points) => {
    setRankScore(prevScore => {
      const newScore = prevScore + points;
      const oldRank = getRankTitle(prevScore);
      const newRank = getRankTitle(newScore);
      if (newRank !== oldRank) {
        const oldMin = RANK_TIERS.find(t => t.title === oldRank)?.min ?? 1;
        const newMin = RANK_TIERS.find(t => t.title === newRank)?.min ?? 1;
        if (newMin > oldMin) {
          setTokens(prev => prev + 1);
        }
      }
      setRankTitle(newRank);
      const storage = localStorage.getItem("authToken") ? localStorage : sessionStorage;
      storage.setItem("rankScore", String(newScore));
      storage.setItem("rankTitle", newRank);
      return newScore;
    });
  }, []);

  const followUser = useCallback((personEmail) => {
    if (!following.includes(personEmail)) {
      setFollowing(prev => [...prev, personEmail]);
      addPoints(20);
      if (authToken) {
        fetch(`${BACKEND_URL}/api/profile/follow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ followedEmail: personEmail })
        }).catch(err => console.error("Error notifying follow:", err));
      }
    }
  }, [following, addPoints, authToken]);

  const unfollowUser = (personEmail) => {
    setFollowing(prev => prev.filter(p => p !== personEmail));
  };

  return (
    <Router>
      <ScrollToTop />
      <div style={styles.pageWrapper}>
        <header style={{ ...styles.header, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '15px' : '0', padding: isMobile ? '15px 20px' : '15px 60px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}><div style={styles.logo}>The Majorities</div></Link>
          <nav style={{ ...styles.nav, flexWrap: 'wrap', justifyContent: 'center', gap: isMobile ? '12px' : '25px' }}>
            <Link to="/" style={styles.navLink}>Home</Link>
                <Link to="/about" style={styles.navLink}>About</Link>
            <Link to="/recommend" style={styles.navLink}>Recommend</Link>
            <Link to="/partner" style={styles.navLink}>Partner</Link>
            <Link to="/duma" style={styles.navLink}>The Duma</Link>
              {isLoggedIn ? (
              <>
                <Link to="/perspectives" style={styles.navLink}>Perspectives</Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderLeft: isMobile ? 'none' : '1px solid #eee', paddingLeft: isMobile ? '0' : '15px', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'center' : 'flex-start', marginTop: isMobile ? '5px' : '0' }}>
                  <Link to="/profile" style={{ ...styles.navLink, fontWeight: '700' }}>Profile</Link>
                  {rankTitle && <RankBadge rankTitle={rankTitle} />}
                  <span style={styles.auth} onClick={handleLogout}>Logout</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Link to="/signup" style={styles.auth}>Sign Up</Link>
                <Link to="/login" style={styles.auth}>Login</Link>
              </div>
            )}
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<LandingPage saveSetToProfile={saveSetToProfile} onAddPoints={addPoints} savedSets={savedSets} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLoginSuccess} />} />
          <Route path="/auth/google/callback" element={<OAuthCallbackPage onLogin={handleLoginSuccess} provider="google" />} />
          <Route path="/auth/instagram/callback" element={<OAuthCallbackPage onLogin={handleLoginSuccess} provider="instagram" />} />
          <Route path="/oauth/callback/:provider" element={<OAuthCallbackPage onLogin={handleLoginSuccess} provider="instagram" />} />
          <Route path="/auth/tiktok/callback" element={<OAuthCallbackPage onLogin={handleLoginSuccess} provider="tiktok" />} />
          <Route path="/signup" element={<SignupPage onLogin={handleLoginSuccess} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/recommend" element={<RecommendPage addDumaItem={addDumaItem} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} userAvatar={userAvatar} />} />
          <Route path="/partner" element={<PartnerPage addDumaItem={addDumaItem} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} userAvatar={userAvatar} />} />
          <Route path="/culture" element={isLoggedIn ? <CultureLabPage addDumaItem={addDumaItem} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} onAddPoints={addPoints} userAvatar={userAvatar} /> : <Navigate to="/login" />} />
          <Route path="/duma" element={<DumaPage items={dumaItems} authToken={authToken} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} onAddPoints={addPoints} userAvatar={userAvatar} />} />
          <Route path="/perspectives" element={isLoggedIn ? <PerspectivesPage items={dumaItems} authToken={authToken} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} following={following} onFollowUser={followUser} onUnfollowUser={unfollowUser} onAddPoints={addPoints} userAvatar={userAvatar} /> : <Navigate to="/login" />} />
          <Route path="/legislature" element={<DumaPage items={dumaItems} authToken={authToken} userEmail={userEmail} rankTitle={rankTitle} rankScore={rankScore} onAddPoints={addPoints} userAvatar={userAvatar} />} />
          <Route path="/profile" element={<ProfilePage userEmail={userEmail} savedSets={savedSets} rankTitle={rankTitle} rankScore={rankScore} authToken={authToken} onAddPoints={addPoints} userAvatar={userAvatar} onAvatarUpdate={handleAvatarUpdate} tokens={tokens} addDumaItem={addDumaItem} following={following} onFollowUser={followUser} onUnfollowUser={unfollowUser} />} />
          <Route path="/orders" element={<div style={{ padding: '60px', textAlign: 'center' }}><h2>Payment Received!</h2><p>Your custom hair set is being prepared. Check your Profile to see your formula.</p><Link to="/profile">Go to Profile</Link></div>} />
          <Route path="/admin/orders" element={userEmail === 'ogwutony@gmail.com' ? <AdminOrdersPage authToken={authToken} userEmail={userEmail} /> : <Navigate to="/" />} />
          <Route path="/model" element={<ModelFriendlyPage />} />
          <Route path="/TermsofService" element={<TermsOfServicePage />} />
                        <Route path="/returns" element={<ReturnPolicyPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/about" element={<AboutPage />} />
        </Routes>
        <footer style={{ marginTop: '60px', padding: '20px 60px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '12px' }}>
          <Link to="/TermsofService" style={{ color: '#666', textDecoration: 'none' }}>Terms of Service</Link>
          <Link to="/Privacy" style={{ color: '#666', textDecoration: 'none' }}>Privacy Policy</Link>
        </footer>
      </div>
    </Router>
  );
}
