// src/pages/DumaPage.jsx
import React, { useEffect, useState } from 'react';
import { useIsMobile } from '../utils/useIsMobile';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { CredentialHeader } from '../components/CredentialHeader';
import { GuestSubmissionPrompt } from '../components/GuestSubmissionPrompt';
import { RankBadge } from '../components/RankBadge';
import { BACKEND_URL } from '../utils/constants';
import { getRankTitle, normalizeMediaVideoUrl } from '../utils/helpers';
import { styles } from '../utils/styles';

export const DumaPage = ({ items, authToken, userEmail, rankTitle, rankScore, onAddPoints, userAvatar }) => {
  const isMobile = useIsMobile();
  const [dumaItems, setDumaItems] = useState(items);
  const [userVotes, setUserVotes] = useState({});
  const [showScores, setShowScores] = useState({});
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [activeSection, setActiveSection] = useState("Culture");
  const [marketplaceListings, setMarketplaceListings] = useState([]);
  const [boostingId, setBoostingId] = useState(null);
  const socialFeedUrl = process.env.REACT_APP_SOCIAL_FEED_URL;

  const isFeaturedContributor = (item) =>
    item.featuredOnInstagram || item.socialEngagement >= 100 || (item.votes?.yes || 0) >= 10;

  const sharePost = async (item, platform) => {
    const shareText = `${item.prompt || 'A perspective from The Majorities'}\n${item.response || item.reason || item.desc || ''}\n#TheMajorities`;
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // Opening the platform still lets the customer share manually when clipboard access is unavailable.
    }
    window.open(platform === 'instagram' ? 'https://www.instagram.com/' : 'https://www.tiktok.com/', '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/duma`).then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        // De-duplicate items by ID so only one unique entry is rendered per submission
        const uniqueMap = new Map();
        [...data, ...items].forEach(item => {
          const id = item._id || item.id;
          if (id) uniqueMap.set(String(id), item);
        });
        setDumaItems(Array.from(uniqueMap.values()));
      }
    }).catch(err => console.error('Failed to load duma items:', err));
  }, [items]);

  // Marketplace feed: backend sorts boosted listings (boostedUntil in the future) first, then newest
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/marketplace`).then(r => r.json()).then(data => {
      if (Array.isArray(data)) setMarketplaceListings(data);
    }).catch(err => console.error('Failed to load marketplace listings:', err));
  }, []);

  const handleBoostListing = async (listingId) => {
    if (!authToken) return alert("Please log in to boost listings.");
    if (!window.confirm("Boost this listing to the top for 24 hours? This costs 500 points.")) return;
    setBoostingId(listingId);
    try {
      const response = await fetch(`${BACKEND_URL}/api/marketplace/boost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + authToken },
        body: JSON.stringify({ listingId })
      });
      const data = await response.json();
      if (response.ok) {
        const boostedItem = data.item;
        setMarketplaceListings(prev => {
          const now = new Date();
          const updated = prev.map(item => (item._id || item.id) === listingId ? { ...item, boostedUntil: boostedItem?.boostedUntil || data.boostedUntil } : item);
          return [...updated].sort((a, b) => {
            const aBoosted = a.boostedUntil && new Date(a.boostedUntil) > now ? 1 : 0;
            const bBoosted = b.boostedUntil && new Date(b.boostedUntil) > now ? 1 : 0;
            if (bBoosted !== aBoosted) return bBoosted - aBoosted;
            if (aBoosted && bBoosted) return new Date(b.boostedUntil) - new Date(a.boostedUntil);
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
        });
        if (onAddPoints) onAddPoints(-500);
      } else {
        alert(data.error || "Failed to boost listing.");
      }
    } catch (err) {
      alert("Failed to boost listing.");
    }
    setBoostingId(null);
  };

  const handleVote = async (itemId, voteType) => {
    if (!authToken) return alert("Please log in to vote.");
    if (userVotes[itemId]) return;

    setUserVotes(prev => ({ ...prev, [itemId]: voteType }));
    setShowScores(prev => ({ ...prev, [itemId]: true }));
    setShowComments(prev => ({ ...prev, [itemId]: true }));
    try {
      const response = await fetch(`${BACKEND_URL}/api/duma/${itemId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ vote: voteType })
      });
      if (response.ok) {
        const data = await response.json();
        setDumaItems(prev => prev.map(item => item.id === itemId || item._id === itemId ? { ...item, votes: data.votes || item.votes } : item));
        if (voteType === 'yes' && onAddPoints) onAddPoints(10);
      }
    } catch (err) {}
  };

  const handleDeletePost = async (itemId) => {
    if (!authToken) return alert("Please log in to delete posts.");
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/duma/${itemId}`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        setDumaItems(prev => prev.filter(item => (item._id || item.id) !== itemId));
      } else {
        alert("Failed to delete post.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete post.");
    }
  };

  const handleCommentSubmit = (itemId) => {
    if (!commentText[itemId]?.trim()) return;
    setComments(prev => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), { author: userEmail, text: commentText[itemId], timestamp: new Date().toLocaleString() }]
    }));
    setCommentText(prev => ({ ...prev, [itemId]: '' }));
  };

  const culturalItems = dumaItems.filter(item => item.section === "Cultural" || item.category === "Culture" || item.type === "Video" || item.type === "Culture");
  const recommendationItems = dumaItems.filter(item => item.type === "Product Recommendation" || item.type === "Recommendation");
  const partnerItems = dumaItems.filter(item => item.type === "Partner");
  const marketplaceItems = marketplaceListings;

  return (
      <div style={{ padding: isMobile ? '25px 16px' : '40px 60px', maxWidth: '1100px', margin: '0 auto', flex: '1 1 auto', minWidth: 0 }}>
      <Helmet>
        <title>The Duma | The Majorities</title>
        <meta name="description" content="The Majorities Duma — explore culture, recommendations, and perspectives from our community." />
        <link rel="canonical" href="https://themajorities.com/duma" />
      </Helmet>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', marginBottom: '16px', fontSize: '13px', fontWeight: '700' }}>
        <a href="https://www.instagram.com/themajorities/" target="_blank" rel="noopener noreferrer" style={{ color: '#c13584', textDecoration: 'none' }}>◎ Instagram</a>
        <a href="https://www.tiktok.com/@themajorities" target="_blank" rel="noopener noreferrer" style={{ color: '#222', textDecoration: 'none' }}>♪ TikTok</a>
      </div>
      <div style={{ textAlign: 'center', marginBottom: '22px' }}>
        <a href="https://www.instagram.com/explore/tags/themajorities/" target="_blank" rel="noopener noreferrer" style={{ color: '#2d6a4f', fontSize: '18px', fontWeight: '800', textDecoration: 'none' }}>#TheMajorities</a>
      </div>
      {socialFeedUrl && (
        <section style={{ marginBottom: '30px', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }} aria-label="Live #TheMajorities social feed">
          <iframe title="Live #TheMajorities social feed" src={socialFeedUrl} style={{ display: 'block', width: '100%', minHeight: '420px', border: 0 }} loading="lazy" />
        </section>
      )}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '30px', gap: isMobile ? '15px' : '0' }}>
        <div>
          <h2 style={{ marginBottom: '6px' }}>The Majorities' Duma</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Community recommendations, partnerships, and cultural contributions - vote to shape The Majorities.</p>
        </div>
        {userEmail && rankTitle && <div style={{ width: isMobile ? '100%' : 'auto' }}><CredentialHeader email={userEmail} rankTitle={getRankTitle(rankScore)} rankScore={rankScore} avatarUrl={userAvatar} /></div>}
      </div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '15px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', whiteSpace: 'nowrap', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        <button onClick={() => setActiveSection("Culture")} style={{ padding: '10px 20px', backgroundColor: activeSection === "Culture" ? '#222' : '#f5f5f5', color: activeSection === "Culture" ? '#fff' : '#222', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', flexShrink: 0 }}>Culture ({culturalItems.length})</button>
        <button onClick={() => setActiveSection("Recommendations")} style={{ padding: '10px 20px', backgroundColor: activeSection === "Recommendations" ? '#222' : '#f5f5f5', color: activeSection === "Recommendations" ? '#fff' : '#222', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', flexShrink: 0 }}>Recommendations ({recommendationItems.length})</button>
        <button onClick={() => setActiveSection("Partners")} style={{ padding: '10px 20px', backgroundColor: activeSection === "Partners" ? '#222' : '#f5f5f5', color: activeSection === "Partners" ? '#fff' : '#222', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', flexShrink: 0 }}>Partners ({partnerItems.length})</button>
        <button onClick={() => setActiveSection("Marketplace")} style={{ padding: '10px 20px', backgroundColor: activeSection === "Marketplace" ? '#222' : '#f5f5f5', color: activeSection === "Marketplace" ? '#fff' : '#222', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', flexShrink: 0 }}>Marketplace ({marketplaceItems.length})</button>
        <Link to={authToken ? '/culture' : '/login'} style={{ padding: '8px 14px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', marginLeft: isMobile ? '0' : 'auto', flexShrink: 0, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>{authToken ? '+ Share Your Perspective' : 'Log in to Share'}</Link>
      </div>

      
      {activeSection === "Culture" && (
        <div>
          {culturalItems.length === 0 ? (
            <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888' }}>No perspectives shared yet. Share yours and contribute to our culture section!</div>
          ) : (
            culturalItems.map(item => {
              const itemId = item._id || item.id;
              // Dynamically recalculate rank badge from stored score to always reflect correct tier
              const verifiedRank = item.rankScore ? getRankTitle(item.rankScore) : (item.submitterRank || "Comrade");

              return (
                <div key={itemId} style={styles.dumaCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span style={styles.typeTag}>Perspective</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isFeaturedContributor(item) && <span style={{ background: '#f4d35e', color: '#222', borderRadius: '999px', padding: '4px 8px', fontSize: '10px', fontWeight: '800' }}>★ Featured on The Duma</span>}
                      <RankBadge rankTitle={verifiedRank} />
                      {authToken && userEmail && item.submittedBy && item.submittedBy.toLowerCase() === userEmail.toLowerCase() && (
                        <button onClick={() => handleDeletePost(itemId)} style={{ border: '1px solid #e74c3c', color: '#e74c3c', background: '#fff', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                          Trash
                        </button>
                      )}
                    </div>
                  </div>

                  {item.submittedBy && (
                    <CredentialHeader
                      email={item.submittedBy}
                      displayName={item.submitterDisplayName || null}
                      rankTitle={verifiedRank}
                      rankScore={item.rankScore || null}
                      avatarUrl={item.submitterAvatar || null}
                      socialLinks={item.submitterSocialLinks || null}
                    />
                  )}

                  {item.location && (
                    <div style={{ fontSize: '11px', color: '#555', backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', marginBottom: '10px', alignItems: 'center', gap: '4px' }}>
                      📍 {item.location}
                    </div>
                  )}

                  <h4 style={{ marginTop: '12px', marginBottom: '8px', color: '#555' }}>Prompt: "{item.prompt || 'What makes a person beautiful?'}"</h4>
                  <p style={{ color: '#222', fontSize: '14px', lineHeight: '1.6', marginBottom: '14px' }}>{item.response || item.reason || item.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                    <button type="button" onClick={() => sharePost(item, 'instagram')} style={{ border: '1px solid #c13584', background: '#fff', color: '#c13584', borderRadius: '6px', padding: '7px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>Share to Instagram</button>
                    <button type="button" onClick={() => sharePost(item, 'tiktok')} style={{ border: '1px solid #222', background: '#fff', color: '#222', borderRadius: '6px', padding: '7px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>Share to TikTok</button>
                  </div>

                  {/* MEDIA DISPLAY: renders uploaded images or videos inline */}
                  {(() => {
                    const mediaList = Array.isArray(item.mediaUrls) && item.mediaUrls.length > 0
                      ? item.mediaUrls
                      : item.mediaUrl ? [item.mediaUrl] : [];
                    if (mediaList.length === 0) return null;
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: mediaList.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px', margin: '15px 0', background: '#fafafa', padding: '10px', borderRadius: '12px', border: '1px solid #eee' }}>
                        {mediaList.map((url, idx) => (
                          <div key={idx} style={{ textAlign: 'center' }}>
                            {/\.(mp4|mov|webm)$/i.test(url) || url.includes('/video/upload/') ? (
                              <video
                                src={normalizeMediaVideoUrl(url)}
                                poster={url.includes('cloudinary.com') ? url.replace(/\.(mp4|mov|webm|m4v)$/i, '.jpg') : undefined}
                                style={{ width: '100%', maxHeight: '400px', borderRadius: '8px', backgroundColor: '#000', objectFit: 'contain' }}
                                controls playsInline preload="metadata"
                              />
                            ) : (
                              <img src={url} alt={`Attachment ${idx + 1}`} style={{ width: '100%', maxHeight: mediaList.length === 1 ? '400px' : '200px', borderRadius: '8px', objectFit: 'cover' }} />
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {authToken && (
                    <div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                        <button disabled={!!userVotes[itemId]} onClick={() => handleVote(itemId, 'yes')} style={{ ...styles.voteBtn, borderColor: '#27ae60', color: '#27ae60', opacity: userVotes[itemId] === 'yes' ? 1 : 0.7 }}>Yes</button>
                        <button disabled={!!userVotes[itemId]} onClick={() => handleVote(itemId, 'no')} style={{ ...styles.voteBtn, borderColor: '#e74c3c', color: '#e74c3c', opacity: userVotes[itemId] === 'no' ? 1 : 0.7 }}>No</button>
                        <button disabled={!!userVotes[itemId]} onClick={() => handleVote(itemId, 'abstain')} style={{ ...styles.voteBtn, borderColor: '#95a5a6', color: '#95a5a6', opacity: userVotes[itemId] === 'abstain' ? 1 : 0.7 }}>Abstain</button>
                      </div>

                      {showScores[itemId] && (
                        <div style={{ backgroundColor: '#f0f8ff', padding: '12px', borderRadius: '8px', marginBottom: '14px', borderLeft: '4px solid #3498db' }}>
                          <p style={{ fontSize: '12px', fontWeight: '600', color: '#2980b9', margin: '0' }}>Vote Results:</p>
                          <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
                            Yes: {item.votes?.yes || 0} | No: {item.votes?.no || 0} | Abstain: {item.votes?.abstain || 0}
                          </p>
                        </div>
                      )}

                      {showComments[itemId] && (
                        <div style={{ borderTop: '2px solid #eee', paddingTop: '12px' }}>
                          <h4 style={{ fontSize: '13px', color: '#555', marginBottom: '12px', fontWeight: '700' }}>Comments:</h4>
                          {comments[itemId]?.length > 0 && (
                            <div style={{ marginBottom: '12px' }}>
                              {comments[itemId].map((comment, idx) => (
                                <div key={idx} style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px', marginBottom: '8px', borderLeft: '3px solid #3498db' }}>
                                  <p style={{ fontSize: '11px', fontWeight: '600', color: '#222', margin: '0 0 4px 0' }}>{comment.author}</p>
                                  <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>{comment.text}</p>
                                  <p style={{ fontSize: '10px', color: '#aaa', margin: 0 }}>{comment.timestamp}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="text" placeholder="Add a comment..." style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px' }} value={commentText[itemId] || ''} onChange={(e) => setCommentText(prev => ({ ...prev, [itemId]: e.target.value }))} />
                            <button onClick={() => handleCommentSubmit(itemId)} style={{ padding: '8px 16px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Post</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeSection === "Recommendations" && !authToken && (
        <div style={{ padding: '20px 0' }}>
          <GuestSubmissionPrompt message="This section contains proprietary commerce ledger records, partner structures, and product recommendations. Please log in or register to view this data." />
        </div>
      )}

      {activeSection === "Recommendations" && authToken && (
        <div>
          {recommendationItems.length === 0 ? (
            <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888' }}>No product recommendations yet. Be the first to recommend a product!</div>
          ) : (
            recommendationItems.map(item => (
              <div key={item.id || item._id} style={styles.dumaCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={styles.typeTag}>{item.type}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.submitterRank && <RankBadge rankTitle={item.submitterRank} />}
                    {authToken && userEmail && item.submittedBy && item.submittedBy.toLowerCase() === userEmail.toLowerCase() && (
                      <button onClick={() => handleDeletePost(item._id || item.id)} style={{ border: '1px solid #e74c3c', color: '#e74c3c', background: '#fff', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        Trash
                      </button>
                    )}
                  </div>
                </div>
                {item.submittedBy && <CredentialHeader email={item.submittedBy} displayName={item.submitterDisplayName || null} rankTitle={item.submitterRank || 'Comrade'} rankScore={null} avatarUrl={item.submitterAvatar || null} socialLinks={item.submitterSocialLinks || null} />}
                {item.location && (
                  <div style={{ fontSize: '11px', color: '#555', backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', marginBottom: '10px', alignItems: 'center', gap: '4px' }}>
                    📍 {item.location}
                  </div>
                )}
                <h3 style={{ marginTop: '8px', marginBottom: '6px' }}>{item.name || item.product} by {item.company}</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '14px' }}>{item.reason || item.desc}</p>
                
                {authToken && (
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                      <button disabled={!!userVotes[item.id || item._id]} onClick={() => handleVote(item._id || item.id, 'yes')} style={{ ...styles.voteBtn, borderColor: '#27ae60', color: '#27ae60', opacity: userVotes[item.id || item._id] === 'yes' ? 1 : 0.7 }}>Yes</button>
                      <button disabled={!!userVotes[item.id || item._id]} onClick={() => handleVote(item._id || item.id, 'no')} style={{ ...styles.voteBtn, borderColor: '#e74c3c', color: '#e74c3c', opacity: userVotes[item.id || item._id] === 'no' ? 1 : 0.7 }}>No</button>
                      <button disabled={!!userVotes[item.id || item._id]} onClick={() => handleVote(item._id || item.id, 'abstain')} style={{ ...styles.voteBtn, borderColor: '#95a5a6', color: '#95a5a6', opacity: userVotes[item.id || item._id] === 'abstain' ? 1 : 0.7 }}>Abstain</button>
                    </div>
                    
                    {showScores[item.id || item._id] && (
                      <div style={{ backgroundColor: '#f0f8ff', padding: '12px', borderRadius: '8px', marginBottom: '14px', borderLeft: '4px solid #3498db' }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#2980b9', margin: '0' }}>Vote Results:</p>
                        <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
                          Yes: {item.votes?.yes || 0} | No: {item.votes?.no || 0} | Abstain: {item.votes?.abstain || 0}
                        </p>
                      </div>
                    )}
                    
                    {showComments[item.id || item._id] && (
                      <div style={{ borderTop: '2px solid #eee', paddingTop: '12px' }}>
                        <h4 style={{ fontSize: '13px', color: '#555', marginBottom: '12px', fontWeight: '700' }}>Comments:</h4>
                        
                        {comments[item.id || item._id]?.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            {comments[item.id || item._id].map((comment, idx) => (
                              <div key={idx} style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px', marginBottom: '8px', borderLeft: '3px solid #3498db' }}>
                                <p style={{ fontSize: '11px', fontWeight: '600', color: '#222', margin: '0 0 4px 0' }}>{comment.author}</p>
                                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>{comment.text}</p>
                                <p style={{ fontSize: '10px', color: '#aaa', margin: 0 }}>{comment.timestamp}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" placeholder="Add a comment..." style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px' }} value={commentText[item.id || item._id] || ''} onChange={(e) => setCommentText(prev => ({ ...prev, [item.id || item._id]: e.target.value }))} />
                          <button onClick={() => handleCommentSubmit(item.id || item._id)} style={{ padding: '8px 16px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Post</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeSection === "Partners" && !authToken && (
        <div style={{ padding: '20px 0' }}>
          <GuestSubmissionPrompt message="This section contains proprietary commerce ledger records, partner structures, and product recommendations. Please log in or register to view this data." />
        </div>
      )}

      {activeSection === "Partners" && authToken && (
        <div>
          {partnerItems.length === 0 ? (
            <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888' }}>No partner applications yet. Be the first to submit a partnership!</div>
          ) : (
            partnerItems.map(item => (
              <div key={item.id || item._id} style={styles.dumaCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={styles.typeTag}>{item.type}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.submitterRank && <RankBadge rankTitle={item.submitterRank} />}
                    {authToken && userEmail && item.submittedBy && item.submittedBy.toLowerCase() === userEmail.toLowerCase() && (
                      <button onClick={() => handleDeletePost(item._id || item.id)} style={{ border: '1px solid #e74c3c', color: '#e74c3c', background: '#fff', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        Trash
                      </button>
                    )}
                  </div>
                </div>
                {item.submittedBy && <CredentialHeader email={item.submittedBy} displayName={item.submitterDisplayName || null} rankTitle={item.submitterRank || 'Comrade'} rankScore={null} avatarUrl={item.submitterAvatar || null} socialLinks={item.submitterSocialLinks || null} />}
                {item.location && (
                  <div style={{ fontSize: '11px', color: '#555', backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', marginBottom: '10px', alignItems: 'center', gap: '4px' }}>
                    📍 {item.location}
                  </div>
                )}

                <h3 style={{ marginTop: '12px', marginBottom: '12px' }}>{item.productType} - {item.company}</h3>

                <h4 style={{ marginBottom: '6px', fontSize: '13px', color: '#555', fontWeight: '700' }}>Product Details:</h4>
                <p style={{ color: '#666', fontSize: '13px', marginBottom: '6px', lineHeight: '1.5' }}>
                  <strong>Type:</strong> {item.productType}
                </p>
                <p style={{ color: '#222', fontSize: '13px', marginBottom: '12px', lineHeight: '1.5' }}>
                  <strong>Description:</strong> {item.productDescription}
                </p>
                <p style={{ color: '#222', fontSize: '13px', marginBottom: '12px', lineHeight: '1.5' }}>
                  <strong>Partnership Rationale:</strong> {item.whyPartner}
                </p>

                {(item.hasPhoto || item.hasVideo) && (
                  <div style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px', borderLeft: '4px solid #9b59b6' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', color: '#555' }}>Media:</h4>
                    {item.hasPhoto && <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>Product photo included</p>}
                    {item.hasVideo && <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>Product video included</p>}
                  </div>
                )}

                <div style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px', borderLeft: '4px solid #27ae60' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', color: '#555' }}>Business Logistics:</h4>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                    <strong>EIN:</strong> {item.ein || 'N/A'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                    <strong>MOQ:</strong> 500 units (3.4 oz)
                  </p>
                  {item.desiredOrderQuantity && (
                    <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                      <strong>Desired Fulfillment:</strong> {item.desiredOrderQuantity} units
                    </p>
                  )}
                  {item.pricing5Gallon && (
                    <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                      <strong>5-Gallon Pricing:</strong> {item.pricing5Gallon}
                    </p>
                  )}
                </div>

                <div style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '14px', borderLeft: '4px solid #e67e22' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', color: '#555' }}>Pricing Models:</h4>
                  {item.standardUnitPrice && (
                    <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                      <strong>One Time Price:</strong> ${item.standardUnitPrice}
                    </p>
                  )}
                  {item.promotionalUnitPrice && (
                    <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                      <strong>Subscription Price:</strong> ${item.promotionalUnitPrice}
                    </p>
                  )}
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                    <strong>Commission:</strong> The Majorities take 25% | Partner receives 75%
                  </p>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                    <strong>Tier:</strong> {item.tier}
                  </p>
                </div>

                <div style={{ backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px', marginBottom: '14px', borderLeft: '4px solid #34495e' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', color: '#555' }}>Policy Checkboxes:</h4>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                    <strong>Customer Reward Program:</strong> {item.customerRewardAgreed ? 'Agreed' : 'Not specified'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                    <strong>25% Commission Agreement:</strong> {item.commission25AgreedTo ? 'Agreed' : 'Not specified'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                    <strong>Shipping & Returns Policy:</strong> {item.shippingReturnsAgreed ? 'Agreed' : 'Not specified'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                    <strong>Ownership & Title Policy:</strong> {item.ownershipTitleAgreed ? 'Agreed' : 'Not specified'}
                  </p>
                </div>

                {/* VOTING SECTION */}
                {authToken && (
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                      <button disabled={!!userVotes[item.id || item._id]} onClick={() => handleVote(item._id || item.id, 'yes')} style={{ ...styles.voteBtn, borderColor: '#27ae60', color: '#27ae60', opacity: userVotes[item.id || item._id] === 'yes' ? 1 : 0.7 }}>Yes</button>
                      <button disabled={!!userVotes[item.id || item._id]} onClick={() => handleVote(item._id || item.id, 'no')} style={{ ...styles.voteBtn, borderColor: '#e74c3c', color: '#e74c3c', opacity: userVotes[item.id || item._id] === 'no' ? 1 : 0.7 }}>No</button>
                      <button disabled={!!userVotes[item.id || item._id]} onClick={() => handleVote(item._id || item.id, 'abstain')} style={{ ...styles.voteBtn, borderColor: '#95a5a6', color: '#95a5a6', opacity: userVotes[item.id || item._id] === 'abstain' ? 1 : 0.7 }}>Abstain</button>
                    </div>

                    {/* VOTE SCORES - VISIBLE ONLY AFTER VOTING */}
                    {showScores[item.id || item._id] && (
                      <div style={{ backgroundColor: '#f0f8ff', padding: '12px', borderRadius: '8px', marginBottom: '14px', borderLeft: '4px solid #3498db' }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#2980b9', margin: '0' }}>Vote Results:</p>
                        <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
                          Yes: {item.votes?.yes || 0} | No: {item.votes?.no || 0} | Abstain: {item.votes?.abstain || 0}
                        </p>
                      </div>
                    )}

                    {/* COMMENTS SECTION - VISIBLE AFTER VOTING */}
                    {showComments[item.id || item._id] && (
                      <div style={{ borderTop: '2px solid #eee', paddingTop: '12px' }}>
                        <h4 style={{ fontSize: '13px', color: '#555', marginBottom: '12px', fontWeight: '700' }}>Comments:</h4>

                        {/* EXISTING COMMENTS */}
                        {comments[item.id || item._id]?.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            {comments[item.id || item._id].map((comment, idx) => (
                              <div key={idx} style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px', marginBottom: '8px', borderLeft: '3px solid #3498db' }}>
                                <p style={{ fontSize: '11px', fontWeight: '600', color: '#222', margin: '0 0 4px 0' }}>{comment.author}</p>
                                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>{comment.text}</p>
                                <p style={{ fontSize: '10px', color: '#aaa', margin: 0 }}>{comment.timestamp}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* ADD COMMENT */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" placeholder="Add a comment..." style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px' }} value={commentText[item.id || item._id] || ''} onChange={(e) => setCommentText(prev => ({ ...prev, [item.id || item._id]: e.target.value }))} />
                          <button onClick={() => handleCommentSubmit(item.id || item._id)} style={{ padding: '8px 16px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Post</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeSection === "Marketplace" && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Marketplace</h3>
            <Link to={authToken ? '/sell' : '/login'} style={{ ...styles.authButton, width: 'auto', padding: '10px 20px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>List a Product</Link>
          </div>
          {!authToken ? (
            <GuestSubmissionPrompt message="Log in or register to view listings and sell in the Marketplace." />
          ) : marketplaceItems.length === 0 ? (
            <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888' }}>No listings yet. Be the first to offer a product or service.</div>
          ) : (
            marketplaceItems.map(item => {
              const isBoosted = item.boostedUntil && new Date(item.boostedUntil) > new Date();
              const isOwner = authToken && userEmail && item.submittedBy && item.submittedBy.toLowerCase() === userEmail.toLowerCase();
              return (
                <div key={item._id || item.id} style={{ ...styles.dumaCard, border: isBoosted ? '2px solid #f1c40f' : styles.dumaCard?.border }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={styles.typeTag}>{item.category || 'Listing'}</span>
                    {isBoosted && (
                      <span style={{ background: '#f1c40f', color: '#222', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '800' }}>
                        ⚡ Boosted until {new Date(item.boostedUntil).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {item.imageUrl && <img src={item.imageUrl} alt={item.title} style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px' }} />}
                  <h3 style={{ marginTop: 0, marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ color: '#666', fontSize: '13px', lineHeight: '1.5' }}>{item.description}</p>
                  <strong>${Number(item.price).toFixed(2)}</strong>
                  {item.submittedBy && <div style={{ marginTop: '12px' }}><CredentialHeader email={item.submittedBy} displayName={null} rankTitle={item.submitterRank || 'Comrade'} rankScore={null} avatarUrl={null} socialLinks={null} /></div>}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {item.externalLink && (
                      <a href={item.externalLink} target="_blank" rel="noopener noreferrer" style={{ ...styles.authButton, width: 'auto', padding: '10px 20px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', background: '#fff', color: '#222', border: '1px solid #222' }}>
                        Visit listing
                      </a>
                    )}
                    {isOwner && !isBoosted && (
                      <button disabled={boostingId === (item._id || item.id)} onClick={() => handleBoostListing(item._id || item.id)} style={{ ...styles.authButton, width: 'auto', padding: '10px 20px', background: '#f1c40f', color: '#222', opacity: boostingId === (item._id || item.id) ? 0.6 : 1 }}>
                        {boostingId === (item._id || item.id) ? 'Boosting...' : '⚡ Boost to the top for 24 Hours (Costs 500 Points)'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
