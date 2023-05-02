import { useMemo } from 'react';
import { useLidoSWR, useSDK } from '@lido-sdk/react';
import getConfig from 'next/config';
import { standardFetcher } from 'utils/standardFetcher';
import {
  ESTIMATE_ACCOUNT,
  WITHDRAWAL_QUEUE_CLAIM_GAS_LIMIT_DEFAULT,
  WITHDRAWAL_QUEUE_REQUEST_STETH_PERMIT_GAS_LIMIT_DEFAULT,
  WITHDRAWAL_QUEUE_REQUEST_WSTETH_PERMIT_GAS_LIMIT_DEFAULT,
} from 'config';
import { MAX_REQUESTS_COUNT } from 'features/withdrawals/withdrawals-constants';

import { useWeb3 } from '@reef-knot/web3-react';
import { TOKENS } from '@lido-sdk/constants';

import { useWithdrawalsContract } from './contract/useWithdrawalsContract';
import { useTxCostInUsd } from 'shared/hooks/txCost';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';
import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { encodeURLQuery } from 'utils/encodeURLQuery';
import { BigNumber } from 'ethers';

type UseRequestTxPriceOptions = {
  requestCount?: number;
  token: TOKENS;
  isApprovalFlow: boolean;
};

const { serverRuntimeConfig } = getConfig();
const { basePath } = serverRuntimeConfig;

export const useRequestTxPrice = ({
  token,
  isApprovalFlow,
  requestCount,
}: UseRequestTxPriceOptions) => {
  const { chainId } = useSDK();
  const { contractRpc } = useWithdrawalsContract();
  // TODO add fallback for approval flow
  const fallback =
    token === 'STETH'
      ? WITHDRAWAL_QUEUE_REQUEST_STETH_PERMIT_GAS_LIMIT_DEFAULT
      : WITHDRAWAL_QUEUE_REQUEST_WSTETH_PERMIT_GAS_LIMIT_DEFAULT;

  const cappedRequestCount = Math.min(requestCount || 1, MAX_REQUESTS_COUNT);
  const debouncedRequestCount = useDebouncedValue(cappedRequestCount, 2000);

  const url = useMemo(() => {
    const urlBase = basePath ?? '';
    const params = encodeURLQuery({
      chainId,
      token,
      requestCount: debouncedRequestCount,
    });
    return `${urlBase}/api/estimate-withdrawal-gas?${params}`;
  }, [chainId, debouncedRequestCount, token]);

  const { data: permitEstimateData, initialLoading: permitLoading } =
    useLidoSWR<{ gasLimit: string }>(url, standardFetcher, {
      isPaused: () => !chainId || isApprovalFlow,
      revalidateIfStale: false,
      revalidateOnFocus: false,
    });

  const { data: approvalFlowGasLimit, initialLoading: approvalLoading } =
    useLidoSWR(
      ['swr:request-gas-limit', debouncedRequestCount, chainId],
      async () => {
        if (!chainId || !contractRpc || debouncedRequestCount === 0)
          return undefined;

        const gasLimit = await contractRpc?.estimateGas
          .requestWithdrawals(
            Array(debouncedRequestCount).fill(BigNumber.from(100)),
            ESTIMATE_ACCOUNT,
            { from: ESTIMATE_ACCOUNT },
          )
          .then((r) => r.toNumber())
          .catch((error) => {
            console.warn('Could not estimate gas for request', {
              requestCount: debouncedRequestCount,
              account: ESTIMATE_ACCOUNT,
              error,
            });
            return undefined;
          });

        return gasLimit;
      },
    );

  const gasLimit =
    (isApprovalFlow
      ? approvalFlowGasLimit
      : permitEstimateData && parseInt(permitEstimateData?.gasLimit)) ??
    fallback * debouncedRequestCount;

  const txPriceUsd = useTxCostInUsd(gasLimit);

  const loading =
    cappedRequestCount !== debouncedRequestCount ||
    (isApprovalFlow ? approvalLoading : permitLoading);

  console.log({
    isApprovalFlow,
    debouncedRequestCount,
    permitEstimateData: permitEstimateData?.gasLimit,
    approvalFlowGasLimit,
    requestCount,
  });

  return {
    loading,
    txPriceUsd,
    gasLimit,
  };
};

export const useClaimTxPrice = (): number | undefined => {
  const { contractRpc } = useWithdrawalsContract();
  const { claimSelection } = useClaimData();
  const { account, chainId } = useWeb3();

  const requestCount = claimSelection.selectedCount || 1;
  const debouncedSortedSelectedRequests = useDebouncedValue(
    claimSelection.sortedSelectedRequests,
    2000,
  );
  const { data: gasLimit, loading } = useLidoSWR(
    [
      'swr:claim-request-gas-limit',
      debouncedSortedSelectedRequests,
      account,
      chainId,
    ],
    async () => {
      if (
        !chainId ||
        !account ||
        !contractRpc ||
        debouncedSortedSelectedRequests.length === 0
      )
        return undefined;
      const sortedRequests = debouncedSortedSelectedRequests;

      const gasLimit = await contractRpc?.estimateGas
        .claimWithdrawals(
          sortedRequests.map((r) => r.id),
          sortedRequests.map((r) => r.hint),
          { from: account },
        )
        .catch((error) => {
          console.warn('Could not estimate gas for claim', {
            ids: sortedRequests.map((r) => r.id),
            account,
            error,
          });
          return undefined;
        });

      return gasLimit;
    },
  );

  const price = useTxCostInUsd(
    gasLimit?.toNumber() ??
      WITHDRAWAL_QUEUE_CLAIM_GAS_LIMIT_DEFAULT * requestCount,
  );
  if (loading) return undefined;
  return price;
};
