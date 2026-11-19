// src/utils/backendFetch.js
// The backend (Render) can be asleep and take 30-60s to wake up. fetchWithWakeRetry gives
// each attempt its own timeout and retries timeouts, network errors and 5xx/429 responses
// with a short backoff, so a cold start reads as "waking up" instead of a broken page.

export const ATTEMPT_TIMEOUT_MS = 30000;
export const MAX_ATTEMPTS = 3;
export const SLOW_AFTER_MS = 6000;

export class BackendUnavailableError extends Error {}

const wait = (ms, signal) => new Promise((resolve, reject) => {
  if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
  const onAbort = () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); };
  const timer = setTimeout(() => { signal?.removeEventListener('abort', onAbort); resolve(); }, ms);
  signal?.addEventListener('abort', onAbort, { once: true });
});

const fetchOnce = async (url, init, { signal, timeoutMs }) => {
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abort);
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try {
    let response;
    try {
      response = await fetch(url, { ...init, signal: controller.signal });
    } catch (err) {
      if (signal?.aborted) throw err;
      throw new BackendUnavailableError(timedOut ? 'The server took too long to respond.' : "We couldn't reach the server.");
    }
    if (response.status >= 500 || response.status === 429) {
      throw new BackendUnavailableError(`The server is having trouble right now (${response.status}).`);
    }
    return response;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
};

// Resolves with the Response for any non-5xx status (callers handle 4xx themselves).
// Throws BackendUnavailableError once every attempt failed, or AbortError if `signal` aborts.
// onSlow() fires once if nothing has come back after slowAfterMs.
export const fetchWithWakeRetry = async (url, init = {}, {
  signal, onSlow,
  timeoutMs = ATTEMPT_TIMEOUT_MS, maxAttempts = MAX_ATTEMPTS, slowAfterMs = SLOW_AFTER_MS,
} = {}) => {
  const slowTimer = onSlow ? setTimeout(() => { if (!signal?.aborted) onSlow(); }, slowAfterMs) : null;
  try {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await fetchOnce(url, init, { signal, timeoutMs });
      } catch (err) {
        if (!(err instanceof BackendUnavailableError) || signal?.aborted) throw err;
        lastError = err;
        if (attempt < maxAttempts) await wait(Math.min(2000 * attempt, 5000), signal);
      }
    }
    throw new BackendUnavailableError(`${lastError.message} Please try again in a moment.`);
  } finally {
    if (slowTimer) clearTimeout(slowTimer);
  }
};
