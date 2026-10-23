import { vi, afterEach, describe, it, expect, type Mock } from 'vitest';

// Mock utils/qa to break the ESM config chain (env-dynamics.mjs)
vi.mock('utils/qa', () => ({
  overrideWithQAMockString: vi.fn((value: string) => value),
  overrideWithQAMockNumber: vi.fn((value: number) => value),
}));

import { overrideWithQAMockString, overrideWithQAMockNumber } from 'utils/qa';
import { applyQALevelOverride, readThresholds } from '../qa-utils';
import { DEFAULT_THRESHOLDS } from '../../consts';

const mockString = overrideWithQAMockString as Mock;
const mockNumber = overrideWithQAMockNumber as Mock;

afterEach(() => vi.resetAllMocks());

// ---------------------------------------------------------------------------
// applyQALevelOverride
// ---------------------------------------------------------------------------
describe('applyQALevelOverride', () => {
  it('keeps level when QA returns same value', () => {
    mockString.mockReturnValue('blocked');
    expect(applyQALevelOverride('blocked')).toBe('blocked');
  });

  it('allows escalation: safe → blocked', () => {
    mockString.mockReturnValue('blocked');
    expect(applyQALevelOverride('safe')).toBe('blocked');
  });

  it('blocks de-escalation: blocked → safe', () => {
    mockString.mockReturnValue('safe');
    expect(applyQALevelOverride('blocked')).toBe('blocked');
  });

  it('ignores invalid level strings', () => {
    mockString.mockReturnValue('invalid');
    expect(applyQALevelOverride('blocked')).toBe('blocked');
  });

  it('ignores removed danger level', () => {
    mockString.mockReturnValue('danger');
    expect(applyQALevelOverride('safe')).toBe('safe');
  });
});

// ---------------------------------------------------------------------------
// readThresholds — QA clamping
// ---------------------------------------------------------------------------
describe('readThresholds', () => {
  it('returns defaults when no QA overrides', () => {
    mockNumber.mockImplementation((v: number) => v);
    expect(readThresholds()).toEqual(DEFAULT_THRESHOLDS);
  });

  // --- All thresholds: lower = stricter → only allow lower ---

  it('allows lowering oracleDeviationBlock (tighter)', () => {
    mockNumber.mockImplementation((v: number, key: string) =>
      key.includes('oracle-block') ? 2 : v,
    );
    const t = readThresholds();
    expect(t.oracleDeviationBlock).toBe(2);
  });

  it('blocks raising oracleDeviationBlock (looser)', () => {
    mockNumber.mockImplementation((v: number, key: string) =>
      key.includes('oracle-block') ? 10 : v,
    );
    const t = readThresholds();
    expect(t.oracleDeviationBlock).toBe(
      DEFAULT_THRESHOLDS.oracleDeviationBlock,
    );
  });

  it('allows lowering maxSellUsd (tighter)', () => {
    mockNumber.mockImplementation((v: number, key: string) =>
      key.includes('max-sell') ? 1000 : v,
    );
    const t = readThresholds();
    expect(t.maxSellUsd).toBe(1000);
  });

  it('blocks raising maxSellUsd (looser)', () => {
    mockNumber.mockImplementation((v: number, key: string) =>
      key.includes('max-sell') ? 99_000_000 : v,
    );
    const t = readThresholds();
    expect(t.maxSellUsd).toBe(DEFAULT_THRESHOLDS.maxSellUsd);
  });

  it('allows lowering minSellUsdToTriggerOracle (tighter)', () => {
    mockNumber.mockImplementation((v: number, key: string) =>
      key.includes('min-sell') ? 10 : v,
    );
    const t = readThresholds();
    expect(t.minSellUsdToTriggerOracle).toBe(10);
  });

  it('blocks raising minSellUsdToTriggerOracle (looser)', () => {
    mockNumber.mockImplementation((v: number, key: string) =>
      key.includes('min-sell') ? 100_000 : v,
    );
    const t = readThresholds();
    expect(t.minSellUsdToTriggerOracle).toBe(
      DEFAULT_THRESHOLDS.minSellUsdToTriggerOracle,
    );
  });
});
