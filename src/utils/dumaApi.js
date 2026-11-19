// src/utils/dumaApi.js
import { BACKEND_URL } from './constants';
import { fetchWithWakeRetry } from './backendFetch';

// Only posts the server has stored (Mongo ObjectIds) can take comments, votes, edits or deletes.
export const isPersistedDumaId = (id) => /^[a-f0-9]{24}$/i.test(String(id || ''));

// Saves a culture post and returns the stored item. Throws with a readable message when the
// server did not save it, so callers never show "shared" for a post that only exists locally.
export const submitCulturePost = async (authToken, payload) => {
  if (!authToken) throw new Error('Please log in to share a post.');
  let res;
  try {
    res = await fetch(`${BACKEND_URL}/api/duma/culture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("We couldn't reach the server, so your post was not saved. Please check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 || res.status === 403) throw new Error('Your session has expired. Please log in again to share your post.');
  if (!res.ok) throw new Error(data.error || `Your post was not saved (${res.status}). Please try again.`);
  const item = data.item || data.post || data;
  if (!item || !isPersistedDumaId(item._id || item.id)) throw new Error('The server did not confirm your post was saved. Please refresh and try again.');
  return item;
};

// Feed failures must never be treated as a successfully loaded empty category.
// Cold starts are retried by fetchWithWakeRetry; onSlow() fires if the server is slow to wake.
export const fetchDumaFeed = async (path, { authToken, signal, onSlow, ...retryOptions } = {}) => {
  const response = await fetchWithWakeRetry(`${BACKEND_URL}${path}`, {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
  }, { signal, onSlow, ...retryOptions });
  if (!response.ok) throw new Error(`The feed could not be loaded (${response.status}). Please try again.`);
  const data = await response.json().catch(() => null);
  if (!Array.isArray(data)) throw new Error('The server returned an invalid feed. Please try again.');
  return data;
};
