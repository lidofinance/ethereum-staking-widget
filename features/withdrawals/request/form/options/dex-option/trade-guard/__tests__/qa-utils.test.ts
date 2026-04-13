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
    mockString.mockReturnValue('warning');
    expect(applyQALevelOverride('warning')).toBe('warning');
  });

  it('allows escalation: warning → danger', () => {
    mockString.mockReturnValue('danger');
    expect(applyQALevelOverride('warning')).toBe('danger');
  });

  it('allows escalation: safe → blocked', () => {
    mockString.mockReturnValue('blocked');
    expect(applyQALevelOverride('safe')).toBe('blocked');
  });

  it('blocks de-escalation: danger → safe', () => {
    mockString.mockReturnValue('safe');
    expect(applyQALevelOverride('danger')).toBe('danger');
  });

  it('blocks de-escalation: blocked → warning', () => {
    mockString.mockReturnValue('warning');
    expect(applyQALevelOverride('blocked')).toBe('blocked');
  });

  it('ignores invalid level strings', () => {
    mockString.mockReturnValue('invalid');
    expect(applyQALevelOverride('warning')).toBe('warning');
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

  // --- Deviation thresholds: lower = stricter → only allow lower ---

  it('allows lowering fiatDeviationWarning (tighter)', () => {
    mockNumber.mockImplementation((v: number, key: string) =>
      key.includes('fiat-warning') ? 1 : v,
    );
    const t = readThresholds();
    expect(t.fiatDeviationWarning).toBe(1);
  });

  it('blocks raising fiatDeviationWarning (looser)', () => {
    mockNumber.mockImplementation((v: number, key: string) =>
      key.includes('fiat-warning') ? 10 : v,
    );
    const t = readThresholds();
    expect(t.fiatDeviationWarning).toBe(DEFAULT_THRESHOLDS.fiatDeviationWarning);
  });

  it('allows lowering maxSellUnits (tighter)', () => {
    mockNumber.mockImplementation((v: number, key: string) =>
      key.includes('max-sell') ? 1000 : v,
    );
    const t = readThresholds();
    expect(t.maxSellUnits).toBe(1000);
  });

  it('blocks raising maxSellUnits (looser)', () => {
    mockNumber.mockImplementation((v: number, key: string) =>
      key.includes('max-sell') ? 99999 : v,
    );
    const t = readThresholds();
    expect(t.maxSellUnits).toBe(DEFAULT_THRESHOLDS.maxSellUnits);
  });

  // --- minReceiveRatioThreshold: higher = stricter → only allow higher ---

  it('allows raising minReceiveRatioThreshold (tighter)', () => {
    mockNumber.mockImplementation((v: number, key: string) =>
      key.includes('min-ratio') ? 0.99 : v,
    );
    const t = readThresholds();
    expect(t.minReceiveRatioThreshold).toBe(0.99);
  });

  it('blocks lowering minReceiveRatioThreshold (looser)', () => {
    mockNumber.mockImplementation((v: number, key: string) =>
      key.includes('min-ratio') ? 0.5 : v,
    );
    const t = readThresholds();
    expect(t.minReceiveRatioThreshold).toBe(
      DEFAULT_THRESHOLDS.minReceiveRatioThreshold,
    );
  });
});
