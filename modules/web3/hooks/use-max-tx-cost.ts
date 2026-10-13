import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';

import { STRATEGY_LAZY } from 'consts/react-query-strategies';

import { useDappStatus } from './use-dapp-status';
import { useMaxGasPrice } from './use-max-gas-price';
import {
  estimateTxFees,
  isTxSpecificFeeModel,
  type FeeEstimateTx,
} from '../utils/tx-fees';

type UseMaxTxCostArgs = {
  chainId?: number;
  gasLimit?: bigint;
  // representative tx; needed on chains that price txs individually
  tx?: FeeEstimateTx;
};

/**
 * Upper bound of a tx cost in wei for the chain's fee model:
 * - fee-history price (2x base fee + tip) times the gas limit everywhere
 * - plus the GasPriceOracle L1 data fee on OP-stack chains
 * - with the price and gas limit from linea_estimateGas on Linea
 * Without a `tx`, tx-specific parts are skipped and the result is the plain
 * fee-history cost.
 */
export const useMaxTxCost = ({ chainId, gasLimit, tx }: UseMaxTxCostArgs) => {
  const { chainId: dappChainId } = useDappStatus();
  const targetChainId = chainId || dappChainId;
  const publicClient = usePublicClient({ chainId: targetChainId });
  const feeHistory = useMaxGasPrice(targetChainId);

  const isTxFeesNeeded = !!tx && isTxSpecificFeeModel(targetChainId);

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

  const maxTxCost = useMemo(() => {
    if (gasLimit === undefined || maxGasPrice === undefined) return undefined;
    // an understated cost is worse than a late one
    if (isTxFeesNeeded && !txFeesData) return undefined;
    const chainGasLimit = txFeesData?.gasLimit;
    const effectiveGasLimit =
      chainGasLimit !== undefined && chainGasLimit > gasLimit
        ? chainGasLimit
        : gasLimit;
    return effectiveGasLimit * maxGasPrice + l1Fee;
  }, [gasLimit, maxGasPrice, isTxFeesNeeded, txFeesData, l1Fee]);

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
