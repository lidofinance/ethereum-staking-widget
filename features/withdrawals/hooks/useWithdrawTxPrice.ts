import { useMemo } from 'react';
import { BigNumber } from 'ethers';
import invariant from 'tiny-invariant';
import { useAccount } from 'wagmi';

import { TOKENS } from '@lido-sdk/constants';
import { useLidoSWR, useSDK } from '@lido-sdk/react';

import { config } from 'config';
import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { MAX_REQUESTS_COUNT } from 'features/withdrawals/withdrawals-constants';
import { useTxCostInUsd } from 'shared/hooks/txCost';
import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { encodeURLQuery } from 'utils/encodeURLQuery';
import { standardFetcher } from 'utils/standardFetcher';

import { useWithdrawalsContract } from './contract/useWithdrawalsContract';
import { RequestStatusClaimable } from '../types/request-status';

type UseRequestTxPriceOptions = {
  requestCount?: number;
  token: TOKENS;
  isApprovalFlow: boolean;
};

export const useRequestTxPrice = ({
  token,
  isApprovalFlow,
  requestCount,
}: UseRequestTxPriceOptions) => {
  const { chainId } = useSDK();
  const { contractRpc } = useWithdrawalsContract();
  const fallback =
    token === 'STETH'
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
    ? BigNumber.from(permitEstimateData?.gasLimit)
    : undefined;

  const { data: approvalFlowGasLimit, initialLoading: approvalLoading } =
    useLidoSWR(
      ['swr:request-gas-limit', debouncedRequestCount, chainId],
      async () => {
        try {
          invariant(chainId, 'chainId is required');
          invariant(contractRpc, 'contractRpc is required');
          const gasLimit = await contractRpc.estimateGas.requestWithdrawals(
            Array.from<BigNumber>({ length: debouncedRequestCount }).fill(
              BigNumber.from(100),
            ),
            config.ESTIMATE_ACCOUNT,
            { from: config.ESTIMATE_ACCOUNT },
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
    (isApprovalFlow ? approvalFlowGasLimit : permitGasLimit) ??
    fallback.mul(debouncedRequestCount);

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
  const { contractRpc } = useWithdrawalsContract();
  const { chainId } = useSDK();
  const { address } = useAccount();

  const requestCount = requests.length || 1;
  const debouncedSortedSelectedRequests = useDebouncedValue(requests, 2000);
  const { data: gasLimitResult, initialLoading: isEstimateLoading } =
    useLidoSWR(
      [
        'swr:claim-request-gas-limit',
        debouncedSortedSelectedRequests,
        address,
        chainId,
      ],
      async () => {
        if (
          !chainId ||
          !address ||
          !contractRpc ||
          debouncedSortedSelectedRequests.length === 0
        )
          return undefined;
        const sortedRequests = debouncedSortedSelectedRequests;

        const gasLimit = await contractRpc?.estimateGas
          .claimWithdrawals(
            sortedRequests.map((r) => r.id),
            sortedRequests.map((r) => r.hint),
            { from: address },
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
    : gasLimitResult ??
      config.WITHDRAWAL_QUEUE_CLAIM_GAS_LIMIT_DEFAULT.mul(requestCount);

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
