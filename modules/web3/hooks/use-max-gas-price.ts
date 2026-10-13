import { useFeeHistory } from 'wagmi';
import type { GetFeeHistoryReturnType } from 'viem';

import { useDappStatus } from './use-dapp-status';
import {
  FEE_HISTORY_BLOCK_COUNT,
  FEE_HISTORY_REWARD_PERCENTILES,
  feeHistoryToMaxFee,
} from '../utils/tx-fees';

const selectMaxFee = (feeHistory: GetFeeHistoryReturnType) =>
  feeHistoryToMaxFee(feeHistory).maxFeePerGas;

/**
 * Fee-history based max gas price: 2x pending base fee + sampled tip.
 * Chain-agnostic; use `useMaxTxCost` for a tx cost that respects the chain's
 * fee model (L1 data fee on OP-stack, linea_estimateGas on Linea).
 */
export const useMaxGasPrice = (chainId?: number) => {
  const { chainId: dappChainId } = useDappStatus();

  const { data, isLoading, error, isFetching, refetch } = useFeeHistory({
    blockCount: FEE_HISTORY_BLOCK_COUNT,
    blockTag: 'pending',
    chainId: chainId || dappChainId,
    rewardPercentiles: FEE_HISTORY_REWARD_PERCENTILES,
    query: {
      select: selectMaxFee,
    },
  });

  return {
    get maxGasPrice() {
      return data;
    },
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    get isFetching() {
      return isFetching;
    },
    update() {
      return refetch();
    },
  };
};
