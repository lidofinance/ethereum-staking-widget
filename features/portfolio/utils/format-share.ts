// 22.14%, two decimals as in the design
export const formatShare = (share: number): string =>
  `${(Number.isFinite(share) ? share * 100 : 0).toFixed(2)}%`;
