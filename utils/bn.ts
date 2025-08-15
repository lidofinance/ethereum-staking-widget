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
