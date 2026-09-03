// src/pages/PerspectivesPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CredentialHeader } from '../components/CredentialHeader';
import { MediaModal } from '../components/MediaModal';
import { RankBadge } from '../components/RankBadge';
import { BACKEND_URL } from '../utils/constants';
import { normalizeMediaVideoUrl } from '../utils/helpers';
import { styles } from '../utils/styles';

export const PerspectivesPage = ({ items, authToken, userEmail, rankTitle, rankScore, following, onFollowUser, onUnfollowUser, onAddPoints, userAvatar }) => {
  const location = useLocation();
  const [followingList, setFollowingList] = useState([]);
  const [selectedFollowing, setSelectedFollowing] = useState(following || []);
  const [filteredItems, setFilteredItems] = useState([]);
  const [allItems, setAllItems] = useState(items);
  const [followedAt, setFollowedAt] = useState({});
  const [avatarByUser, setAvatarByUser] = useState({});
  const [nameByUser, setNameByUser] = useState({});
  const [avatarSlotsByUser, setAvatarSlotsByUser] = useState({});
  const [activeMedia, setActiveMedia] = useState(null);

  useEffect(() => {
    if (!Array.isArray(following)) return;
    setSelectedFollowing(following);
    setFollowedAt(prev => {
      const next = { ...prev };
      following.forEach((person, idx) => {
        if (!next[person]) next[person] = idx + 1;
      });
      return next;
    });
  }, [following]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/duma`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setAllItems(data);
      })
      .catch(err => console.error("Failed to load perspectives:", err));
  }, []);

  useEffect(() => {
    const uniqueSubmitters = [...new Set(allItems.map(item => item.submittedBy))].filter(Boolean).filter(p => p !== userEmail);
    setFollowingList(uniqueSubmitters);

    const nextAvatarMap = {};
    const nextNameMap = {};
    const nextSlotsMap = {};

    allItems.forEach(item => {
      if (item?.submittedBy) {
        if (item.submitterAvatar) nextAvatarMap[item.submittedBy] = item.submitterAvatar;
        if (item.submitterDisplayName) nextNameMap[item.submittedBy] = item.submitterDisplayName;
        if (item.submitterAvatarSlots && item.submitterAvatarSlots.length > 0) {
          nextSlotsMap[item.submittedBy] = item.submitterAvatarSlots;
        }
      }
    });

    setAvatarByUser(nextAvatarMap);
    setNameByUser(nextNameMap);
    setAvatarSlotsByUser(nextSlotsMap);
  }, [allItems, userEmail]);

  const handleFollowingToggle = (person) => {
    if (selectedFollowing.includes(person)) {
      onUnfollowUser?.(person);
      setSelectedFollowing(prev => prev.filter(p => p !== person));
      setFollowedAt(prev => {
        const next = { ...prev };
        delete next[person];
        return next;
      });
    } else {
      onFollowUser?.(person);
      setSelectedFollowing(prev => [...prev, person]);
      setFollowedAt(prev => ({ ...prev, [person]: Date.now() }));
    }
  };

  useEffect(() => {
    const relevantItems = allItems.filter(item =>
      selectedFollowing.includes(item.submittedBy) ||
      (item.submittedBy && item.submittedBy.toLowerCase() === userEmail?.toLowerCase())
    );

    const sorted = relevantItems.sort((a, b) => {
      const aTime = new Date(a.createdAt || a.updatedAt || a.timestamp || 0).getTime() || 0;
      const bTime = new Date(b.createdAt || b.updatedAt || b.timestamp || 0).getTime() || 0;
      return bTime - aTime;
    });

    setFilteredItems(sorted);
  }, [selectedFollowing, allItems, followedAt, userEmail]);

  useEffect(() => {
    const person = new URLSearchParams(location.search).get("person");
    if (!person) return;
    setSelectedFollowing(prev => (prev.includes(person) ? prev : [...prev, person]));
    setFollowedAt(prev => (prev[person] ? prev : { ...prev, [person]: Date.now() }));
  }, [location.search]);

  const handleDeletePost = async (itemId) => {
    if (!authToken) return alert("Please log in to delete posts.");
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/duma/${itemId}`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        setAllItems(prev => prev.filter(item => (item._id || item.id) !== itemId));
        setFilteredItems(prev => prev.filter(item => (item._id || item.id) !== itemId));
      } else {
        alert("Failed to delete post.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete post.");
    }
  };

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <MediaModal media={activeMedia} onClose={() => setActiveMedia(null)} />
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ marginBottom: '6px' }}>My Perspectives</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Follow people from The Duma to see their perspectives in your personalized feed. Earn +20 points for each person you follow!
          </p>
        </div>

        {userEmail && rankTitle && (
          <div style={{ marginBottom: '20px' }}>
            <CredentialHeader email={userEmail} rankTitle={rankTitle} rankScore={rankScore} avatarUrl={userAvatar} />
          </div>
        )}

        <div style={{ ...styles.dumaCard, marginBottom: '30px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Who You Follow ({selectedFollowing.length}/{followingList.length})</h3>
          {followingList.length === 0 ? (
            <p style={{ color: '#888', fontSize: '13px' }}>No people yet. Submit to the Duma to build your community!</p>
          ) : (
            <div style={{ maxHeight: '560px', overflowY: 'auto', paddingRight: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {followingList.map(person => (
                <div key={person} style={{ border: selectedFollowing.includes(person) ? '2px solid #222' : '1px solid #ddd', borderRadius: '8px', padding: '10px', backgroundColor: selectedFollowing.includes(person) ? '#f9f9f9' : '#fff', display: 'flex', flexDirection: 'column', gap: '8px' }}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#eee', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: avatarByUser[person] ? 'pointer' : 'default' }}
                      onClick={() => avatarByUser[person] && setActiveMedia({ url: normalizeMediaVideoUrl(avatarByUser[person]), type: /\.(mp4|mov|webm)$/i.test(avatarByUser[person]) || avatarByUser[person].includes('/video/upload/') ? 'video' : 'image' })}
                    >
                      {avatarByUser[person] ? (
                        /\.(mp4|mov|webm)$/i.test(avatarByUser[person]) || avatarByUser[person].includes('/video/upload/') ? (
                          <video src={normalizeMediaVideoUrl(avatarByUser[person])} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay loop muted playsInline />
                        ) : (
                          <img src={avatarByUser[person]} alt={person} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )
                      ) : (
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#444' }}>{person[0]?.toUpperCase() || '?'}</span>
                      )}
                    </div>

                    <div style={{ flex: 1, overflow: 'hidden' }}>
                       <div style={{ fontSize: '14px', fontWeight: selectedFollowing.includes(person) ? '700' : '600', color: '#222', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                          {nameByUser[person] || person.split('@')[0]}
                       </div>
                       <div style={{ fontSize: '12px', color: '#888', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                          {person}
                       </div>
                    </div>

                    <button
                      onClick={() => handleFollowingToggle(person)}
                      style={{ border: '1px solid #ddd', background: selectedFollowing.includes(person) ? '#eee' : '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', padding: '8px 16px' }}
                    >
                      {selectedFollowing.includes(person) ? 'Unfollow' : 'Follow'}
                    </button>
                  </div>

                  {avatarSlotsByUser[person] && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', marginTop: '6px' }}>
                      {avatarSlotsByUser[person].slice(0, 6).map((slotUrl, idx) => {
                        const isVideo = slotUrl && (/\.(mp4|mov|webm)$/i.test(slotUrl) || slotUrl.includes('/video/upload/'));
                        return (
                        <div
                          key={idx}
                          style={{ width: '100%', aspectRatio: '1/1', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f0f0f0', border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: slotUrl ? 'pointer' : 'default' }}
                          onClick={() => slotUrl && setActiveMedia({ url: normalizeMediaVideoUrl(slotUrl), type: isVideo ? 'video' : 'image' })}
                        >
                          {slotUrl ? (
                            isVideo ? (
                              <video src={normalizeMediaVideoUrl(slotUrl)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop playsInline />
                            ) : (
                              <img src={slotUrl} alt={`Slot ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )
                          ) : (
                             <span style={{ fontSize: '10px', color: '#ccc' }}>Empty</span>
                          )}
                        </div>
                      );
                      })}
                    </div>
                  )}

                </div>
              ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 style={{ marginBottom: '16px' }}>Perspectives Feed ({filteredItems.length})</h3>

          {filteredItems.length === 0 ? (
            <div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888' }}>
              No perspectives yet. Follow people from the Duma or share your own perspective!
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id || item._id} style={styles.dumaCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={styles.typeTag}>Perspective</span>
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
                {avatarSlotsByUser[item.submittedBy] && avatarSlotsByUser[item.submittedBy].some(url => url !== null) && (
                  <div style={{ display: 'flex', gap: '8px', margin: '8px 0 16px 0', overflowX: 'auto', paddingBottom: '4px' }}>
                    {avatarSlotsByUser[item.submittedBy].slice(0, 6).map((slotUrl, idx) => {
                      if (!slotUrl) return null;
                      const isVideo = /\.(mp4|mov|webm)$/i.test(slotUrl) || slotUrl.includes('/video/upload/');
                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveMedia({ url: normalizeMediaVideoUrl(slotUrl), type: isVideo ? 'video' : 'image' })}
                          style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#eee', flexShrink: 0, border: '1px solid #ddd', cursor: 'pointer' }}
                        >
                          {isVideo ? (
                            <video src={normalizeMediaVideoUrl(slotUrl)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop playsInline />
                          ) : (
                            <img src={slotUrl} alt={`Profile slot ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {item.location && (
                  <div style={{ fontSize: '11px', color: '#555', backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', marginBottom: '10px', alignItems: 'center', gap: '4px' }}>
                    📍 {item.location}
                  </div>
                )}
                <h4 style={{ marginTop: '12px', marginBottom: '8px', color: '#555' }}>Prompt: "{item.prompt || 'What makes a person beautiful?'}"</h4>
                <p style={{ color: '#222', fontSize: '14px', lineHeight: '1.6' }}>{item.response || item.reason || item.desc}</p>

                {(() => {
                  const mediaList = Array.isArray(item.mediaUrls) && item.mediaUrls.length > 0
                    ? item.mediaUrls
                    : item.mediaUrl ? [item.mediaUrl] : item.videoUrl ? [item.videoUrl] : [];

                  if (mediaList.length === 0) return null;

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: mediaList.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px', margin: '15px 0', background: '#fafafa', padding: '10px', borderRadius: '12px', border: '1px solid #eee' }}>
                      {mediaList.map((url, idx) => {
                        const isVideo = /\.(mp4|mov|hevc|webm)$/i.test(url) || url.includes('/video/upload/');
                        return (
                        <div key={idx} style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setActiveMedia({ url: normalizeMediaVideoUrl(url), type: isVideo ? 'video' : 'image' })}>
                          {isVideo ? (
                            <video
                              src={normalizeMediaVideoUrl(url)}
                              poster={url.includes('cloudinary.com') ? url.replace(/\.(mp4|mov|webm|hevc|m4v)$/i, '.jpg') : undefined}
                              style={{ width: '100%', maxHeight: '400px', borderRadius: '8px', backgroundColor: '#000', objectFit: 'contain' }}
                              playsInline preload="metadata"
                            />
                          ) : (
                            <img src={url} alt={`Attachment ${idx + 1}`} style={{ width: '100%', maxHeight: mediaList.length === 1 ? '400px' : '200px', borderRadius: '8px', objectFit: 'cover' }} />
                          )}
                        </div>
                      );
                      })}
                    </div>
                  );
                })()}
              </div>
            ))
          )}
        </div>
    </div>
  );
};
