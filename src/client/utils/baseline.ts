export const BASELINE_VERSION = 1 as const;
export const BASELINE_PREFIX = 'sentinel:baseline:v1:';

export interface BaselineSnapshot {
  version: typeof BASELINE_VERSION;
  target: string;
  savedAt: string;
  results: Record<string, unknown>;
}

export type ChangeKind = 'added' | 'removed' | 'changed' | 'unchanged';

export interface BaselineChange {
  kind: ChangeKind;
  checkId: string;
  path: string;
  before?: unknown;
  after?: unknown;
}

export type BaselineComparison = Record<ChangeKind, BaselineChange[]>;

const hasOwn = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const stableValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value
      .map(stableValue)
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  }
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableValue(value[key])]),
    );
  }
  return value;
};

const fingerprint = (value: unknown) => JSON.stringify(stableValue(value));

const valuesMatch = (before: unknown, after: unknown) => fingerprint(before) === fingerprint(after);

const joinPath = (base: string, key: string) => (base ? `${base}.${key}` : key);

const compareValue = (
  checkId: string,
  path: string,
  before: unknown,
  after: unknown,
  output: BaselineComparison,
) => {
  if (valuesMatch(before, after)) return;

  if (Array.isArray(before) && Array.isArray(after)) {
    const beforeItems = new Map(before.map((item) => [fingerprint(item), item]));
    const afterItems = new Map(after.map((item) => [fingerprint(item), item]));

    beforeItems.forEach((item, key) => {
      if (!afterItems.has(key)) {
        output.removed.push({ kind: 'removed', checkId, path: `${path}[]`, before: item });
      }
    });
    afterItems.forEach((item, key) => {
      if (!beforeItems.has(key)) {
        output.added.push({ kind: 'added', checkId, path: `${path}[]`, after: item });
      }
    });
    return;
  }

  if (isRecord(before) && isRecord(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    [...keys].sort().forEach((key) => {
      const nextPath = joinPath(path, key);
      if (!hasOwn(before, key)) {
        output.added.push({ kind: 'added', checkId, path: nextPath, after: after[key] });
      } else if (!hasOwn(after, key)) {
        output.removed.push({ kind: 'removed', checkId, path: nextPath, before: before[key] });
      } else {
        compareValue(checkId, nextPath, before[key], after[key], output);
      }
    });
    return;
  }

  output.changed.push({ kind: 'changed', checkId, path: path || checkId, before, after });
};

export const normalizeBaselineTarget = (target: string): string => {
  const trimmed = target
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/[/?#].*$/, '');
  return trimmed.toLowerCase().replace(/\.$/, '');
};

export const baselineStorageKey = (target: string): string =>
  `${BASELINE_PREFIX}${normalizeBaselineTarget(target)}`;

export const createBaselineSnapshot = (
  target: string,
  results: Record<string, unknown>,
  savedAt = new Date().toISOString(),
): BaselineSnapshot => ({
  version: BASELINE_VERSION,
  target: normalizeBaselineTarget(target),
  savedAt,
  results: stableValue(results) as Record<string, unknown>,
});

export const compareBaselineSnapshots = (
  baseline: BaselineSnapshot,
  current: BaselineSnapshot,
): BaselineComparison => {
  const output: BaselineComparison = { changed: [], added: [], removed: [], unchanged: [] };

  // Only checks returned successfully in the current run are compared. A failed or skipped
  // endpoint must not make old data look as if it was removed from the target.
  Object.keys(current.results)
    .sort()
    .forEach((checkId) => {
      const after = current.results[checkId];
      if (!hasOwn(baseline.results, checkId)) {
        output.added.push({ kind: 'added', checkId, path: checkId, after });
        return;
      }

      const before = baseline.results[checkId];
      if (valuesMatch(before, after)) {
        output.unchanged.push({ kind: 'unchanged', checkId, path: checkId, before, after });
        return;
      }

      compareValue(checkId, '', before, after, output);
    });

  return output;
};

export const readBaseline = (target: string): BaselineSnapshot | null => {
  const raw = window.localStorage.getItem(baselineStorageKey(target));
  if (!raw) return null;
  const parsed = JSON.parse(raw) as Partial<BaselineSnapshot>;
  if (
    parsed.version !== BASELINE_VERSION ||
    !parsed.target ||
    !parsed.savedAt ||
    !isRecord(parsed.results)
  ) {
    return null;
  }
  return parsed as BaselineSnapshot;
};

export const writeBaseline = (snapshot: BaselineSnapshot): void => {
  window.localStorage.setItem(baselineStorageKey(snapshot.target), JSON.stringify(snapshot));
};

export const removeBaseline = (target: string): void => {
  window.localStorage.removeItem(baselineStorageKey(target));
};
