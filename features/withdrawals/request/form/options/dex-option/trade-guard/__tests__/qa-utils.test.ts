// Mock utils/qa to break the ESM config chain (env-dynamics.mjs)
jest.mock('utils/qa', () => ({
  overrideWithQAMockString: jest.fn((value: string) => value),
  overrideWithQAMockNumber: jest.fn((value: number) => value),
}));

import { overrideWithQAMockString, overrideWithQAMockNumber } from 'utils/qa';
import { applyQALevelOverride, readThresholds } from '../utils/qa-utils';
import { DEFAULT_THRESHOLDS } from '../consts';

const mockString = overrideWithQAMockString as jest.Mock;
const mockNumber = overrideWithQAMockNumber as jest.Mock;

afterEach(() => jest.resetAllMocks());

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
    expect(t.oracleDeviationBlock).toBe(DEFAULT_THRESHOLDS.oracleDeviationBlock);
  });

  it('allows lowering maxAllowedSellAmount (tighter)', () => {
    mockNumber.mockImplementation((v: number, key: string) =>
      key.includes('max-sell') ? 1000 : v,
    );
    const t = readThresholds();
    expect(t.maxAllowedSellAmount).toBe(1000);
  });

  it('blocks raising maxAllowedSellAmount (looser)', () => {
    mockNumber.mockImplementation((v: number, key: string) =>
      key.includes('max-sell') ? 99999 : v,
    );
    const t = readThresholds();
    expect(t.maxAllowedSellAmount).toBe(
      DEFAULT_THRESHOLDS.maxAllowedSellAmount,
    );
  });

  it('allows lowering minSellUnitsToTriggerOracle (tighter)', () => {
    mockNumber.mockImplementation((v: number, key: string) =>
      key.includes('min-sell') ? 0.1 : v,
    );
    const t = readThresholds();
    expect(t.minSellUnitsToTriggerOracle).toBe(0.1);
  });

  it('blocks raising minSellUnitsToTriggerOracle (looser)', () => {
    mockNumber.mockImplementation((v: number, key: string) =>
      key.includes('min-sell') ? 100 : v,
    );
    const t = readThresholds();
    expect(t.minSellUnitsToTriggerOracle).toBe(
      DEFAULT_THRESHOLDS.minSellUnitsToTriggerOracle,
    );
  });
});
