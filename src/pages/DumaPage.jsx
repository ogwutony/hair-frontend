// src/pages/DumaPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '../utils/useIsMobile';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { CredentialHeader, CredentialExtras } from '../components/CredentialHeader';
import { GuestSubmissionPrompt } from '../components/GuestSubmissionPrompt';
import { RankBadge } from '../components/RankBadge';
import { BACKEND_URL, PRODUCT_IMAGE_BY_NAME } from '../utils/constants';
import { getRankTitle, normalizeMediaVideoUrl } from '../utils/helpers';
import { styles } from '../utils/styles';
import { ContentActions } from '../components/ContentActions';
import { AddressLink } from '../components/AddressLink';
import { EditDumaPostModal } from '../components/EditDumaPostModal';
import { ImageLightbox, sizedImageUrl } from '../components/ImageLightbox';
import { useModeration } from '../utils/moderation';
import { EzoicAd, DUMA_AD_PLACEHOLDER_START, DUMA_AD_EVERY_N_POSTS, DUMA_AD_MAX_SLOTS } from '../components/EzoicAd';

const EMPTY_LIST = []; // stable default so effects keyed on it don't re-run every render

// Vote counts under either name: the backend stores yay/nay(/abstain); newer responses also send yes/no
const voteCount = (item, key) => {
const v = (item && item.votes) || {};
if (key === 'yes') return v.yes ?? v.yay ?? 0;
if (key === 'no') return v.no ?? v.nay ?? 0;
return v.abstain ?? 0;
};

const CommentImagePicker = ({ files, onChange, disabled }) => {
const [previewUrls, setPreviewUrls] = useState([]);

useEffect(() => {
const urls = files.map(file => URL.createObjectURL(file));
setPreviewUrls(urls);
return () => urls.forEach(url => URL.revokeObjectURL(url));
}, [files]);

const addFiles = (event) => {
const addedFiles = Array.from(event.target.files || []);
event.target.value = '';
if (files.length + addedFiles.length > 5) {
window.alert('You can attach up to 5 images.');
}
onChange([...files, ...addedFiles].slice(0, 5));
};

return (
<div>
<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={disabled} aria-label="Attach images" onChange={addFiles} />
{previewUrls.length > 0 && (
<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
{previewUrls.map((url, index) => (
<div key={`${files[index]?.name}-${index}`} style={{ position: 'relative' }}>
<img src={url} alt={`Comment attachment ${index + 1} preview`} style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '6px' }} />
<button type="button" aria-label={`Remove image ${index + 1}`} disabled={disabled} onClick={() => onChange(files.filter((_, fileIndex) => fileIndex !== index))} style={{ position: 'absolute', top: '2px', right: '2px', border: 'none', borderRadius: '50%', background: '#222', color: '#fff', width: '22px', height: '22px', cursor: 'pointer' }}>×</button>
</div>
))}
</div>
)}
</div>
);
};

export const DumaPage = ({ items, authToken, userEmail, rankTitle, rankScore, onAddPoints, userAvatar, following = EMPTY_LIST, onFollowUser }) => {
const isMobile = useIsMobile();
const [dumaItems, setDumaItems] = useState(items);
const [editingItem, setEditingItem] = useState(null);
const [lightbox, setLightbox] = useState(null); // { photos, index }
const openLightbox = (mediaList, url) => {
const photos = mediaList.filter(u => !(/\.(mp4|mov|webm)$/i.test(u) || u.includes('/video/upload/')));
setLightbox({ photos, index: Math.max(0, photos.indexOf(url)) });
};
const handlePostEdited = (updated) => {
const id = getItemId(updated) || getItemId(editingItem);
setDumaItems(prev => prev.map(it => (getItemId(it) === id ? { ...it, ...updated } : it)));
setEditingItem(null);
};
const { isHiddenItem } = useModeration();
const [userVotes, setUserVotes] = useState({});
const [showScores, setShowScores] = useState({});
const [comments, setComments] = useState({});
const [commentText, setCommentText] = useState({});
const [commentImages, setCommentImages] = useState({});
const [commentSubmitting, setCommentSubmitting] = useState({});
const [activeSection, setActiveSection] = useState("Culture");
const [marketplaceListings, setMarketplaceListings] = useState([]);
const [boostingId, setBoostingId] = useState(null);
const [socialFeedLoaded, setSocialFeedLoaded] = useState(false);
const [socialFeedUnavailable, setSocialFeedUnavailable] = useState(false);
const socialFeedFallbackLocked = useRef(false);
const socialFeedUrl = process.env.REACT_APP_SOCIAL_FEED_URL;
const getRecommendationImage = (item) => item.imageUrl || PRODUCT_IMAGE_BY_NAME[item.name] || PRODUCT_IMAGE_BY_NAME[item.product] || null;
const getItemId = (itemOrId) => String(typeof itemOrId === 'object' ? itemOrId?._id || itemOrId?.id || '' : itemOrId || '');

const isFeaturedContributor = (item) =>
item.featuredOnInstagram || item.socialEngagement >= 100 || voteCount(item, 'yes') >= 10;

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

useEffect(() => {
if (!socialFeedUrl) return undefined;
socialFeedFallbackLocked.current = false;
setSocialFeedLoaded(false);
setSocialFeedUnavailable(false);
const fallbackTimer = window.setTimeout(() => {
socialFeedFallbackLocked.current = true;
setSocialFeedUnavailable(true);
}, 5000);
return () => window.clearTimeout(fallbackTimer);
}, [socialFeedUrl]);

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

useEffect(() => {
if (!authToken) { setUserVotes({}); return undefined; }
let cancelled = false;
fetch(`${BACKEND_URL}/api/duma/votes/mine`, { headers: { Authorization: 'Bearer ' + authToken } })
.then(r => (r.ok ? r.json() : null))
.then(data => {
if (cancelled || !data || typeof data.votes !== 'object') return;
setUserVotes(prev => ({ ...data.votes, ...prev }));
setShowScores(prev => ({ ...Object.fromEntries(Object.keys(data.votes).map(id => [id, true])), ...prev }));
})
.catch(() => {});
return () => { cancelled = true; };
}, [authToken]);

const handleVote = async (itemId, voteType) => {
const normalizedItemId = getItemId(itemId);
if (!authToken) return alert("Please log in to vote.");
if (userVotes[normalizedItemId]) return;

setUserVotes(prev => ({ ...prev, [normalizedItemId]: voteType }));
setShowScores(prev => ({ ...prev, [normalizedItemId]: true }));
setDumaItems(prev => prev.map(item => {
if (getItemId(item) !== normalizedItemId) return item;
const counts = { yes: voteCount(item, 'yes'), no: voteCount(item, 'no'), abstain: voteCount(item, 'abstain') };
return {
...item,
votes: { ...(item.votes || {}), ...counts, [voteType]: counts[voteType] + 1 }
};
}));
try {
const response = await fetch(`${BACKEND_URL}/api/duma/${normalizedItemId}/vote`, {
method: 'POST',
headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + authToken },
body: JSON.stringify({ vote: voteType })
});
if (response.ok) {
const data = await response.json();
if (data.votes) {
setDumaItems(prev => prev.map(item => getItemId(item) === normalizedItemId ? { ...item, votes: data.votes } : item));
}
if (voteType === 'yes' && onAddPoints) onAddPoints(10);
return;
}
if (response.status === 409) {
const data = await response.json().catch(() => ({}));
setUserVotes(prev => ({ ...prev, [normalizedItemId]: data.yourVote || voteType }));
if (data.votes) {
setDumaItems(prev => prev.map(item => getItemId(item) === normalizedItemId ? { ...item, votes: data.votes } : item));
}
return;
}
throw new Error('Vote request failed');
} catch (err) {
console.error("Voting failed:", err);
setUserVotes(prev => {
const next = { ...prev };
delete next[normalizedItemId];
return next;
});
setShowScores(prev => {
const next = { ...prev };
delete next[normalizedItemId];
return next;
});
setDumaItems(prev => prev.map(item => {
if (getItemId(item) !== normalizedItemId) return item;
const existingVotes = item.votes || { yes: 0, no: 0, abstain: 0 };
return {
...item,
votes: {
...existingVotes,
[voteType]: Math.max((existingVotes[voteType] || 1) - 1, 0)
}
};
}));
}
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

const handleCommentSubmit = async (item, itemId) => {
const text = (commentText[itemId] || '').trim();
const images = commentImages[itemId] || EMPTY_LIST;
if (!authToken || !userEmail || (!text && images.length === 0) || commentSubmitting[itemId]) return;

const formData = new FormData();
formData.append('text', text);
images.forEach(image => formData.append('images', image));
setCommentSubmitting(prev => ({ ...prev, [itemId]: true }));
try {
const response = await fetch(`${BACKEND_URL}/api/posts/${encodeURIComponent(itemId)}/comments`, {
method: 'POST',
headers: { Authorization: 'Bearer ' + authToken },
body: formData
});
const data = await response.json().catch(() => ({}));
if (!response.ok) throw new Error(data.error || 'Failed to post comment.');
if (!data.comment) throw new Error('The comment response was invalid.');

setComments(prev => ({
...prev,
[itemId]: [...(prev[itemId] || item.comments || []), data.comment]
}));
setCommentText(prev => ({ ...prev, [itemId]: '' }));
setCommentImages(prev => ({ ...prev, [itemId]: [] }));
} catch (error) {
window.alert(error.message || 'Failed to post comment.');
} finally {
setCommentSubmitting(prev => ({ ...prev, [itemId]: false }));
}
};

const renderCommentSection = (item, itemId) => {
const itemComments = comments[itemId] || item.comments || [];
const images = commentImages[itemId] || [];
const text = commentText[itemId] || '';
const isSubmitting = !!commentSubmitting[itemId];

return (
<div style={{ borderTop: '2px solid #eee', paddingTop: '12px', marginTop: '14px' }}>
<h4 style={{ fontSize: '13px', color: '#555', margin: '0 0 12px', fontWeight: '700' }}>Comments ({itemComments.length})</h4>
{itemComments.map((comment, index) => (
<div key={comment._id || index} style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px', marginBottom: '8px', borderLeft: '3px solid #3498db' }}>
<p style={{ fontSize: '11px', fontWeight: '600', color: '#222', margin: '0 0 4px' }}>{comment.author}</p>
{comment.text && <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px', whiteSpace: 'pre-wrap' }}>{comment.text}</p>}
{comment.imageUrls?.length > 0 && (
<div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '6px 0' }}>
{comment.imageUrls.map((url, imageIndex) => <img key={url + imageIndex} src={url} alt={`Comment attachment ${imageIndex + 1}`} loading="lazy" style={{ maxWidth: '180px', maxHeight: '180px', objectFit: 'cover', borderRadius: '6px' }} />)}
</div>
)}
<p style={{ fontSize: '10px', color: '#aaa', margin: 0 }}>{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : comment.timestamp}</p>
</div>
))}
{authToken && userEmail ? (
<div>
<div style={{ display: 'flex', gap: '8px' }}>
<input type="text" aria-label="Comment text" placeholder="Add a comment..." style={{ flex: 1, minWidth: 0, padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px' }} value={text} disabled={isSubmitting} onChange={event => setCommentText(prev => ({ ...prev, [itemId]: event.target.value }))} />
<button type="button" disabled={isSubmitting || (!text.trim() && images.length === 0)} onClick={() => handleCommentSubmit(item, itemId)} style={{ padding: '8px 16px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '6px', cursor: isSubmitting ? 'wait' : 'pointer', fontSize: '12px', fontWeight: '600', opacity: isSubmitting || (!text.trim() && images.length === 0) ? 0.6 : 1 }}>{isSubmitting ? 'Posting…' : 'Post'}</button>
</div>
<div style={{ marginTop: '8px' }}>
<CommentImagePicker files={images} disabled={isSubmitting} onChange={nextImages => setCommentImages(prev => ({ ...prev, [itemId]: nextImages }))} />
</div>
</div>
) : (
<p style={{ margin: '10px 0 0', fontSize: '12px', color: '#666' }}>
<Link to="/login" style={{ color: '#1f4f99', fontWeight: 600 }}>Log in</Link> or <Link to="/signup" style={{ color: '#1f4f99', fontWeight: 600 }}>register</Link> to post a comment.
</p>
)}
</div>
);
};

// Hide posts you reported and posts from people you blocked
const visibleItems = dumaItems.filter(item => !isHiddenItem(item));
const culturalItems = visibleItems.filter(item => item.section === "Cultural" || item.category === "Culture" || item.type === "Video" || item.type === "Culture");
const recommendationItems = visibleItems.filter(item => item.type === "Product Recommendation" || item.type === "Recommendation");
const partnerItems = visibleItems.filter(item => item.type === "Partner");
const marketplaceItems = marketplaceListings.filter(item => !isHiddenItem(item));

return (
<div style={{ padding: isMobile ? '25px 16px' : '40px 60px', maxWidth: '1100px', margin: '0 auto', flex: '1 1 auto', minWidth: 0 }}>
<Helmet>
<title>The Duma | The Majorities</title>
<meta name="description" content="The Majorities Duma — explore culture, recommendations, and perspectives from our community." />
<link rel="canonical" href="https://themajorities.com/duma" />
</Helmet>
{socialFeedUrl && (
<section style={{ marginBottom: '30px', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }} aria-label="Live #TheMajorities social feed">
{!socialFeedLoaded && !socialFeedUnavailable && (
<div style={{ padding: '24px', textAlign: 'center', color: '#666', backgroundColor: '#fafafa' }}>
Loading the live social feed...
</div>
)}
{socialFeedUnavailable ? (
<div style={{ padding: '24px', textAlign: 'center', color: '#666', backgroundColor: '#fafafa' }}>
The live social feed is unavailable right now.
</div>
) : (
<iframe title="Live #TheMajorities social feed" src={socialFeedUrl} style={{ display: socialFeedLoaded ? 'block' : 'none', width: '100%', minHeight: '420px', border: 0 }} loading="lazy" onLoad={() => {
if (socialFeedFallbackLocked.current) return;
setSocialFeedLoaded(true);
setSocialFeedUnavailable(false);
}} />
)}
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
culturalItems.map((item, index) => {
const itemId = item._id || item.id;
const adSlotIndex = Math.floor((index + 1) / DUMA_AD_EVERY_N_POSTS) - 1;
const showAdAfter = (index + 1) % DUMA_AD_EVERY_N_POSTS === 0 && index + 1 < culturalItems.length && adSlotIndex < DUMA_AD_MAX_SLOTS;
// Dynamically recalculate rank badge from stored score to always reflect correct tier
const verifiedRank = item.rankScore ? getRankTitle(item.rankScore) : (item.submitterRank || "Comrade");

return (
<React.Fragment key={itemId}>
<div style={styles.dumaCard}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '8px', marginLeft: 'auto' }}>
{isFeaturedContributor(item) && <span style={{ background: '#f4d35e', color: '#222', borderRadius: '999px', padding: '4px 8px', fontSize: '10px', fontWeight: '800' }}>★ Featured on The Duma</span>}
<RankBadge rankTitle={verifiedRank} />
<CredentialExtras rankScore={item.rankScore || null} socialLinks={item.submitterSocialLinks || null} />
<ContentActions variant="menu" contentId={String(item._id || item.id || '')} contentType="duma" authorEmail={item.submittedBy} authorName={item.submitterDisplayName} authToken={authToken} userEmail={userEmail} onEdit={() => setEditingItem(item)} onDelete={() => handleDeletePost(item._id || item.id)} showMessage onAddUser={item.submittedBy && !following.includes(item.submittedBy) ? onFollowUser : undefined} />
</div>
</div>

{item.submittedBy && (
<CredentialHeader
email={item.submittedBy}
displayName={item.submitterDisplayName || null}
rankTitle={verifiedRank}
rankScore={null}
avatarUrl={item.submitterAvatar || null}
socialLinks={null}
showRank={false}
profileLink={`/perspectives?person=${encodeURIComponent(item.submittedBy)}`}
/>
)}

{item.location && (
<div style={{ fontSize: '11px', color: '#555', backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', marginBottom: '10px', alignItems: 'center', gap: '4px' }}>
<AddressLink address={item.location} showPin />
</div>
)}

<h4 style={{ marginTop: '12px', marginBottom: '8px', color: '#555' }}>Prompt: "{item.prompt || 'What makes a person beautiful?'}"</h4>
<p style={{ color: '#222', fontSize: '14px', lineHeight: '1.6', marginBottom: '14px' }}>{item.response || item.reason || item.desc}</p>
{/^[a-f0-9]{24}$/i.test(String(itemId || '')) && (
<Link to={`/duma/${itemId}`} style={{ display: 'inline-block', fontSize: '12px', fontWeight: 600, color: '#1f4f99', marginBottom: '14px' }}>Read full perspective →</Link>
)}
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
poster={url.includes('cloudinary.com') ? sizedImageUrl(url.replace(/\.(mp4|mov|webm|m4v)$/i, '.jpg'), 1080) : undefined}
style={{ width: '100%', maxHeight: '400px', borderRadius: '8px', backgroundColor: '#000', objectFit: 'contain' }}
controls playsInline preload="metadata"
/>
) : (
<img
src={sizedImageUrl(url, 1080)}
alt={`Attachment ${idx + 1}`}
title="Double-click to enlarge"
tabIndex={0}
loading="lazy"
onDoubleClick={() => openLightbox(mediaList, url)}
onKeyDown={(e) => { if (e.key === 'Enter') openLightbox(mediaList, url); }}
style={{ width: '100%', maxHeight: mediaList.length === 1 ? '400px' : '200px', borderRadius: '8px', objectFit: 'cover', cursor: 'zoom-in' }}
onError={(e) => {
 // Resized copy failed: try the original once, then the placeholder
 if (!e.currentTarget.dataset.triedOriginal) { e.currentTarget.dataset.triedOriginal = '1'; e.currentTarget.src = url; return; }
 e.currentTarget.onerror = null;
 e.currentTarget.src = '/logo192.png';
 }} />
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
Yes: {voteCount(item, 'yes')} | No: {voteCount(item, 'no')} | Abstain: {voteCount(item, 'abstain')}
</p>
</div>
)}

</div>
)}
{renderCommentSection(item, itemId)}
</div>
{showAdAfter && <EzoicAd placeholderId={DUMA_AD_PLACEHOLDER_START + adSlotIndex} />}
</React.Fragment>
);
})
)}
</div>
)}

{activeSection === "Recommendations" && (
<div>
{!authToken && <GuestSubmissionPrompt message="Anyone can read the Duma. Log in or register to vote, recommend products, and share your perspective." />}
{recommendationItems.length === 0 ? (
<div style={{ ...styles.dumaCard, textAlign: 'center', color: '#888' }}>No product recommendations yet. Be the first to recommend a product!</div>
) : (
recommendationItems.map(item => (
<div key={item.id || item._id} style={styles.dumaCard}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
<span style={styles.typeTag}>{item.type}</span>
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
{item.submitterRank && <RankBadge rankTitle={item.submitterRank} />}
<CredentialExtras rankScore={null} socialLinks={item.submitterSocialLinks || null} />
<ContentActions variant="menu" contentId={String(item._id || item.id || '')} contentType="duma" authorEmail={item.submittedBy} authorName={item.submitterDisplayName} authToken={authToken} userEmail={userEmail} onEdit={() => setEditingItem(item)} onDelete={() => handleDeletePost(item._id || item.id)} showMessage onAddUser={item.submittedBy && !following.includes(item.submittedBy) ? onFollowUser : undefined} />
</div>
</div>
{item.submittedBy && <CredentialHeader email={item.submittedBy} displayName={item.submitterDisplayName || null} rankTitle={item.submitterRank || 'Comrade'} rankScore={null} avatarUrl={item.submitterAvatar || null} socialLinks={null} showRank={!item.submitterRank} profileLink={`/perspectives?person=${encodeURIComponent(item.submittedBy)}`} />}
{item.location && (
<div style={{ fontSize: '11px', color: '#555', backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', marginBottom: '10px', alignItems: 'center', gap: '4px' }}>
<AddressLink address={item.location} showPin />
</div>
)}
<h3 style={{ marginTop: '8px', marginBottom: '6px' }}>{item.name || item.product}{(item.brand || item.company) ? ` by ${item.brand || item.company}` : ''}</h3>
{getRecommendationImage(item) && (
<img
src={getRecommendationImage(item)}
alt={item.name || item.product}
style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', borderRadius: '12px', marginBottom: '12px', background: '#f8f8f8' }}
onError={(e) => {
e.currentTarget.onerror = null;
e.currentTarget.src = '/logo192.png';
}}
/>
)}
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
Yes: {voteCount(item, 'yes')} | No: {voteCount(item, 'no')} | Abstain: {voteCount(item, 'abstain')}
</p>
</div>
)}

</div>
)}
{renderCommentSection(item, item.id || item._id)}
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
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
<span style={styles.typeTag}>{item.type}</span>
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
{item.submitterRank && <RankBadge rankTitle={item.submitterRank} />}
<CredentialExtras rankScore={null} socialLinks={item.submitterSocialLinks || null} />
<ContentActions variant="menu" contentId={String(item._id || item.id || '')} contentType="duma" authorEmail={item.submittedBy} authorName={item.submitterDisplayName} authToken={authToken} userEmail={userEmail} onDelete={() => handleDeletePost(item._id || item.id)} showMessage onAddUser={item.submittedBy && !following.includes(item.submittedBy) ? onFollowUser : undefined} />
</div>
</div>
{item.submittedBy && <CredentialHeader email={item.submittedBy} displayName={item.submitterDisplayName || null} rankTitle={item.submitterRank || 'Comrade'} rankScore={null} avatarUrl={item.submitterAvatar || null} socialLinks={null} showRank={!item.submitterRank} profileLink={`/perspectives?person=${encodeURIComponent(item.submittedBy)}`} />}
{item.location && (
<div style={{ fontSize: '11px', color: '#555', backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', marginBottom: '10px', alignItems: 'center', gap: '4px' }}>
<AddressLink address={item.location} showPin />
</div>
)}

<h3 style={{ marginTop: '12px', marginBottom: '12px' }}>{item.desc || item.partnerCategory || item.productType} - {item.company}</h3>

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
<strong>MOQ:</strong> 200 units (3.4 oz)
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
Yes: {voteCount(item, 'yes')} | No: {voteCount(item, 'no')} | Abstain: {voteCount(item, 'abstain')}
</p>
</div>
)}

</div>
)}
{renderCommentSection(item, item.id || item._id)}
</div>
))
)}
</div>
)}

{activeSection === "Marketplace" && (
<div>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
<h3 style={{ margin: 0 }}>Marketplace</h3>
</div>
{!authToken && <GuestSubmissionPrompt message="Log in or register to sell in the Marketplace." />}
{marketplaceItems.length === 0 ? (
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
{item.submittedBy && <div style={{ marginTop: '12px' }}><CredentialHeader email={item.submittedBy} displayName={null} rankTitle={item.submitterRank || 'Comrade'} rankScore={null} avatarUrl={null} socialLinks={null} profileLink={`/perspectives?person=${encodeURIComponent(item.submittedBy)}`} /></div>}
<div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
{item.externalLink && (
<a href={item.externalLink} target="_blank" rel="noopener noreferrer" style={{ ...styles.authButton, width: 'auto', padding: '10px 20px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', background: '#fff', color: '#222', border: '1px solid #222' }}>
Visit listing
</a>
)}
{!isOwner && <ContentActions contentId={String(item._id || item.id || '')} contentType="marketplace" authorEmail={item.submittedBy} authorName={item.submitterDisplayName} authToken={authToken} userEmail={userEmail} />}
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
<ImageLightbox
photos={lightbox ? lightbox.photos : []}
index={lightbox ? lightbox.index : null}
onIndexChange={(i) => setLightbox(prev => (prev ? { ...prev, index: i } : prev))}
onClose={() => setLightbox(null)}
/>
{editingItem && (
<EditDumaPostModal item={editingItem} authToken={authToken} onClose={() => setEditingItem(null)} onSaved={handlePostEdited} />
)}
</div>
);
};
