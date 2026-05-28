import { describe, it, expect } from 'vitest';

import { isVersionLess } from '../utils';

describe('isVersionLess', () => {
  it('returns false for equal 3-component versions', () => {
    expect(isVersionLess('1.0.0', '1.0.0')).toBe(false);
  });

  it('returns true when versionA patch is lower', () => {
    expect(isVersionLess('1.0.0', '1.0.1')).toBe(true);
  });

  it('returns false when versionA patch is higher', () => {
    expect(isVersionLess('1.0.1', '1.0.0')).toBe(false);
  });

  it('returns true when versionA has fewer components and shared prefix is equal', () => {
    expect(isVersionLess('1.0.0', '1.0.0.1')).toBe(true);
    expect(isVersionLess('1.60.1', '1.60.1.1')).toBe(true);
  });

  it('returns false when versionA has more components and shared prefix is equal', () => {
    expect(isVersionLess('1.0.0.1', '1.0.0')).toBe(false);
  });

  it('treats trailing zeros as equal (1.0 == 1.0.0)', () => {
    expect(isVersionLess('1.0', '1.0.0')).toBe(false);
    expect(isVersionLess('1.0.0', '1.0')).toBe(false);
  });

  it('returns false when either side has a non-numeric component', () => {
    expect(isVersionLess('abc', '1.0.0')).toBe(false);
    expect(isVersionLess('1.0.0', 'abc')).toBe(false);
  });

  it('handles real production version strings', () => {
    expect(isVersionLess('1.60.1', '1.60.2')).toBe(true);
    expect(isVersionLess('1.60.2', '1.60.1')).toBe(false);
    expect(isVersionLess('1.59.9', '1.60.0')).toBe(true);
  });
});
