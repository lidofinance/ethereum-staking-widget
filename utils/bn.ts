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
  precision = 4,
): number => {
  if (amount == null || amount === 0n) return 0;

  if (!decimals) throw new Error('Decimals must be defined');

  if (decimals < precision)
    throw new Error('Decimals must be greater than or equal to precision');

  const amountP4 = amount / 10n ** BigInt(decimals - precision);
  return Number(amountP4) / 10 ** precision;
};
