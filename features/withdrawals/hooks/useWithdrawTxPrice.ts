import { useMemo } from 'react';
import { BigNumber } from 'ethers';
import invariant from 'tiny-invariant';

import { TOKENS } from '@lido-sdk/constants';
import { useLidoSWR } from '@lido-sdk/react';

import { useDappStatus } from 'modules/web3';
import { config } from 'config';
import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { MAX_REQUESTS_COUNT } from 'features/withdrawals/withdrawals-constants';
import { useTxCostInUsd } from 'shared/hooks/use-tx-cost-in-usd';
import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { encodeURLQuery } from 'utils/encodeURLQuery';
import { standardFetcher } from 'utils/standardFetcher';

import { RequestStatusClaimable } from '../types/request-status';
import { useWithdrawalsContract } from './contract/useWithdrawalsContract';

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
  const { chainId } = useDappStatus();
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
    ? permitEstimateData?.gasLimit
    : undefined;

  const { data: approvalFlowGasLimit, initialLoading: approvalLoading } =
    useLidoSWR(
      ['swr:request-gas-limit', debouncedRequestCount, chainId],
      async () => {
        try {
          invariant(chainId, 'chainId is required');
          invariant(contractRpc, 'contractRpc is required');
          const gasLimit = await contractRpc.estimateGas.requestWithdrawals(
            // TODO: NEW SDK (bigint)
            Array.from<BigNumber>({ length: debouncedRequestCount }).fill(
              BigNumber.from(100),
            ),
            config.ESTIMATE_ACCOUNT,
            { from: config.ESTIMATE_ACCOUNT },
          );
          // TODO: NEW SDK (bigint)
          return gasLimit?.toBigInt();
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
    fallback * BigInt(debouncedRequestCount);

  const { txCostUsd: txPriceUsd, initialLoading: isTxCostLoading } =
    // TODO: NEW SDK bigint
    useTxCostInUsd(gasLimit as bigint);

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
  const { contractRpc } = useWithdrawalsContract();

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

        // TODO: NEW SDK (bigint)
        return gasLimit?.toBigInt();
      },
      STRATEGY_LAZY,
    );

  const gasLimit = isEstimateLoading
    ? undefined
    : gasLimitResult ??
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
