export const applyRoundUpDeadline = (deadline: bigint): bigint =>
  // 1709123456 -> 1709123 -> 1709123000 -> 1709123999
  (deadline / 1_000n) * 1_000n + 999n;
