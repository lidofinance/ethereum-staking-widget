import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { config } from 'config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { MAX_REQUESTS_COUNT } from 'features/withdrawals/withdrawals-constants';
import { useDappStatus, useLidoSDK } from 'modules/web3';

import { useTxCostInUsd } from 'shared/hooks/use-tx-cost-in-usd';
import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';

import { encodeURLQuery } from 'utils/encodeURLQuery';
import { standardFetcher } from 'utils/standardFetcher';

import { TOKENS_TO_WITHDRAWLS } from '../types/tokens-withdrawable';

type UseRequestTxPriceOptions = {
  requestCount?: number;
  token: TOKENS_TO_WITHDRAWLS;
  isApprovalFlow: boolean;
};

export const useWithdrawRequestTxPrice = ({
  token,
  isApprovalFlow,
  requestCount,
}: UseRequestTxPriceOptions) => {
  const { chainId } = useDappStatus();
  const { withdraw } = useLidoSDK();

  const fallback =
    token === TOKENS_TO_WITHDRAWLS.stETH
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

  const { data: permitGasLimit, isLoading: permitLoading } = useQuery<
    { gasLimit: number },
    Error,
    bigint | undefined
  >({
    queryKey: ['permit-estimate', url],
    enabled: !!chainId && !isApprovalFlow,
    ...STRATEGY_LAZY,
    queryFn: () => standardFetcher<{ gasLimit: number }>(url),
    select: (permitEstimateData) =>
      permitEstimateData
        ? BigInt(permitEstimateData.gasLimit || '0')
        : undefined,
  });

  const { data: approvalFlowGasLimit, isLoading: approvalLoading } =
    useQuery<bigint>({
      queryKey: [
        'approval-flow-gas-limit',
        debouncedRequestCount,
        withdraw.core.chainId,
      ],
      enabled: !!chainId && isApprovalFlow,
      ...STRATEGY_LAZY,
      queryFn: async () => {
        const contract = await withdraw.contract.getContractWithdrawalQueue();
        const requestsStub = Array.from<bigint>({
          length: debouncedRequestCount,
        }).fill(100n);

        return await contract.estimateGas.requestWithdrawals(
          [requestsStub, config.ESTIMATE_ACCOUNT],
          {
            account: config.ESTIMATE_ACCOUNT,
          },
        );
      },
    });

  const gasLimit =
    (isApprovalFlow ? approvalFlowGasLimit : permitGasLimit) ??
    fallback * BigInt(debouncedRequestCount);

  const { txCostUsd: txPriceUsd, isLoading: isTxCostLoading } =
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
