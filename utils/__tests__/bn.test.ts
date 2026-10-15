import { bnAmountToNumber } from '../bn';

describe('bnAmountToNumber', () => {
  it('returns 0 for an empty or zero amount', () => {
    expect(bnAmountToNumber(undefined, 18)).toBe(0);
    expect(bnAmountToNumber(null, 18)).toBe(0);
    expect(bnAmountToNumber(0n, 6)).toBe(0);
  });

  it('requires decimals for a non-zero amount', () => {
    expect(() => bnAmountToNumber(1n)).toThrow('Decimals must be defined');
  });

  // USDC/USDT balances flow through `useStableToUsd` with 6 decimals
  it('keeps full precision for a six-decimal token', () => {
    expect(bnAmountToNumber(1_000_000n, 6)).toBe(1);
    expect(bnAmountToNumber(1_234_567n, 6)).toBe(1.234567);
    expect(bnAmountToNumber(1n, 6)).toBe(0.000001);
  });

  // The Earn collector reports TVL with 8 decimals
  it('keeps full precision for an eight-decimal amount', () => {
    expect(bnAmountToNumber(123_456_789n, 8)).toBe(1.23456789);
  });

  it('truncates an eighteen-decimal amount to the default precision', () => {
    expect(bnAmountToNumber(1_234_567_890_123_456_789n, 18)).toBe(1.2345678901);
    expect(bnAmountToNumber(10n ** 18n, 18)).toBe(1);
  });

  it('honours an explicit precision below the token decimals', () => {
    expect(bnAmountToNumber(1_234_567n, 6, 2)).toBe(1.23);
    expect(bnAmountToNumber(1_999_999n, 6, 4)).toBe(1.9999);
  });

  // `useEthUsd` multiplies an 18-decimal amount by an 8-decimal price
  it('handles a combined-decimals product', () => {
    const price = 2_000n * 10n ** 8n;
    expect(bnAmountToNumber(10n ** 18n * price, 26)).toBe(2000);
    expect(bnAmountToNumber((10n ** 18n * price) / 2n, 26)).toBe(1000);
  });
});
