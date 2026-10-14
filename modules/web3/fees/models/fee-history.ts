import type { GetFeeHistoryReturnType } from 'viem';
import { getFeeHistory } from 'viem/actions';

import { withBufferPercent, type FeeParams } from '../params';
import type { FeeClient, MaxFeeData } from '../types';

/**
 * The chain-wide max price shared by the EIP-1559 models:
 * baseFee * multiplier + the sampled bottom-percentile tip, which is what
 * the SDK sends with.
 */
export const feeHistoryToMaxFee = (
  {
    reward,
    baseFeePerGas,
  }: Pick<GetFeeHistoryReturnType, 'reward' | 'baseFeePerGas'>,
  params: FeeParams,
): MaxFeeData => {
  const maxPriorityFeePerGas =
    reward && reward.length > 0
      ? reward.map((fees) => fees[0] ?? 0n).reduce((sum, fee) => sum + fee) /
        BigInt(reward.length)
      : 0n;
  const lastBaseFeePerGas = baseFeePerGas[0] ?? 0n;

  return {
    lastBaseFeePerGas,
    maxPriorityFeePerGas,
    maxFeePerGas:
      withBufferPercent(lastBaseFeePerGas, params.baseFeeBufferPercent) +
      maxPriorityFeePerGas,
  };
};

export const getFeeHistoryMaxFee = async (
  client: FeeClient,
  params: FeeParams,
): Promise<MaxFeeData> =>
  feeHistoryToMaxFee(
    await getFeeHistory(client, {
      blockCount: params.feeHistoryBlockCount,
      blockTag: 'pending',
      rewardPercentiles: [params.feeHistoryRewardPercentile],
    }),
    params,
  );

// The same price with the tip raised to `floor` when the sample is below it
export const withPriorityFeeFloor = (
  maxFee: MaxFeeData,
  floor: bigint,
  params: FeeParams,
): MaxFeeData => {
  if (floor <= maxFee.maxPriorityFeePerGas) return maxFee;
  return {
    ...maxFee,
    maxPriorityFeePerGas: floor,
    maxFeePerGas:
      withBufferPercent(maxFee.lastBaseFeePerGas, params.baseFeeBufferPercent) +
      floor,
  };
};
