export const minBN = (
  a: bigint | undefined | null,
  b: bigint | undefined | null,
): bigint => {
  if (a == null && b == null) {
    throw new Error('Both values are null or undefined');
  } else if (b == null) {
    return a as bigint;
  } else if (a == null) {
    return b;
  }
  return a < b ? a : b;
};

export const maxBN = (
  a: bigint | undefined | null,
  b: bigint | undefined | null,
): bigint => {
  if (a == null && b == null) {
    throw new Error('Both values are null or undefined');
  } else if (b == null) {
    return a as bigint;
  } else if (a == null) {
    return b;
  }
  return a > b ? a : b;
};

export const bnAmountToNumber = (
  amount?: bigint | null,
  decimals?: number,
  precision = 10,
): number => {
  if (amount == null || amount === 0n) return 0;

  if (!decimals) throw new Error('Decimals must be defined');

  // A token cannot carry more fractional digits than its own decimals, so a
  // low-decimal token (USDC/USDT: 6, the collector TVL: 8) keeps full precision
  const effectivePrecision = Math.min(precision, decimals);

  const scaled = amount / 10n ** BigInt(decimals - effectivePrecision);
  return Number(scaled) / 10 ** effectivePrecision;
};
