const assert = require('node:assert/strict');
const { registerHooks } = require('node:module');
const { test } = require('node:test');

registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context);
    } catch (error) {
      if (!specifier.startsWith('.') || /\.[cm]?[jt]s$/.test(specifier)) throw error;
      return next(`${specifier}.ts`, context);
    }
  },
});

const { apiFetch, OfflineQueuedError } = require('../src/shared/lib/api-client.ts');
const { workoutApi } = require('../src/features/training/services/workout.api.ts');

function mockBrowser(t, fetch) {
  const values = new Map();
  t.mock.method(globalThis, 'fetch', fetch);
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  });
  return values;
}

test('cached training data is available offline only to the same account', async (t) => {
  let online = true;
  mockBrowser(t, async () => {
    if (!online) throw new TypeError('Failed to fetch');
    return Response.json([{ id: 'routine' }]);
  });
  const path = '/api/workout-routines';
  const alice = { offlineCacheKey: `training:alice:${path}` };
  await apiFetch(path, {}, alice);
  online = false;
  assert.deepEqual(await apiFetch(path, {}, alice), [{ id: 'routine' }]);
  await assert.rejects(apiFetch(path, {}, { offlineCacheKey: `training:bob:${path}` }), TypeError);
});

test('training reads stop waiting and use the last successful response', async (t) => {
  let stalled = false;
  mockBrowser(t, async (_url, { signal }) => {
    if (!stalled) return Response.json([{ id: 'exercise' }]);
    return new Promise((_, reject) => {
      const guard = setTimeout(() => reject(new Error('Request did not honor the deadline')), 250);
      signal?.addEventListener('abort', () => {
        clearTimeout(guard);
        reject(signal.reason);
      });
    });
  });
  const path = '/api/exercise-catalog';
  const options = { timeoutMs: 15, offlineCacheKey: `training:alice:${path}` };
  await apiFetch(path, {}, options);
  stalled = true;
  assert.deepEqual(await apiFetch(path, {}, options), [{ id: 'exercise' }]);
});

test('a caller-owned timeout is still a cancellation even when there is cached data', async (t) => {
  const controller = new AbortController();
  mockBrowser(t, async (_url, init) => {
    if (init.signal?.aborted) throw init.signal.reason;
    return Response.json([{ id: 'metric' }]);
  });
  const path = '/api/metrics';
  await apiFetch(path);
  const reason = new DOMException('Caller cancelled', 'TimeoutError');
  controller.abort(reason);
  await assert.rejects(apiFetch(path, { signal: controller.signal }), error => error === reason);
});

test('workout saves wait for server confirmation without a request deadline', async (t) => {
  mockBrowser(t, async (_url, init) => {
    assert.equal(init.signal, undefined);
    return Response.json({ id: 'workout' }, { status: 201 });
  });
  assert.deepEqual(await workoutApi.create({ durationSeconds: 10, comments: null, exercises: [] }), { id: 'workout' });
});

test('catalog rename and merge fail visibly without queuing, unlike the existing workout save', async (t) => {
  const storage = mockBrowser(t, async () => { throw new TypeError('Failed to fetch'); });
  for (const [method, suffix] of [['PUT', ''], ['POST', '/merge']]) {
    await assert.rejects(
      apiFetch(`/api/exercise-catalog/source${suffix}`, { method }, { queueOffline: false }),
      (error) => error instanceof TypeError && !(error instanceof OfflineQueuedError),
    );
  }
  assert.equal(storage.size, 0);
  await assert.rejects(apiFetch('/api/workouts', { method: 'POST' }), OfflineQueuedError);
  assert.equal(storage.size, 1);
});
