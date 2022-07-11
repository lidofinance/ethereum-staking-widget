import { BigNumber } from 'ethers';

export const bnMin = (a: BigNumber, b: BigNumber) => {
  return a.lt(b) ? a : b;
};
