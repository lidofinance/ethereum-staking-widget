import { formatEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';

export const weiToEth = (wei: BigNumber): number => {
  return parseFloat(formatEther(wei));
};
