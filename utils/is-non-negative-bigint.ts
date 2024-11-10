export const isNonNegativeBigInt = (value: unknown): boolean => {
  return typeof value === 'bigint' && value >= BigInt(0);
};
