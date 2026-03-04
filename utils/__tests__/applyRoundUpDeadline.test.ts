import { applyRoundUpDeadline } from '../apply-round-up-deadline';

describe('applyRoundUpDeadline', () => {
  it('rounds up to the end of the current thousand', () => {
    expect(applyRoundUpDeadline(1_709_123_456n)).toBe(1_709_123_999n);
  });

  it('returns xxx999 when deadline already ends with 999', () => {
    expect(applyRoundUpDeadline(1_709_123_999n)).toBe(1_709_123_999n);
  });

  it('returns xxx999 when deadline ends with 000', () => {
    expect(applyRoundUpDeadline(1_709_123_000n)).toBe(1_709_123_999n);
  });

  it('returns xxx999 when deadline ends with 001', () => {
    expect(applyRoundUpDeadline(1_709_123_001n)).toBe(1_709_123_999n);
  });

  it('handles zero', () => {
    expect(applyRoundUpDeadline(0n)).toBe(999n);
  });

  it('handles a value less than 1000', () => {
    expect(applyRoundUpDeadline(500n)).toBe(999n);
  });

  it('handles exact multiples of 1000', () => {
    expect(applyRoundUpDeadline(1_000n)).toBe(1_999n);
    expect(applyRoundUpDeadline(2_000n)).toBe(2_999n);
  });
});
