export const applyRoundUpTxParameter = (number: bigint): bigint =>
  // 94567 -> 94 -> 94000 -> 94999
  // 1709123456 -> 1709123 -> 1709123000 -> 1709123999
  (number / 1_000n) * 1_000n + 999n;
