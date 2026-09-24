// src/utils/messages.js
// Direct messages — same backend endpoints the mobile app uses:
//   GET  /api/messages/inbox                 → conversation list
//   GET  /api/messages/thread?with=<email|id> → messages with one person
//   POST /api/messages { toUserId, text }     → send (toUserId may be an email or user id)
// The backend has no "mark as read" endpoint yet, so "seen" is tracked in this browser.

import { BACKEND_URL } from './constants';

const SEEN_KEY = 'dm_seen_v1';

const authHeaders = (token) => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });

const readJson = async (res, fallbackError) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || fallbackError);
  return data;
};

export async function fetchInbox(token) {
  const res = await fetch(`${BACKEND_URL}/api/messages/inbox`, { headers: authHeaders(token) });
  const data = await readJson(res, 'Could not load messages');
  return Array.isArray(data) ? data : [];
}

export async function fetchThread(token, withUser) {
  const res = await fetch(`${BACKEND_URL}/api/messages/thread?with=${encodeURIComponent(withUser)}`, { headers: authHeaders(token) });
  const data = await readJson(res, 'Could not load this conversation');
  return Array.isArray(data) ? data : [];
}

export async function sendMessage(token, toUser, text) {
  const res = await fetch(`${BACKEND_URL}/api/messages`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ toUserId: toUser, text }),
  });
  return readJson(res, 'Message not sent');
}

// ── "Seen" tracking (per browser) ────────────────────────────────────────────
const readSeen = () => {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}') || {}; } catch { return {}; }
};

export function markThreadSeen(threadId, lastMessageAt) {
  if (!threadId) return;
  try {
    const seen = readSeen();
    seen[threadId] = new Date(lastMessageAt || Date.now()).getTime();
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  } catch {
    // storage unavailable — unread badges just won't clear across reloads
  }
}

export function isThreadUnread(thread) {
  if (!thread || !thread.unreadCount) return false;
  const seenAt = readSeen()[thread.id] || 0;
  return new Date(thread.lastMessageAt || 0).getTime() > seenAt;
}

export const countUnreadThreads = (threads) => (threads || []).filter(isThreadUnread).length;

export function formatMessageTime(value) {
  if (!value) return '';
  const d = new Date(value);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const diffDays = (now - d) / 86400000;
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/** Link that opens a conversation with someone on the Messages page. */
export const messageLink = (email, name) =>
  `/messages?with=${encodeURIComponent(email)}${name ? `&name=${encodeURIComponent(name)}` : ''}`;
