import { BigNumber } from 'ethers';
import type { Web3Provider } from '@ethersproject/providers';
import { StaticJsonRpcBatchProvider } from '@lidofinance/eth-providers';

type FeeData = {
  lastBaseFeePerGas: BigNumber;
  maxFeePerGas: BigNumber;
  maxPriorityFeePerGas: BigNumber;
  gasPrice: BigNumber;
};

const getFeeHistory = (
  provider: StaticJsonRpcBatchProvider | Web3Provider,
  blockCount: number,
  latestBlock: string,
  percentile: number[],
) => {
  return provider.send('eth_feeHistory', [
    '0x' + blockCount.toString(16),
    latestBlock,
    percentile,
  ]) as Promise<{
    baseFeePerGas: string[];
    gasUsedRatio: number[];
    oldestBlock: string;
    reward: string[][];
  }>;
};

export const getFeeData = async (
  provider: StaticJsonRpcBatchProvider | Web3Provider,
): Promise<FeeData> => {
  // we look back 5 blocks at fees of botton 25% txs
  // if you want to increase maxPriorityFee output increase percentile
  const feeHistory = await getFeeHistory(provider, 5, 'pending', [25]);

  // get average priority fee
  const maxPriorityFeePerGas = feeHistory.reward
    .map((fees) => BigNumber.from(fees[0]))
    .reduce((sum, fee) => sum.add(fee))
    .div(feeHistory.reward.length);

  const lastBaseFeePerGas = BigNumber.from(feeHistory.baseFeePerGas[0]);

  // we have to multiply by 2 until we find a reliable way to predict baseFee change
  const maxFeePerGas = lastBaseFeePerGas.mul(2).add(maxPriorityFeePerGas);

  return {
    lastBaseFeePerGas,
    maxPriorityFeePerGas,
    maxFeePerGas,
    gasPrice: maxFeePerGas, // fallback
  };
};
