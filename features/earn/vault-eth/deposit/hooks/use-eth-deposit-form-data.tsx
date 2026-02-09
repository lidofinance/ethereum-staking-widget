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
  ETHDepositFormAsyncValidationContext,
  ETHDepositFormValidationContext,
  ETHDepositFormValues,
} from '../form-context/types';

export const useETHDepositFormData = () => {
  const queryClient = useQueryClient();
  const { isAccountActive } = useDappStatus();
  const ethBalanceQuery = useEthereumBalance();
  const wstethBalanceQuery = useWstethBalance();
  const wethBalanceQuery = useWethBalance();

  const asyncValidationContextValue:
    | ETHDepositFormAsyncValidationContext
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
      GG: {
        balance: 0n, // TODO: add balance
      },
      DVstETH: {
        balance: 0n, // TODO: add balance
      },
      strETH: {
        balance: 0n, // TODO: add balance
      },
    };
  }, [ethBalanceQuery.data, wethBalanceQuery.data, wstethBalanceQuery.data]);

  const asyncContext = useAwaiter(asyncValidationContextValue).awaiter;

  const validationContext: ETHDepositFormValidationContext = {
    isWalletActive: isAccountActive,
    asyncContext,
  };

  const refetchData = useCallback(
    (token: ETHDepositFormValues['token']) => {
      const tokenBalanceRefetch = {
        ['ETH']: ethBalanceQuery.refetch,
        ['wstETH']: wstethBalanceQuery.refetch,
        ['wETH']: wethBalanceQuery.refetch,
        ['GG']: () => void 0, // TODO: add refetch
        ['DVstETH']: () => void 0, // TODO: add refetch
        ['strETH']: () => void 0, // TODO: add refetch
      }[token];

      const options = { cancelRefetch: true, throwOnError: false };

      return Promise.all([
        tokenBalanceRefetch(options),
        // refetch all ETH related queries
        queryClient.refetchQueries({ queryKey: ['earn', 'eth'] }, options), // TODO: check query key
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
