import { parseEther } from 'viem';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { configMock } = vi.hoisted(() => ({
  configMock: { enableQaHelpers: false },
}));

vi.mock('config', () => ({ config: configMock }));

import {
  overrideWithQAMockBoolean,
  overrideWithQAMockNumber,
  overrideWithQAMockString,
  overrideWithQAMockBigInt,
  overrideWithQAMockEther,
  overrideWithQAMockArray,
} from 'utils/qa';

const KEY = 'mock-qa-helpers-test-key';

describe('utils/qa overrides', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
    configMock.enableQaHelpers = true;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('ignores mocks when enableQaHelpers is off', () => {
    configMock.enableQaHelpers = false;
    storage.set(KEY, 'true');
    expect(overrideWithQAMockBoolean(false, KEY)).toBe(false);
    storage.set(KEY, '42');
    expect(overrideWithQAMockNumber(1, KEY)).toBe(1);
    expect(overrideWithQAMockString('base', KEY)).toBe('base');
    expect(overrideWithQAMockBigInt(1n, KEY)).toBe(1n);
    expect(overrideWithQAMockEther(1n, KEY)).toBe(1n);
    expect(overrideWithQAMockArray([1], KEY)).toEqual([1]);
  });

  it('returns the base value when no mock is set', () => {
    expect(overrideWithQAMockBoolean(true, KEY)).toBe(true);
    expect(overrideWithQAMockNumber(7, KEY)).toBe(7);
    expect(overrideWithQAMockString('base', KEY)).toBe('base');
  });

  it('applies boolean mock ("true" only)', () => {
    storage.set(KEY, 'true');
    expect(overrideWithQAMockBoolean(false, KEY)).toBe(true);
    storage.set(KEY, 'false');
    expect(overrideWithQAMockBoolean(true, KEY)).toBe(false);
  });

  it('applies number mock and rejects NaN', () => {
    storage.set(KEY, '42');
    expect(overrideWithQAMockNumber(1, KEY)).toBe(42);
    storage.set(KEY, 'not-a-number');
    expect(overrideWithQAMockNumber(1, KEY)).toBe(1);
  });

  it('applies bigint mock and throws on garbage', () => {
    storage.set(KEY, '123456789012345678901');
    expect(overrideWithQAMockBigInt(1n, KEY)).toBe(123456789012345678901n);
    storage.set(KEY, 'garbage');
    expect(() => overrideWithQAMockBigInt(1n, KEY)).toThrow();
  });

  it('applies ether mock as decimal ETH string', () => {
    storage.set(KEY, '200');
    expect(overrideWithQAMockEther(1n, KEY)).toBe(parseEther('200'));
    storage.set(KEY, 'garbage');
    expect(() => overrideWithQAMockEther(1n, KEY)).toThrow();
  });

  it('applies array mock only for valid JSON arrays', () => {
    storage.set(KEY, '[1,2]');
    expect(overrideWithQAMockArray([0], KEY)).toEqual([1, 2]);
    storage.set(KEY, '{"not":"array"}');
    expect(overrideWithQAMockArray([0], KEY)).toEqual([0]);
  });
});
