import { describe, expect, it } from 'vitest';

import { STAKE_PATHS, parseStakeSegments, toStakeSegments } from './stake-path';

describe('stake path', () => {
  it('maps /stake to no segments and back', () => {
    expect(toStakeSegments('/stake')).toEqual([]);
    expect(parseStakeSegments(undefined)).toBe('/stake');
    expect(parseStakeSegments([])).toBe('/stake');
  });

  it('round-trips every known path', () => {
    STAKE_PATHS.forEach((path) => {
      expect(parseStakeSegments(toStakeSegments(path))).toBe(path);
    });
  });

  it('rejects unknown paths', () => {
    expect(parseStakeSegments(['unwrap'])).toBeNull();
    expect(parseStakeSegments(['wrap', 'unwrap', 'faq'])).toBeNull();
    expect(parseStakeSegments(['rewards', 'faq'])).toBeNull();
    expect(parseStakeSegments(['', 'wrap'])).toBeNull();
  });
});
