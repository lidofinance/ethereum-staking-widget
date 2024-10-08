import { useFeeHistory } from 'wagmi';
import { BigNumber } from 'ethers';
import type { GetFeeHistoryReturnType } from 'viem';

const REWARD_PERCENTILES = [25];

const feeHistoryToMaxFee = ({
  reward,
  baseFeePerGas,
}: GetFeeHistoryReturnType) => {
  const maxPriorityFeePerGas = reward
    ? reward?.map((fees) => fees[0]).reduce((sum, fee) => sum + fee) /
      BigInt(reward.length)
    : BigInt(0);

  const lastBaseFeePerGas = baseFeePerGas[0];

  // we have to multiply by 2 until we find a reliable way to predict baseFee change
  const maxFeePerGas = lastBaseFeePerGas * BigInt(2) + maxPriorityFeePerGas;
  return BigNumber.from(maxFeePerGas);
};

export const useMaxGasPrice = () => {
  const { data, isLoading, error, isFetching, refetch } = useFeeHistory({
    blockCount: 5,
    blockTag: 'pending',
    rewardPercentiles: REWARD_PERCENTILES,
    query: {
      select: feeHistoryToMaxFee,
    },
  });

  return {
    get maxGasPrice() {
      return data;
    },
    get initialLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    get loading() {
      return isFetching;
    },
    update() {
      return refetch();
    },
  };
};
