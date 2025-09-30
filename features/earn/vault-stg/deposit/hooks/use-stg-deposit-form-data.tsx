import { useCallback, useMemo } from 'react';
import { useAwaiter } from 'shared/hooks/use-awaiter';
import { useQueryClient } from '@tanstack/react-query';

import {
  useEthereumBalance,
  useWstethBalance,
  useWethBalance,
  useDappStatus,
} from 'modules/web3';
import {
  STGDepositFormAsyncValidationContext,
  STGDepositFormValidationContext,
  STGDepositFormValues,
} from '../form-context/types';

export const useSTGDepositFormData = () => {
  const queryClient = useQueryClient();
  const { isAccountActive } = useDappStatus();
  const ethBalanceQuery = useEthereumBalance();
  const wstethBalanceQuery = useWstethBalance();
  const wethBalanceQuery = useWethBalance();

  const asyncValidationContextValue:
    | STGDepositFormAsyncValidationContext
    | undefined = useMemo(() => {
    if (
      ethBalanceQuery.data == undefined ||
      wstethBalanceQuery.data == undefined ||
      wethBalanceQuery.data == undefined
    ) {
      return undefined;
    }

    return {
      ETH: {
        balance: ethBalanceQuery.data,
      },
      wstETH: {
        balance: wstethBalanceQuery.data,
      },
      wETH: {
        balance: wethBalanceQuery.data,
      },
    };
  }, [ethBalanceQuery.data, wethBalanceQuery.data, wstethBalanceQuery.data]);

  const asyncContext = useAwaiter(asyncValidationContextValue).awaiter;

  const validationContext: STGDepositFormValidationContext = {
    isWalletActive: isAccountActive,
    asyncContext,
  };

  const refetchData = useCallback(
    (token: STGDepositFormValues['token']) => {
      const tokenBalanceRefetch = {
        ['ETH']: ethBalanceQuery.refetch,
        ['wstETH']: wstethBalanceQuery.refetch,
        ['wETH']: wethBalanceQuery.refetch,
      }[token];

      const options = { cancelRefetch: true, throwOnError: false };

      return Promise.all([
        tokenBalanceRefetch(options),
        // refetch all STG related queries
        queryClient.refetchQueries({ queryKey: ['stg'] }, options),
      ]);
    },
    [
      queryClient,
      ethBalanceQuery.refetch,
      wethBalanceQuery.refetch,
      wstethBalanceQuery.refetch,
    ],
  );

  const isLoading =
    ethBalanceQuery.isLoading ||
    wstethBalanceQuery.isLoading ||
    wethBalanceQuery.isLoading;

  return {
    asyncValidationContextValue,
    validationContext,
    isLoading,
    refetchData,
  };
};
