export const applyRoundUpGasLimit = (number: bigint): bigint =>
  // 94567 -> 94 -> 94000 -> 94999
  (number / 1_000n) * 1_000n + 999n;
