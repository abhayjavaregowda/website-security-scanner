import test from 'node:test';
import assert from 'node:assert/strict';

import {
  baselineStorageKey,
  compareBaselineSnapshots,
  createBaselineSnapshot,
  readBaseline,
  removeBaseline,
  writeBaseline,
} from './baseline.ts';

test('normalizes targets into one stable storage key', () => {
  assert.equal(
    baselineStorageKey('HTTPS://Example.COM/path?q=1'),
    'sentinel:baseline:v1:example.com',
  );
});

test('reports changed, added, removed and unchanged real result fields', () => {
  const baseline = createBaselineSnapshot(
    'example.com',
    {
      ssl: { issuer: 'Old CA', valid: true },
      headers: { hsts: false, server: 'nginx' },
      dns: ['1.1.1.1', '2.2.2.2'],
      redirects: ['https://example.com'],
    },
    '2026-01-01T00:00:00.000Z',
  );
  const current = createBaselineSnapshot(
    'example.com',
    {
      ssl: { issuer: 'New CA', valid: true },
      headers: { hsts: true, csp: 'default-src self' },
      dns: ['1.1.1.1', '3.3.3.3'],
      redirects: ['https://example.com'],
    },
    '2026-02-01T00:00:00.000Z',
  );

  const diff = compareBaselineSnapshots(baseline, current);
  assert.deepEqual(
    diff.changed.map((item) => `${item.checkId}:${item.path}`),
    ['headers:hsts', 'ssl:issuer'],
  );
  assert.ok(diff.added.some((item) => item.checkId === 'headers' && item.path === 'csp'));
  assert.ok(diff.added.some((item) => item.checkId === 'dns' && item.after === '3.3.3.3'));
  assert.ok(diff.removed.some((item) => item.checkId === 'headers' && item.path === 'server'));
  assert.ok(diff.removed.some((item) => item.checkId === 'dns' && item.before === '2.2.2.2'));
  assert.deepEqual(
    diff.unchanged.map((item) => item.checkId),
    ['redirects'],
  );
});

test('does not mark a baseline-only check as removed when the current endpoint did not return', () => {
  const baseline = createBaselineSnapshot('example.com', {
    ssl: { issuer: 'CA' },
    headers: { server: 'nginx' },
  });
  const current = createBaselineSnapshot('example.com', { headers: { server: 'nginx' } });

  const diff = compareBaselineSnapshots(baseline, current);
  assert.equal(diff.removed.length, 0);
  assert.deepEqual(
    diff.unchanged.map((item) => item.checkId),
    ['headers'],
  );
});

test('array order alone is not treated as a change', () => {
  const baseline = createBaselineSnapshot('example.com', { tech: ['React', 'Astro'] });
  const current = createBaselineSnapshot('example.com', { tech: ['Astro', 'React'] });

  const diff = compareBaselineSnapshots(baseline, current);
  assert.deepEqual(
    diff.unchanged.map((item) => item.checkId),
    ['tech'],
  );
});

test('saves, restores and resets a baseline in browser storage', () => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
      },
    },
  });

  const snapshot = createBaselineSnapshot('example.com', { ssl: { valid: true } });
  writeBaseline(snapshot);
  assert.deepEqual(readBaseline('https://EXAMPLE.com/path'), snapshot);

  removeBaseline('example.com');
  assert.equal(readBaseline('example.com'), null);
  Reflect.deleteProperty(globalThis, 'window');
});
