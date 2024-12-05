import { formatUnits, parseUnits } from 'viem/utils';

export const SHARE_RATE_PRECISION = 27;
export const e27 = (value: number) =>
  parseUnits(String(value), SHARE_RATE_PRECISION);

export const formatShareRate = (value: bigint) =>
  formatUnits(value, SHARE_RATE_PRECISION);

export const calcShareRate = (
  amountOfStETH: bigint,
  amountOfShares: bigint,
): bigint => {
  return (e27(1) * amountOfStETH) / amountOfShares;
};
