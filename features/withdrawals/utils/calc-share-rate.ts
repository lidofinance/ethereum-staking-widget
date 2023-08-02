import { formatUnits, parseUnits } from '@ethersproject/units';
import { BigNumber, BigNumberish } from 'ethers';

export const SHARE_RATE_PRECISION = 27;

export const e27 = (value: number) =>
  parseUnits(String(value), SHARE_RATE_PRECISION);

export const formatShareRate = (value: BigNumberish) =>
  formatUnits(value, SHARE_RATE_PRECISION);

export const calcShareRate = (
  amountOfStETH: BigNumberish,
  amountOfShares: BigNumberish,
) => {
  return BigNumber.from(e27(1)).mul(amountOfStETH).div(amountOfShares);
};
