// src/utils/moderation.js
// Community safety tools for the website:
//   • report objectionable posts, listings and users
//   • block users (their content disappears for you immediately)
//   • Terms of Use acceptance (zero tolerance for objectionable content)
//   • permanent account deletion
// Blocked users and reported items are cached in this browser so the feed
// updates instantly, and synced to the backend so they follow the account.

import { useEffect, useState } from 'react';
import { BACKEND_URL } from './constants';

export const TERMS_VERSION = '2026-09-23';
export const SUPPORT_EMAIL = 'OgwuTony@themajorities.com';

export const REPORT_REASONS = [
  'Spam or scam',
  'Harassment or bullying',
  'Hate speech or symbols',
  'Nudity or sexual content',
  'Violence or dangerous acts',
  'False or misleading',
  'Something else',
];

const BLOCKED_KEY = 'moderation_blocked_v1';
const HIDDEN_KEY = 'moderation_hidden_v1';
const termsKey = (email) => `terms_accepted_${TERMS_VERSION}_${normalize(email)}`;

const normalize = (value) => String(value || '').trim().toLowerCase();

const readList = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

let state = { blocked: readList(BLOCKED_KEY), hidden: readList(HIDDEN_KEY) };
const listeners = new Set();

const setState = (next) => {
  state = next;
  try {
    localStorage.setItem(BLOCKED_KEY, JSON.stringify(state.blocked));
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(state.hidden));
  } catch {
    // storage full or disabled — in-memory state still works for this visit
  }
  listeners.forEach((listener) => listener(state));
};

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// ── Block ─────────────────────────────────────────────────────────────────────

export async function syncBlockedFromServer(token) {
  if (!token) return;
  try {
    const res = await fetch(`${BACKEND_URL}/api/users/blocked`, { headers: authHeaders(token) });
    if (!res.ok) return;
    const data = await res.json();
    const server = Array.isArray(data?.blocked) ? data.blocked.map(normalize) : [];
    setState({ ...state, blocked: Array.from(new Set([...state.blocked, ...server])).filter(Boolean) });
  } catch {
    // offline — keep the local list
  }
}

export async function blockUser(token, target) {
  const key = normalize(target);
  if (!key) return;
  if (!state.blocked.includes(key)) setState({ ...state, blocked: [...state.blocked, key] });
  if (!token) return;
  try {
    await fetch(`${BACKEND_URL}/api/users/block`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ target: key }),
    });
  } catch {
    // the local block still applies
  }
}

export async function unblockUser(token, target) {
  const key = normalize(target);
  setState({ ...state, blocked: state.blocked.filter((b) => b !== key) });
  if (!token) return;
  try {
    await fetch(`${BACKEND_URL}/api/users/unblock`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ target: key }),
    });
  } catch {
    // ignore — local state already updated
  }
}

// ── Report ────────────────────────────────────────────────────────────────────

/** Sends a report and hides the item for this user. Returns true when the server accepted it. */
export async function reportContent(token, { contentType, contentId, reportedUser, reason, details }) {
  const id = String(contentId || '');
  if (id && contentType !== 'user' && !state.hidden.includes(id)) {
    setState({ ...state, hidden: [...state.hidden, id] });
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/report`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ contentType, contentId: id, reportedUser: normalize(reportedUser), reason, details }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Terms of Use ──────────────────────────────────────────────────────────────

export function hasAcceptedTerms(email) {
  if (!email) return false;
  try {
    return localStorage.getItem(termsKey(email)) === 'true';
  } catch {
    return false;
  }
}

export async function markTermsAccepted(email, token) {
  try {
    if (email) localStorage.setItem(termsKey(email), 'true');
  } catch {
    // ignore
  }
  if (!token) return;
  try {
    await fetch(`${BACKEND_URL}/api/terms/accept`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ version: TERMS_VERSION }),
    });
  } catch {
    // stored locally; server copy is best-effort
  }
}

// ── Account deletion ──────────────────────────────────────────────────────────

/** Permanently deletes the signed-in account. Throws an Error with a readable message on failure. */
export async function deleteAccountRequest(token) {
  if (!token) throw new Error('Please log in again, then retry.');
  let res;
  try {
    res = await fetch(`${BACKEND_URL}/api/account`, { method: 'DELETE', headers: authHeaders(token) });
  } catch {
    throw new Error(`We couldn't reach the server. Please try again, or email ${SUPPORT_EMAIL}.`);
  }
  if (!res.ok) {
    let message = `Account deletion failed. Please try again or email ${SUPPORT_EMAIL}.`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }
}

/** Clears this browser's moderation cache (on logout / account deletion). */
export function clearModerationData() {
  setState({ blocked: [], hidden: [] });
}

// ── React hook ────────────────────────────────────────────────────────────────

export function useModeration() {
  const [snapshot, setSnapshot] = useState(state);

  useEffect(() => {
    listeners.add(setSnapshot);
    setSnapshot(state);
    return () => listeners.delete(setSnapshot);
  }, []);

  const isBlocked = (who) => {
    const key = normalize(who);
    return !!key && snapshot.blocked.includes(key);
  };

  const isHiddenItem = (item) => {
    if (!item) return false;
    const id = String(item._id || item.id || '');
    if (id && snapshot.hidden.includes(id)) return true;
    return isBlocked(item.submittedBy) || isBlocked(item.submitterId);
  };

  return { blocked: snapshot.blocked, hidden: snapshot.hidden, isBlocked, isHiddenItem };
}
