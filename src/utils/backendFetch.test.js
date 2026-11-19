import { fetchWithWakeRetry, BackendUnavailableError } from './backendFetch';
import { fetchDumaFeed } from './dumaApi';

const ok = (body, status = 200) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });
const fast = { timeoutMs: 50, slowAfterMs: 10 };

beforeEach(() => { global.fetch = jest.fn(); });
afterEach(() => { jest.restoreAllMocks(); });

test('retries a 503 from a waking server and then succeeds', async () => {
  global.fetch.mockReturnValueOnce(ok({}, 503)).mockReturnValueOnce(ok([{ _id: 'a' }]));
  const res = await fetchWithWakeRetry('/x', {}, { ...fast, maxAttempts: 3 });
  expect(res.status).toBe(200);
  expect(global.fetch).toHaveBeenCalledTimes(2);
}, 10000);

test('retries network errors and gives up with a readable error', async () => {
  global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
  await expect(fetchWithWakeRetry('/x', {}, { ...fast, maxAttempts: 2 })).rejects.toBeInstanceOf(BackendUnavailableError);
  expect(global.fetch).toHaveBeenCalledTimes(2);
}, 10000);

test('times out a hung request and retries it', async () => {
  global.fetch
    .mockImplementationOnce((url, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))))
    .mockReturnValueOnce(ok([]));
  const res = await fetchWithWakeRetry('/x', {}, { ...fast, maxAttempts: 2 });
  expect(res.status).toBe(200);
}, 10000);

test('does not retry 4xx responses', async () => {
  global.fetch.mockReturnValue(ok({}, 401));
  const res = await fetchWithWakeRetry('/x', {}, fast);
  expect(res.status).toBe(401);
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('calls onSlow while the server is slow', async () => {
  const onSlow = jest.fn();
  global.fetch.mockImplementation(() => new Promise(r => setTimeout(() => r({ ok: true, status: 200, json: () => Promise.resolve([]) }), 40)));
  await fetchDumaFeed('/api/duma', { onSlow, ...fast });
  expect(onSlow).toHaveBeenCalledTimes(1);
});

test('fetchDumaFeed rejects a non-array feed', async () => {
  global.fetch.mockReturnValue(ok({ error: 'nope' }));
  await expect(fetchDumaFeed('/api/duma', fast)).rejects.toThrow('invalid feed');
});
