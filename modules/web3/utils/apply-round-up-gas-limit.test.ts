import { applyRoundUpTxParameter } from './apply-round-up-gas-limit';

describe('applyRoundUpTxParameter', () => {
  it('rounds up to the end of the current thousand', () => {
    expect(applyRoundUpTxParameter(1_709_123_456n)).toBe(1_709_123_999n);
  });

  it('returns xxx999 when parameter already ends with 999', () => {
    expect(applyRoundUpTxParameter(1_709_123_999n)).toBe(1_709_123_999n);
  });

  it('returns xxx999 when parameter ends with 000', () => {
    expect(applyRoundUpTxParameter(1_709_123_000n)).toBe(1_709_123_999n);
  });

  it('returns xxx999 when parameter ends with 001', () => {
    expect(applyRoundUpTxParameter(1_709_123_001n)).toBe(1_709_123_999n);
  });

  it('handles zero', () => {
    expect(applyRoundUpTxParameter(0n)).toBe(999n);
  });

  it('handles a value less than 1000', () => {
    expect(applyRoundUpTxParameter(500n)).toBe(999n);
  });

  it('handles exact multiples of 1000', () => {
    expect(applyRoundUpTxParameter(1_000n)).toBe(1_999n);
    expect(applyRoundUpTxParameter(2_000n)).toBe(2_999n);
  });
});
