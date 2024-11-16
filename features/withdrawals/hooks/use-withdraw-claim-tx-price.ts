import { useMemo } from 'react';
import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { useTxCostInUsd } from 'shared/hooks/use-tx-cost-in-usd';
import { useDappStatus, useLidoSDK } from 'modules/web3';
import { config } from 'config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useLidoQuery } from 'shared/hooks/use-lido-query';

import { RequestStatusClaimable } from '../types/request-status';

export const useWithdrawClaimTxPrice = (requests: RequestStatusClaimable[]) => {
  const { address, chainId } = useDappStatus();
  const { withdraw } = useLidoSDK();

  const requestCount = requests.length || 1;
  const debouncedSortedSelectedRequests = useDebouncedValue(requests, 2000);

  const queryKey = useMemo(
    () => [
      'claim-request-gas-limit',
      debouncedSortedSelectedRequests.map((r) => ({
        id: r.id.toString(),
        hint: r.hint.toString(),
      })),
      address,
      withdraw.core.chainId,
    ],
    [debouncedSortedSelectedRequests, address, withdraw.core.chainId],
  );

  const { data: gasLimit, loading: isEstimateLoading } = useLidoQuery<bigint>({
    queryKey,
    enabled:
      !!chainId && !!address && debouncedSortedSelectedRequests.length > 0,
    strategy: STRATEGY_LAZY,
    queryFn: async () => {
      const sortedRequests = debouncedSortedSelectedRequests;

      const contract = await withdraw.contract.getContractWithdrawalQueue();
      return await contract.estimateGas.claimWithdrawals(
        [sortedRequests.map((r) => r.id), sortedRequests.map((r) => r.hint)],
        {
          account: address,
        },
      );
    },
  });

  const claimGasLimit = isEstimateLoading
    ? undefined
    : gasLimit ??
      config.WITHDRAWAL_QUEUE_CLAIM_GAS_LIMIT_DEFAULT * BigInt(requestCount);

  const { txCostUsd: claimTxPriceInUsd, initialLoading: isTxCostLoading } =
    useTxCostInUsd(claimGasLimit);

  return {
    loading:
      isEstimateLoading ||
      isTxCostLoading ||
      debouncedSortedSelectedRequests !== requests,
    claimGasLimit,
    claimTxPriceInUsd,
  };
};