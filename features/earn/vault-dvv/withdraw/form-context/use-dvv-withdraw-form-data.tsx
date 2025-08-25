import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAwaiter } from 'shared/hooks/use-awaiter';
import { useDappStatus } from 'modules/web3/hooks/use-dapp-status';
import { useDVVPosition } from '../../hooks/use-dvv-position';
import { useDVVWithdrawLimit } from '../hooks/use-dvv-withdraw-limit';
import {
  DVVWithdrawalFormAsyncValidationContext,
  DVVWithdrawalFormValidationContext,
} from '../types';

export const useDVVWithdrawFormData = () => {
  const queryClient = useQueryClient();
  const balanceQuery = useDVVPosition();
  const { isDappActive } = useDappStatus();
  const withdrawLimitQuery = useDVVWithdrawLimit();

  const validationAsyncContextValue = useMemo<
    DVVWithdrawalFormAsyncValidationContext | undefined
  >(() => {
    if (!balanceQuery.data || !withdrawLimitQuery.data) {
      return undefined;
    }

    return {
      balance: balanceQuery.data.sharesBalance,
      isWithdrawalPaused: withdrawLimitQuery.data.isWithdrawalPaused,
    };
  }, [balanceQuery.data, withdrawLimitQuery.data]);

  const asyncContext = useAwaiter(validationAsyncContextValue).awaiter;

  const validationContext: DVVWithdrawalFormValidationContext = {
    asyncContext,
    isWalletActive: isDappActive,
  };

  const refetchData = useCallback(() => {
    const options = { cancelRefetch: true, throwOnError: false };

    return Promise.all([
      balanceQuery.refetch(options), // refetch all DVV related queries
      queryClient.refetchQueries({ queryKey: ['dvv'] }, options),
    ]);
  }, [balanceQuery, queryClient]);

  const isLoading = balanceQuery.isLoading;

  const isWithdrawalPaused = withdrawLimitQuery.data?.isWithdrawalPaused;

  return { validationContext, refetchData, isLoading, isWithdrawalPaused };
};
