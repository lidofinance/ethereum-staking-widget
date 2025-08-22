import { useCallback, useMemo } from 'react';

import {
  useDappStatus,
  useEthereumBalance,
  useWethBalance,
} from 'modules/web3';
import { useDVVDepositLimit } from '../hooks/use-dvv-deposit-limit';
import {
  DVVDepositFormAsyncValidationContext,
  DVVDepositFormValidationContext,
  DVVDepositFormValues,
} from '../types';
import { useAwaiter } from 'shared/hooks/use-awaiter';
import { useQueryClient } from '@tanstack/react-query';

export const useDVVDepositFormData = () => {
  const queryClient = useQueryClient();
  const { isAccountActive } = useDappStatus();
  const ethBalanceQuery = useEthereumBalance();
  const wethBalanceQuery = useWethBalance();
  const depositLimitQuery = useDVVDepositLimit();

  const asyncValidationContextValue:
    | DVVDepositFormAsyncValidationContext
    | undefined = useMemo(() => {
    if (
      ethBalanceQuery.data == undefined ||
      wethBalanceQuery.data == undefined ||
      !depositLimitQuery.data
    ) {
      return undefined;
    }

    const maxDeposit = depositLimitQuery.data.maxDepositETH;

    return {
      ETH: {
        balance: ethBalanceQuery.data,
        maxDeposit,
      },
      wETH: {
        balance: wethBalanceQuery.data,
        maxDeposit,
      },
    };
  }, [depositLimitQuery.data, ethBalanceQuery.data, wethBalanceQuery.data]);

  const asyncContext = useAwaiter(asyncValidationContextValue).awaiter;

  const validationContext: DVVDepositFormValidationContext = {
    isWalletActive: isAccountActive,
    asyncContext,
  };

  const refetchData = useCallback(
    (token: DVVDepositFormValues['token']) => {
      const tokenBalanceRefetch = {
        ['ETH']: ethBalanceQuery.refetch,
        ['wETH']: wethBalanceQuery.refetch,
      }[token];

      const options = { cancelRefetch: true, throwOnError: false };

      return Promise.all([
        tokenBalanceRefetch(options),
        // refetch all DVV related queries
        queryClient.refetchQueries({ queryKey: ['dvv'] }, options),
      ]);
    },
    [queryClient, ethBalanceQuery.refetch, wethBalanceQuery.refetch],
  );

  const isLoading =
    ethBalanceQuery.isLoading ||
    wethBalanceQuery.isLoading ||
    depositLimitQuery.isLoading;

  return {
    depositLimitQuery,
    validationContext,
    asyncValidationContextValue,
    refetchData,
    isLoading,
  };
};
