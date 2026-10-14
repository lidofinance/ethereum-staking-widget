import type { GetFeeHistoryReturnType } from 'viem';
import { estimateMaxPriorityFeePerGas, getFeeHistory } from 'viem/actions';

import type { FeeParams } from '../params';
import type { FeeClient, MaxFeeData } from '../types';

/**
 * The chain-wide max price shared by the EIP-1559 models:
 * baseFee * multiplier + tip.
 * The tip is the sampled bottom-percentile tip floored at the node's
 * suggested priority fee: wallets that price a tx themselves pay the
 * suggestion, and OP-stack nodes suggest a fixed minimum (0.001 gwei) that
 * dwarfs both the base fee and the sampled tip on chains like Optimism,
 * where the sample alone understates the cost many times over.
 */
export const feeHistoryToMaxFee = (
  {
    reward,
    baseFeePerGas,
  }: Pick<GetFeeHistoryReturnType, 'reward' | 'baseFeePerGas'>,
  suggestedPriorityFeePerGas: bigint,
  params: FeeParams,
): MaxFeeData => {
  const sampledPriorityFeePerGas =
    reward && reward.length > 0
      ? reward.map((fees) => fees[0] ?? 0n).reduce((sum, fee) => sum + fee) /
        BigInt(reward.length)
      : 0n;
  const maxPriorityFeePerGas =
    suggestedPriorityFeePerGas > sampledPriorityFeePerGas
      ? suggestedPriorityFeePerGas
      : sampledPriorityFeePerGas;
  const lastBaseFeePerGas = baseFeePerGas[0] ?? 0n;

  return {
    lastBaseFeePerGas,
    maxPriorityFeePerGas,
    maxFeePerGas:
      lastBaseFeePerGas * params.baseFeeMultiplier + maxPriorityFeePerGas,
  };
};

export const getFeeHistoryMaxFee = async (
  client: FeeClient,
  params: FeeParams,
): Promise<MaxFeeData> => {
  const [feeHistory, suggestedPriorityFeePerGas] = await Promise.all([
    getFeeHistory(client, {
      blockCount: params.feeHistoryBlockCount,
      blockTag: 'pending',
      rewardPercentiles: [params.feeHistoryRewardPercentile],
    }),
    // a missing suggestion must not block the quote
    estimateMaxPriorityFeePerGas(client).catch(() => 0n),
  ]);
  return feeHistoryToMaxFee(feeHistory, suggestedPriorityFeePerGas, params);
};
