export const unixTimestampToMs = (timestamp: bigint | number): number =>
  Number(timestamp) * 1000;
