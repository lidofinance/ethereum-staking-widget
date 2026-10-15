import { createRequire } from 'node:module';

import { commonPatterns, satanizer } from '@lidofinance/satanizer';

// `createRequire` because the module is `.cjs` (next-logger preloads the logger
// config without a build step) and the project is `"type": "module"`.
const requireCjs = createRequire(import.meta.url);
const { clampArgs, MAX_TOTAL_CHARS, MAX_STRING_LENGTH } = requireCjs(
  '../clamp-log-args.cjs',
) as {
  clampArgs: (args: unknown[]) => unknown[];
  MAX_TOTAL_CHARS: number;
  MAX_STRING_LENGTH: number;
};

const countChars = (value: unknown): number => {
  if (typeof value === 'string') return value.length;
  if (Array.isArray(value))
    return value.reduce<number>((n, v) => n + countChars(v), 0);
  if (value && typeof value === 'object') {
    return Object.entries(value).reduce(
      (n, [key, v]) => n + key.length + countChars(v),
      0,
    );
  }
  return 0;
};

const longestString = (value: unknown): number => {
  if (typeof value === 'string') return value.length;
  if (Array.isArray(value))
    return value.reduce<number>((n, v) => Math.max(n, longestString(v)), 0);
  if (value && typeof value === 'object') {
    return Object.entries(value).reduce(
      (n, [key, v]) => Math.max(n, key.length, longestString(v)),
      0,
    );
  }
  return 0;
};

// Slack over the budget: each clamped string may add a "[truncated N chars]"
// suffix, and keys are counted too.
const BUDGET_CEILING = MAX_TOTAL_CHARS * 2;

// Absolute ceilings, deliberately NOT derived from the module's own constants:
// masking cost grows quickly with string length, so raising a limit must fail
// this test and force a conscious decision rather than silently widening it.
const ABSOLUTE_STRING_CEILING = 4 * 1024;
const ABSOLUTE_TOTAL_CEILING = 32 * 1024;

const makeWideObject = (keys: number) =>
  Object.fromEntries(Array.from({ length: keys }, (_, i) => [`k${i}`, 'v']));

describe('clampArgs', () => {
  it('bounds a single oversized string', () => {
    const [clamped] = clampArgs(['a'.repeat(1024 * 1024)]);
    expect(countChars(clamped)).toBeLessThan(BUDGET_CEILING);
    expect(String(clamped)).toContain('truncated');
  });

  it('bounds an object with many keys', () => {
    const clamped = clampArgs([makeWideObject(20_000)]);
    expect(countChars(clamped)).toBeLessThan(BUDGET_CEILING);
  });

  it('bounds many oversized strings across one log line', () => {
    const args = Array.from({ length: 50 }, () => 'a'.repeat(64 * 1024));
    expect(countChars(clampArgs(args))).toBeLessThan(BUDGET_CEILING);
  });

  it('keeps short payloads byte-identical', () => {
    const args = [
      { type: 'CSP Violation', violation: { 'document-uri': '/x' } },
    ];
    expect(clampArgs(args)).toEqual(args);
  });

  it('flattens an Error and clamps its message', () => {
    const error = new Error('x'.repeat(64 * 1024), {
      cause: new Error('root'),
    });
    const [clamped] = clampArgs([error]) as [Record<string, unknown>];
    expect(clamped.name).toBe('Error');
    expect(String(clamped.message)).toContain('truncated');
    expect(countChars(clamped)).toBeLessThan(BUDGET_CEILING);
    expect(clamped.cause).toMatchObject({ message: 'root' });
  });

  it('survives cycles, deep nesting and throwing getters', () => {
    const cyclic: Record<string, unknown> = { name: 'x' };
    cyclic.self = cyclic;
    Object.defineProperty(cyclic, 'boom', {
      enumerable: true,
      get() {
        throw new Error('nope');
      },
    });

    let deep: Record<string, unknown> = { end: true };
    for (let i = 0; i < 100; i++) deep = { deep };

    expect(() => clampArgs([cyclic, deep])).not.toThrow();
  });

  it('does not report a repeated object as a cycle', () => {
    const shared = { a: 1 };
    expect(clampArgs([{ x: shared, y: shared }])).toEqual([
      { x: { a: 1 }, y: { a: 1 } },
    ]);
  });

  it('keeps masking cost bounded for an oversized payload', () => {
    const mask = satanizer(commonPatterns);
    const oversized = {
      documentUri: 'a'.repeat(1024 * 1024),
      wide: makeWideObject(20_000),
    };

    const clamped = clampArgs([oversized]);

    // Masking cost is driven by the longest single string and by the total
    // payload size, so assert both directly instead of wall-clock time.
    expect(MAX_STRING_LENGTH).toBeLessThanOrEqual(ABSOLUTE_STRING_CEILING);
    expect(MAX_TOTAL_CHARS).toBeLessThanOrEqual(ABSOLUTE_TOTAL_CEILING);
    expect(longestString(clamped)).toBeLessThanOrEqual(ABSOLUTE_STRING_CEILING);
    expect(countChars(clamped)).toBeLessThanOrEqual(ABSOLUTE_TOTAL_CEILING);
    expect(() => mask(clamped)).not.toThrow();
  });
});
