export const applyRoundUpGasLimit = (number: bigint): bigint =>
  // 94567 -> 94 -> 94000 -> 94999
  (number / BigInt(1000)) * BigInt(1000) + BigInt(999);
