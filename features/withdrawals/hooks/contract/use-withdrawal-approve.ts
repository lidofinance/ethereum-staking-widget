import { Address } from 'viem';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { STRATEGY_EAGER } from 'consts/react-query-strategies';
import { useLidoSDK } from 'modules/web3';
import { TOKENS_WITHDRAWABLE } from 'features/withdrawals/types/tokens-withdrawable';

export type UseApproveResponse = {
  allowance?: bigint;
  needsApprove?: boolean;
  initialLoading: boolean;
  loading: boolean;
} & Pick<UseQueryResult, 'error' | 'refetch'>;

export const useWithdrawalApprove = (
  amount: bigint,
  token: TOKENS_WITHDRAWABLE,
  account?: Address,
): UseApproveResponse => {
  const { withdraw } = useLidoSDK();

  const enabled = !!(
    withdraw.core.chainId &&
    account &&
    token &&
    amount > BigInt('0')
  );

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      'use-withdrawal-approve',
      withdraw.core.chainId,
      amount.toString(),
      token,
    ],
    enabled,
    ...STRATEGY_EAGER,
    queryFn: () =>
      withdraw.approval.checkAllowance({
        amount,
        account,
        token,
      }),
  });

  return {
    allowance: data?.allowance,
    needsApprove: data?.needsApprove,
    initialLoading: isLoading && !data && !error,
    loading: isLoading || isFetching,
    error,
    refetch,
  };
};
