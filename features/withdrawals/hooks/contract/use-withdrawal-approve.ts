import type { Address } from 'viem';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { STRATEGY_EAGER } from 'consts/react-query-strategies';
import { useLidoSDK } from 'modules/web3';
import { TOKENS_TO_WITHDRAWLS } from 'features/withdrawals/types/tokens-withdrawable';
import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';

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

  const debouncedAmount = useDebouncedValue(amount, 500);

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      'use-withdrawal-approve',
      withdraw.core.chainId,
      account,
      debouncedAmount.toString(),
      token,
    ],
    enabled,
    ...STRATEGY_EAGER,
    queryFn: () =>
      withdraw.approval.checkAllowance({
        amount: debouncedAmount,
        account,
        token,
      }),
  });

  return {
    allowance: data?.allowance,
    needsApprove: data?.needsApprove,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};
