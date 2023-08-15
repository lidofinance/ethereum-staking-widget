import { BigNumber } from 'ethers';
import { CHAINS } from '@lido-sdk/constants';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import { getBackendRPCPath } from 'config';
import { StaticJsonRpcBatchProvider } from '@lidofinance/eth-providers';

type FeeData = {
  lastBaseFeePerGas: null | BigNumber;
  maxFeePerGas: null | BigNumber;
  maxPriorityFeePerGas: null | BigNumber;
  gasPrice: null | BigNumber;
};

const getFeeHistory = (
  provider: StaticJsonRpcBatchProvider,
  blockCount: number,
  latestBlock: string,
  percentile: number[],
) => {
  return provider.send('eth_feeHistory', [
    blockCount.toString(16),
    latestBlock,
    percentile,
  ]) as Promise<{
    baseFeePerGas: string[];
    gasUsedRatio: number[];
    oldestBlock: string;
    reward: string[][];
  }>;
};

export const getFeeData = async (chainId: CHAINS): Promise<FeeData> => {
  const provider = getStaticRpcBatchProvider(
    chainId,
    getBackendRPCPath(chainId),
  );

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
