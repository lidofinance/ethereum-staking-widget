import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';

import { STRATEGY_LAZY } from 'consts/react-query-strategies';

import { useDappStatus } from '../../hooks/use-dapp-status';
import { useMaxGasPrice } from './use-max-gas-price';
import {
  composeMaxTxCost,
  estimateTxFees,
  hasTxSpecificFees,
} from '../estimate';
import type { FeeEstimateTx } from '../types';

type UseMaxTxCostArgs = {
  chainId?: number;
  gasLimit?: bigint;
  // representative tx; needed on chains that price txs individually
  tx?: FeeEstimateTx;
};

/**
 * Upper bound of a tx cost in wei: the chain-wide max price times the gas
 * limit, plus or replaced by the tx-specific parts the chain's fee model
 * quotes (see modules/web3/fees). Without a `tx` the tx-specific parts are
 * skipped and the result is the chain-wide cost.
 */
export const useMaxTxCost = ({ chainId, gasLimit, tx }: UseMaxTxCostArgs) => {
  const { chainId: dappChainId } = useDappStatus();
  const targetChainId = chainId || dappChainId;
  const publicClient = usePublicClient({ chainId: targetChainId });
  const feeHistory = useMaxGasPrice(targetChainId);

  const isTxFeesNeeded = !!tx && hasTxSpecificFees(targetChainId);

  const txFees = useQuery({
    queryKey: [
      'max-tx-fees',
      {
        chainId: targetChainId,
        account: tx?.account,
        to: tx?.to,
        data: tx?.data,
        value: tx?.value ?? 0n,
      },
    ],
    enabled: isTxFeesNeeded && !!publicClient,
    ...STRATEGY_LAZY,
    queryFn: () => {
      invariant(publicClient && tx, 'tx fees query needs a client and a tx');
      return estimateTxFees(publicClient, targetChainId, tx);
    },
  });

  const txFeesData = isTxFeesNeeded ? txFees.data : undefined;
  const maxGasPrice = txFeesData?.maxFeePerGas ?? feeHistory.maxGasPrice;
  const l1Fee = txFeesData?.l1Fee ?? 0n;

  const maxTxCost = useMemo(
    () =>
      composeMaxTxCost({
        gasLimit,
        maxGasPrice: feeHistory.maxGasPrice,
        txFees: txFeesData,
        isTxFeesNeeded,
      }),
    [gasLimit, feeHistory.maxGasPrice, txFeesData, isTxFeesNeeded],
  );

  return {
    maxGasPrice,
    l1Fee,
    maxTxCost,
    get isLoading() {
      return feeHistory.isLoading || (isTxFeesNeeded && txFees.isLoading);
    },
    get error() {
      return feeHistory.error || txFees.error;
    },
    get isFetching() {
      return feeHistory.isFetching || txFees.isFetching;
    },
    update() {
      return Promise.all([
        feeHistory.update(),
        isTxFeesNeeded ? txFees.refetch() : Promise.resolve(),
      ]);
    },
  };
};
