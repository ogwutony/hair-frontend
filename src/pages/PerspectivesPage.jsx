// src/pages/PerspectivesPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CredentialHeader } from '../components/CredentialHeader';
import { MediaModal } from '../components/MediaModal';
import { RankBadge } from '../components/RankBadge';
import { BACKEND_URL } from '../utils/constants';
import { normalizeMediaVideoUrl } from '../utils/helpers';
import { styles } from '../utils/styles';

const getDirectMessagesStorageKey = (userEmail) => userEmail ? `perspectives_direct_messages_${userEmail.toLowerCase()}` : null;

const readStoredDirectMessages = (userEmail) => {
  const storageKey = getDirectMessagesStorageKey(userEmail);
  if (!storageKey) return {};

  try {
    const storedValue = window.localStorage.getItem(storageKey);
    return storedValue ? JSON.parse(storedValue) : {};
  } catch {
    return {};
  }
};

const writeStoredDirectMessages = (userEmail, messagesByUser) => {
  const storageKey = getDirectMessagesStorageKey(userEmail);
  if (!storageKey) return;

  try {
    const pendingMessagesOnly = Object.fromEntries(
      Object.entries(messagesByUser)
        .map(([personEmail, thread]) => [personEmail, (thread || []).filter(message => message?.pending)])
        .filter(([, thread]) => thread.length > 0)
    );
    window.localStorage.setItem(storageKey, JSON.stringify(pendingMessagesOnly));
  } catch {}
};

const getPersonEmail = (person) => {
  if (typeof person === 'string') return person;
  return person?.email || person?.username || '';
};

const getPersonLabel = (person, nameByUser = {}) => {
  const email = getPersonEmail(person);
  if (typeof person === 'object' && person?.displayName) return person.displayName;
  if (email && nameByUser[email]) return nameByUser[email];
  return email ? email.split('@')[0] : 'User';
};

const getMessageTime = (message) => {
  const rawValue = message?.sortKey || message?.timestamp || '';
  const parsedValue = rawValue ? new Date(rawValue).getTime() : NaN;
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const mergeDirectMessages = (primaryMessages = {}, secondaryMessages = {}) => {
  const merged = {};

  [...Object.keys(primaryMessages), ...Object.keys(secondaryMessages)].forEach(personEmail => {
    const seen = new Set();
    const thread = [...(primaryMessages[personEmail] || []), ...(secondaryMessages[personEmail] || [])].filter(message => {
      const key = JSON.stringify([
        message?.sender || '',
        message?.recipient || '',
        message?.text || '',
        message?.timestamp || ''
      ]);

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (thread.length > 0) {
      merged[personEmail] = [...thread].sort((a, b) => getMessageTime(a) - getMessageTime(b));
    }
  });

  return merged;
};

export const PerspectivesPage = ({ items, authToken, userEmail, rankTitle, rankScore, following = [], onFollowUser, onUnfollowUser, userAvatar }) => {
  const location = useLocation();
  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [selectedFollowing, setSelectedFollowing] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [allItems, setAllItems] = useState(items);
  const [followedAt, setFollowedAt] = useState({});
  const [avatarByUser, setAvatarByUser] = useState({});
  const [nameByUser, setNameByUser] = useState({});
  const [avatarSlotsByUser, setAvatarSlotsByUser] = useState({});
  const [activeMedia, setActiveMedia] = useState(null);
  const [openSection, setOpenSection] = useState(null);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [directMessages, setDirectMessages] = useState({});
  const [newMessageText, setNewMessageText] = useState({});

  useEffect(() => {
    if (Array.isArray(items)) {
      setAllItems(items);
    }
  }, [items]);

  useEffect(() => {
    if (!Array.isArray(following)) return;
    const normalizedFollowing = following.map(getPersonEmail).filter(Boolean);
    setSelectedFollowing(normalizedFollowing);
    setFollowedAt(prev => {
      const next = { ...prev };
      normalizedFollowing.forEach((person, idx) => {
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
      .catch(err => console.error('Failed to load perspectives:', err));
  }, []);

  useEffect(() => {
    setDirectMessages(readStoredDirectMessages(userEmail));
  }, [userEmail]);

  useEffect(() => {
    if (!authToken) return;

    fetch(`${BACKEND_URL}/api/profile`, {
      headers: { Authorization: 'Bearer ' + authToken }
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to load profile');
        return r.json();
      })
      .then(data => {
        setFollowersList(Array.isArray(data.followers) ? data.followers : []);

        if (Array.isArray(data.following)) {
          const normalizedFollowing = data.following.map(getPersonEmail).filter(Boolean);
          setSelectedFollowing(normalizedFollowing);
          setFollowedAt(prev => {
            const next = { ...prev };
            normalizedFollowing.forEach((person, idx) => {
              if (!next[person]) next[person] = idx + 1;
            });
            return next;
          });
        }

        const incomingMessages = [
          ...(Array.isArray(data.receivedMessages) ? data.receivedMessages : []),
          ...(Array.isArray(data.sentMessages) ? data.sentMessages : []),
          ...(Array.isArray(data.outgoingMessages) ? data.outgoingMessages : []),
          ...(Array.isArray(data.messages) ? data.messages : [])
        ];

        const profileMessages = {};
        incomingMessages.forEach(message => {
          if (!message || typeof message !== 'object') return;
          const sender = getPersonEmail(message.sender || message.from);
          const recipient = getPersonEmail(message.recipient || message.to) || userEmail;
          const counterpart = sender && sender.toLowerCase() === userEmail?.toLowerCase() ? recipient : sender;
          if (!counterpart || counterpart.toLowerCase() === userEmail?.toLowerCase()) return;
          profileMessages[counterpart] = [
            ...(profileMessages[counterpart] || []),
            {
              sender: sender || counterpart,
              recipient: recipient || userEmail,
              text: message.text || message.body || message.content || '',
              timestamp: message.timestamp || message.createdAt || message.updatedAt || '',
              sortKey: message.createdAt || message.updatedAt || message.timestamp || ''
            }
          ];
        });

        setDirectMessages(prev => {
          const next = mergeDirectMessages(profileMessages, prev);
          writeStoredDirectMessages(userEmail, next);
          return next;
        });
      })
      .catch(err => console.error('Failed to load profile context:', err));
  }, [authToken, userEmail]);

  useEffect(() => {
    const uniqueSubmitters = [...new Set(allItems.map(item => item.submittedBy))]
      .filter(Boolean)
      .filter(person => person !== userEmail);
    setFollowingList(uniqueSubmitters);

    const nextAvatarMap = {};
    const nextNameMap = {};
    const nextSlotsMap = {};

    allItems.forEach(item => {
      if (!item?.submittedBy) return;
      if (item.submitterAvatar) nextAvatarMap[item.submittedBy] = item.submitterAvatar;
      if (item.submitterDisplayName) nextNameMap[item.submittedBy] = item.submitterDisplayName;
      if (Array.isArray(item.submitterAvatarSlots) && item.submitterAvatarSlots.length > 0) {
        nextSlotsMap[item.submittedBy] = item.submitterAvatarSlots;
      }
    });

    setAvatarByUser(nextAvatarMap);
    setNameByUser(nextNameMap);
    setAvatarSlotsByUser(nextSlotsMap);
  }, [allItems, userEmail]);

  useEffect(() => {
    const perspectiveItems = allItems.filter(item => item.category === 'Culture' || item.type === 'Culture' || item.type === 'Video');
    const relevantItems = selectedFollowing.length === 0
      ? perspectiveItems
      : perspectiveItems.filter(item =>
          selectedFollowing.includes(item.submittedBy) ||
          (item.submittedBy && item.submittedBy.toLowerCase() === userEmail?.toLowerCase())
        );

    const sorted = [...relevantItems].sort((a, b) => {
      const aTime = new Date(a.createdAt || a.updatedAt || a.timestamp || 0).getTime() || 0;
      const bTime = new Date(b.createdAt || b.updatedAt || b.timestamp || 0).getTime() || 0;
      return bTime - aTime;
    });

    setFilteredItems(sorted);
  }, [selectedFollowing, allItems, followedAt, userEmail]);

  useEffect(() => {
    const person = new URLSearchParams(location.search).get('person');
    if (!person) return;
    setSelectedFollowing(prev => (prev.includes(person) ? prev : [...prev, person]));
    setFollowedAt(prev => (prev[person] ? prev : { ...prev, [person]: Date.now() }));
  }, [location.search]);

  const toggleSection = (sectionName) => {
    setOpenSection(prev => (prev === sectionName ? null : sectionName));
  };

  const openChat = (person) => {
    const personEmail = getPersonEmail(person);
    if (!personEmail) return;
    setActiveChatUser(personEmail);
    setOpenSection('directMessages');
  };

  const handleFollowingToggle = (person) => {
    if (selectedFollowing.includes(person)) {
      onUnfollowUser?.(person);
      setSelectedFollowing(prev => prev.filter(p => p !== person));
      setFollowedAt(prev => {
        const next = { ...prev };
        delete next[person];
        return next;
      });
      if (activeChatUser === person) setActiveChatUser(null);
    } else {
      onFollowUser?.(person);
      setSelectedFollowing(prev => [...prev, person]);
      setFollowedAt(prev => ({ ...prev, [person]: Date.now() }));
    }
  };

  const handleDeletePost = async (itemId) => {
    if (!authToken) return alert('Please log in to delete posts.');
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/duma/${itemId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + authToken }
      });
      if (response.ok) {
        setAllItems(prev => prev.filter(item => String(item._id || item.id) !== String(itemId)));
        setFilteredItems(prev => prev.filter(item => String(item._id || item.id) !== String(itemId)));
      } else {
        alert('Failed to delete post.');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete post.');
    }
  };

  const handleSendMessage = (recipientEmail) => {
    const text = newMessageText[recipientEmail]?.trim();
    if (!text) return;

    const nextMessage = {
      sender: userEmail,
      recipient: recipientEmail,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sortKey: new Date().toISOString(),
      pending: true
    };

    setDirectMessages(prev => {
      const next = {
        ...prev,
        [recipientEmail]: [...(prev[recipientEmail] || []), nextMessage]
      };
      writeStoredDirectMessages(userEmail, next);
      return next;
    });
    setNewMessageText(prev => ({ ...prev, [recipientEmail]: '' }));
  };

  const renderCommunityList = (people, emptyMessage, includeFollowAction = false) => {
    if (people.length === 0) {
      return <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>{emptyMessage}</p>;
    }

    return (
      <div style={{ display: 'grid', gap: '8px' }}>
        {people.map((person) => {
          const personEmail = getPersonEmail(person);
          if (!personEmail) return null;
          const isFollowing = selectedFollowing.includes(personEmail);

          return (
            <div key={personEmail} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '10px 12px', border: '1px solid #eee', borderRadius: '8px' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#222', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {getPersonLabel(person, nameByUser)}
                </div>
                <div style={{ fontSize: '12px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {personEmail}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {includeFollowAction && (
                  <button
                    type="button"
                    onClick={() => handleFollowingToggle(personEmail)}
                    style={{ border: '1px solid #ddd', background: isFollowing ? '#eee' : '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', padding: '8px 12px' }}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openChat(personEmail)}
                  style={{ border: '1px solid #222', background: '#fff', color: '#222', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', padding: '8px 12px' }}
                >
                  Message
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDirectMessages = () => {
    const conversationPeople = [...new Set([
      ...Object.keys(directMessages),
      ...(activeChatUser ? [activeChatUser] : [])
    ])].filter(Boolean);

    return (
      <div style={{ display: 'grid', gap: '12px' }}>
        {conversationPeople.length === 0 ? (
          <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Select someone from Followers or Following to start a direct message.</p>
        ) : (
          <div style={{ display: 'grid', gap: '8px' }}>
            {conversationPeople.map(personEmail => {
              const thread = directMessages[personEmail] || [];
              const latestMessage = thread[thread.length - 1];
              return (
                <button
                  key={personEmail}
                  type="button"
                  onClick={() => setActiveChatUser(personEmail)}
                  style={{ border: activeChatUser === personEmail ? '2px solid #222' : '1px solid #eee', background: '#fff', borderRadius: '8px', padding: '12px', textAlign: 'left', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#222' }}>{nameByUser[personEmail] || personEmail.split('@')[0]}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{personEmail}</div>
                  <div style={{ fontSize: '12px', color: '#555', marginTop: '6px' }}>{latestMessage?.text || 'Start a new conversation'}</div>
                  {latestMessage?.pending && <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>Pending sync</div>}
                </button>
              );
            })}
          </div>
        )}

        {activeChatUser && (
          <div style={{ border: '1px solid #eee', borderRadius: '10px', padding: '12px', background: '#fafafa' }}>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#222' }}>{nameByUser[activeChatUser] || activeChatUser.split('@')[0]}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{activeChatUser}</div>
            </div>
            <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'grid', gap: '8px', marginBottom: '10px' }}>
              {(directMessages[activeChatUser] || []).length === 0 ? (
                <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>No messages yet. Say hello.</p>
              ) : (
                (directMessages[activeChatUser] || []).map((message, index) => {
                  const isOwnMessage = message.sender?.toLowerCase() === userEmail?.toLowerCase();
                  return (
                    <div key={`${activeChatUser}-${index}`} style={{ alignSelf: isOwnMessage ? 'end' : 'start', background: isOwnMessage ? '#222' : '#fff', color: isOwnMessage ? '#fff' : '#222', borderRadius: '10px', padding: '10px 12px', maxWidth: '85%', border: isOwnMessage ? 'none' : '1px solid #eee' }}>
                      <div style={{ fontSize: '12px', lineHeight: '1.4' }}>{message.text}</div>
                      <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>{message.timestamp}</div>
                      {message.pending && <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>Pending sync</div>}
                    </div>
                  );
                })
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newMessageText[activeChatUser] || ''}
                onChange={(e) => setNewMessageText(prev => ({ ...prev, [activeChatUser]: e.target.value }))}
                placeholder={`Message ${nameByUser[activeChatUser] || activeChatUser.split('@')[0]}...`}
                style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' }}
              />
              <button
                type="button"
                onClick={() => handleSendMessage(activeChatUser)}
                style={{ border: 'none', background: '#222', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', padding: '10px 16px' }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
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

      <section style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '16px' }}>Community</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ ...styles.dumaCard, marginBottom: 0 }}>
            <button
              type="button"
              onClick={() => toggleSection('followers')}
              aria-expanded={openSection === 'followers'}
              aria-controls="perspectives-followers-panel"
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontSize: '16px', fontWeight: '600', color: '#222' }}
            >
              <span>Followers ({followersList.length})</span>
              <span style={{ fontSize: '18px', lineHeight: 1 }}>{openSection === 'followers' ? '▾' : '▸'}</span>
            </button>
            {openSection === 'followers' && (
              <div id="perspectives-followers-panel" style={{ marginTop: '12px' }}>
                {renderCommunityList(followersList, 'No followers yet.')}
              </div>
            )}
          </div>

          <div style={{ ...styles.dumaCard, marginBottom: 0 }}>
            <button
              type="button"
              onClick={() => toggleSection('following')}
              aria-expanded={openSection === 'following'}
              aria-controls="perspectives-following-panel"
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontSize: '16px', fontWeight: '600', color: '#222' }}
            >
              <span>Following ({selectedFollowing.length})</span>
              <span style={{ fontSize: '18px', lineHeight: 1 }}>{openSection === 'following' ? '▾' : '▸'}</span>
            </button>
            {openSection === 'following' && (
              <div id="perspectives-following-panel" style={{ marginTop: '12px' }}>
                {renderCommunityList(selectedFollowing, 'You are not following anyone yet.', true)}
              </div>
            )}
          </div>

          <div style={{ ...styles.dumaCard, marginBottom: 0 }}>
            <button
              type="button"
              onClick={() => toggleSection('directMessages')}
              aria-expanded={openSection === 'directMessages'}
              aria-controls="perspectives-direct-messages-panel"
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontSize: '16px', fontWeight: '600', color: '#222' }}
            >
              <span>Direct Messages</span>
              <span style={{ fontSize: '18px', lineHeight: 1 }}>{openSection === 'directMessages' ? '▾' : '▸'}</span>
            </button>
            {openSection === 'directMessages' && (
              <div id="perspectives-direct-messages-panel" style={{ marginTop: '12px' }}>
                {renderDirectMessages()}
              </div>
            )}
          </div>
        </div>
      </section>

      <div style={{ ...styles.dumaCard, marginBottom: '30px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Discover People ({selectedFollowing.length}/{followingList.length})</h3>
        {followingList.length === 0 ? (
          <p style={{ color: '#888', fontSize: '13px' }}>No people yet. Submit to the Duma to build your community!</p>
        ) : (
          <div style={{ maxHeight: '560px', overflowY: 'auto', paddingRight: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {followingList.map(person => {
                const isFollowing = selectedFollowing.includes(person);
                return (
                  <div key={person} style={{ border: isFollowing ? '2px solid #222' : '1px solid #ddd', borderRadius: '8px', padding: '10px', backgroundColor: isFollowing ? '#f9f9f9' : '#fff', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                        <div style={{ fontSize: '14px', fontWeight: isFollowing ? '700' : '600', color: '#222', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                          {nameByUser[person] || person.split('@')[0]}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                          {person}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => openChat(person)}
                          style={{ border: '1px solid #222', background: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', padding: '8px 12px' }}
                        >
                          Message
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFollowingToggle(person)}
                          style={{ border: '1px solid #ddd', background: isFollowing ? '#eee' : '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', padding: '8px 16px' }}
                        >
                          {isFollowing ? 'Unfollow' : 'Follow'}
                        </button>
                      </div>
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
                );
              })}
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
                              playsInline
                              preload="metadata"
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
      <Link
        to="/culture"
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#222',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          lineHeight: 1,
          textDecoration: 'none',
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}
        aria-label="Add perspective"
        title="Add perspective"
      >
        +
      </Link>
    </div>
  );
};
