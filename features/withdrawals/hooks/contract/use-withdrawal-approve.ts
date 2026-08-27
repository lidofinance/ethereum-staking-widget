import type { Address } from 'viem';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { STRATEGY_EAGER } from 'consts/react-query-strategies';
import { useLidoSDK } from 'modules/web3';
import { TOKENS_TO_WITHDRAWLS } from 'features/withdrawals/types/tokens-withdrawable';

export type UseApproveResponse = {
  allowance?: bigint;
  needsApprove?: boolean;
  isLoading: boolean;
  isFetching: boolean;
} & Pick<UseQueryResult, 'error' | 'refetch'>;

export const useWithdrawalApprove = (
  amount: bigint,
  token: TOKENS_TO_WITHDRAWLS,
  account?: Address,
): UseApproveResponse => {
  const { withdraw } = useLidoSDK();

  const enabled = !!(withdraw.core.chainId && account && token);

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['use-withdrawal-approve', withdraw.core.chainId, token],
    enabled,
    ...STRATEGY_EAGER,
    queryFn: () =>
      withdraw.approval.getAllowance({
        account,
        token,
      }),
    // to keep the previous data during fetching new data
    placeholderData: (prev) => prev,
  });

  return {
    allowance: data,
    needsApprove: data !== undefined ? data < amount : undefined,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};
