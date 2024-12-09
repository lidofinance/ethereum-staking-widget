import { formatEther } from 'viem';

// not safe, use only for approximate calculations
export const weiToEth = (wei: bigint): number => {
  return parseFloat(formatEther(wei));
};
