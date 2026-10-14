import { useMemo } from 'react';
import { useEstimateMaxPriorityFeePerGas, useFeeHistory } from 'wagmi';

import { useDappStatus } from './use-dapp-status';
import {
  FEE_HISTORY_BLOCK_COUNT,
  FEE_HISTORY_REWARD_PERCENTILES,
  feeHistoryToMaxFee,
} from '../utils/tx-fees';

/**
 * Fee-history based max gas price: 2x pending base fee + sampled tip, the tip
 * floored at the node's suggested priority fee (see `feeHistoryToMaxFee`).
 * Chain-agnostic; use `useMaxTxCost` for a tx cost that respects the chain's
 * fee model (L1 data fee on OP-stack, linea_estimateGas on Linea).
 */
export const useMaxGasPrice = (chainId?: number) => {
  const { chainId: dappChainId } = useDappStatus();
  const targetChainId = chainId || dappChainId;

  const feeHistory = useFeeHistory({
    blockCount: FEE_HISTORY_BLOCK_COUNT,
    blockTag: 'pending',
    chainId: targetChainId,
    rewardPercentiles: FEE_HISTORY_REWARD_PERCENTILES,
  });
  const suggestedTip = useEstimateMaxPriorityFeePerGas({
    chainId: targetChainId,
  });

  const data = useMemo(() => {
    if (!feeHistory.data) return undefined;
    // the quote waits for the suggestion, but a failed one does not block it
    if (suggestedTip.isLoading) return undefined;
    return feeHistoryToMaxFee(feeHistory.data, suggestedTip.data ?? 0n)
      .maxFeePerGas;
  }, [feeHistory.data, suggestedTip.data, suggestedTip.isLoading]);

  return {
    get maxGasPrice() {
      return data;
    },
    get isLoading() {
      return feeHistory.isLoading || suggestedTip.isLoading;
    },
    get error() {
      return feeHistory.error;
    },
    get isFetching() {
      return feeHistory.isFetching || suggestedTip.isFetching;
    },
    update() {
      return Promise.all([feeHistory.refetch(), suggestedTip.refetch()]);
    },
  };
};
