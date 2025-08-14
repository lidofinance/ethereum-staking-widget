import {
  useStethBalance,
  useEthereumBalance,
  useWstethBalance,
  useWethBalance,
  useDappStatus,
} from 'modules/web3';
import { useCallback, useMemo } from 'react';

import { useGGVMaxDeposit } from './use-ggv-max-deposit';
import type {
  GGVDepositFormAsyncValidationContext,
  GGVDepositFormValidationContext,
  GGVDepositFormValues,
} from '../form-context/types';
import { useAwaiter } from 'shared/hooks/use-awaiter';
import { useQueryClient } from '@tanstack/react-query';

export const useGGVDepositFormData = () => {
  const queryClient = useQueryClient();
  const { isAccountActive } = useDappStatus();
  const ethBalanceQuery = useEthereumBalance();
  const stethBalanceQuery = useStethBalance();
  const wstethBalanceQuery = useWstethBalance();
  const wethBalanceQuery = useWethBalance();
  const ggvMaxDepositQuery = useGGVMaxDeposit();

  const asyncValidationContextValue:
    | GGVDepositFormAsyncValidationContext
    | undefined = useMemo(() => {
    if (
      ethBalanceQuery.data == undefined ||
      stethBalanceQuery.data == undefined ||
      wstethBalanceQuery.data == undefined ||
      wethBalanceQuery.data == undefined ||
      !ggvMaxDepositQuery.data
    ) {
      return undefined;
    }

    return {
      ETH: {
        balance: ethBalanceQuery.data,
        maxDeposit: ggvMaxDepositQuery.data.maxEthDeposit,
      },
      stETH: {
        balance: stethBalanceQuery.data,
        maxDeposit: ggvMaxDepositQuery.data.maxStethDeposit,
      },
      wstETH: {
        balance: wstethBalanceQuery.data,
        maxDeposit: ggvMaxDepositQuery.data.maxWstethDeposit,
      },
      wETH: {
        balance: wethBalanceQuery.data,
        maxDeposit: ggvMaxDepositQuery.data.maxWethDeposit,
      },
    };
  }, [
    ethBalanceQuery.data,
    ggvMaxDepositQuery.data,
    stethBalanceQuery.data,
    wethBalanceQuery.data,
    wstethBalanceQuery.data,
  ]);

  const asyncContext = useAwaiter(asyncValidationContextValue).awaiter;

  const validationContext: GGVDepositFormValidationContext = {
    isWalletActive: isAccountActive,
    asyncContext,
  };

  const refetchData = useCallback(
    (token: GGVDepositFormValues['token']) => {
      const tokenBalanceRefetch = {
        ['ETH']: ethBalanceQuery.refetch,
        ['stETH']: stethBalanceQuery.refetch,
        ['wstETH']: wstethBalanceQuery.refetch,
        ['wETH']: wethBalanceQuery.refetch,
      }[token];

      const options = { cancelRefetch: true, throwOnError: false };

      return Promise.all([
        tokenBalanceRefetch(options),
        // refetch all GGV related queries
        queryClient.refetchQueries({ queryKey: ['ggv'] }, options),
      ]);
    },
    [
      queryClient,
      ethBalanceQuery.refetch,
      stethBalanceQuery.refetch,
      wethBalanceQuery.refetch,
      wstethBalanceQuery.refetch,
    ],
  );

  const isLoading =
    ethBalanceQuery.isLoading ||
    stethBalanceQuery.isLoading ||
    wstethBalanceQuery.isLoading ||
    wethBalanceQuery.isLoading ||
    ggvMaxDepositQuery.isLoading;

  return {
    asyncValidationContextValue,
    validationContext,
    isLoading,
    refetchData,
  };
};
