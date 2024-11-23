import { Address } from 'viem';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { STRATEGY_EAGER } from 'consts/react-query-strategies';
import { useLidoSDK, ZERO } from 'modules/web3';
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

  const enabled = !!(
    withdraw.core.chainId &&
    account &&
    token &&
    amount > ZERO
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
    isLoading,
    isFetching,
    error,
    refetch,
  };
};
