import { useMemo } from 'react';
import { useLidoSWR } from '@lido-sdk/react';

import { useDappStatus, useLidoSDK } from 'modules/web3';
import { config } from 'config';
import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { MAX_REQUESTS_COUNT } from 'features/withdrawals/withdrawals-constants';
import { useTxCostInUsd } from 'shared/hooks/use-tx-cost-in-usd';
import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { encodeURLQuery } from 'utils/encodeURLQuery';
import { standardFetcher } from 'utils/standardFetcher';

import { RequestStatusClaimable } from '../types/request-status';
import { TOKENS_WITHDRAWABLE } from '../types/tokens-withdrawable';

type UseRequestTxPriceOptions = {
  requestCount?: number;
  token: TOKENS_WITHDRAWABLE;
  isApprovalFlow: boolean;
};

export const useRequestTxPrice = ({
  token,
  isApprovalFlow,
  requestCount,
}: UseRequestTxPriceOptions) => {
  const { chainId } = useDappStatus();
  const { withdraw } = useLidoSDK();

  const fallback =
    token === TOKENS_WITHDRAWABLE.stETH
      ? isApprovalFlow
        ? config.WITHDRAWAL_QUEUE_REQUEST_STETH_APPROVED_GAS_LIMIT_DEFAULT
        : config.WITHDRAWAL_QUEUE_REQUEST_STETH_PERMIT_GAS_LIMIT_DEFAULT
      : isApprovalFlow
        ? config.WITHDRAWAL_QUEUE_REQUEST_WSTETH_APPROVED_GAS_LIMIT_DEFAULT
        : config.WITHDRAWAL_QUEUE_REQUEST_WSTETH_PERMIT_GAS_LIMIT_DEFAULT;

  const cappedRequestCount = Math.min(requestCount || 1, MAX_REQUESTS_COUNT);
  const debouncedRequestCount = useDebouncedValue(cappedRequestCount, 2000);

  const url = useMemo(() => {
    const basePath = config.wqAPIBasePath;
    const params = encodeURLQuery({
      token,
      requestCount: debouncedRequestCount,
    });
    return `${basePath}/v1/estimate-gas?${params}`;
  }, [debouncedRequestCount, token]);

  const { data: permitEstimateData, initialLoading: permitLoading } =
    useLidoSWR<{ gasLimit: number }>(url, standardFetcher, {
      ...STRATEGY_LAZY,
      isPaused: () => !chainId || isApprovalFlow,
    });
  const permitGasLimit = permitEstimateData
    ? BigInt(permitEstimateData?.gasLimit ? permitEstimateData?.gasLimit : '0')
    : undefined;

  const { data: approvalFlowGasLimit, initialLoading: approvalLoading } =
    useLidoSWR(
      ['swr:request-gas-limit', debouncedRequestCount, withdraw.core.chainId],
      async () => {
        try {
          const contract = await withdraw.contract.getContractWithdrawalQueue();
          const requestsStub = Array.from<bigint>({
            length: debouncedRequestCount,
          }).fill(BigInt(100));

          const gasLimit = await contract.estimateGas.requestWithdrawals(
            [requestsStub, config.ESTIMATE_ACCOUNT],
            {
              account: config.ESTIMATE_ACCOUNT,
            },
          );
          return gasLimit;
        } catch (error) {
          console.warn('Could not estimate gas for request', {
            error,
          });
          return undefined;
        }
      },
      {
        ...STRATEGY_LAZY,
        isPaused: () => !chainId || !isApprovalFlow,
      },
    );

  const gasLimit =
    (isApprovalFlow ? (approvalFlowGasLimit as bigint) : permitGasLimit) ??
    fallback * BigInt(debouncedRequestCount);

  const { txCostUsd: txPriceUsd, initialLoading: isTxCostLoading } =
    useTxCostInUsd(gasLimit);

  const loading =
    cappedRequestCount !== debouncedRequestCount ||
    (isApprovalFlow ? approvalLoading : permitLoading) ||
    isTxCostLoading;

  return {
    loading,
    txPriceUsd,
    gasLimit,
  };
};

export const useClaimTxPrice = (requests: RequestStatusClaimable[]) => {
  const { address, chainId } = useDappStatus();
  const { withdraw } = useLidoSDK();

  const requestCount = requests.length || 1;
  const debouncedSortedSelectedRequests = useDebouncedValue(requests, 2000);
  const { data: gasLimitResult, initialLoading: isEstimateLoading } =
    useLidoSWR(
      [
        'swr:claim-request-gas-limit',
        debouncedSortedSelectedRequests,
        address,
        withdraw.core.chainId,
      ],
      async () => {
        if (
          !chainId ||
          !address ||
          !withdraw ||
          debouncedSortedSelectedRequests.length === 0
        )
          return undefined;
        const sortedRequests = debouncedSortedSelectedRequests;

        const contract = await withdraw.contract.getContractWithdrawalQueue();
        const gasLimit = await contract.estimateGas
          .claimWithdrawals(
            [
              sortedRequests.map((r) => r.id),
              sortedRequests.map((r) => r.hint),
            ],
            {
              account: address,
            },
          )
          .catch((error) => {
            console.warn('Could not estimate gas for claim', {
              ids: sortedRequests.map((r) => r.id),
              address,
              error,
            });
            return undefined;
          });
        return gasLimit;
      },
      STRATEGY_LAZY,
    );

  const gasLimit = isEstimateLoading
    ? undefined
    : (gasLimitResult as bigint) ??
      config.WITHDRAWAL_QUEUE_CLAIM_GAS_LIMIT_DEFAULT * BigInt(requestCount);

  const { txCostUsd: price, initialLoading: isTxCostLoading } =
    useTxCostInUsd(gasLimit);

  return {
    loading:
      isEstimateLoading ||
      isTxCostLoading ||
      debouncedSortedSelectedRequests !== requests,
    claimGasLimit: gasLimit,
    claimTxPriceInUsd: price,
  };
};
