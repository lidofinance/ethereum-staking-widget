import { formatEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';

// not safe, use only for approximate calculations
export const weiToEth = (wei: BigNumber): number => {
  return parseFloat(formatEther(wei));
};
