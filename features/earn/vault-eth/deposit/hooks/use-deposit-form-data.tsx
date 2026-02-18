import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useAwaiter } from 'shared/hooks/use-awaiter';
import {
  useEthereumBalance,
  useWstethBalance,
  useWethBalance,
  useDappStatus,
} from 'modules/web3';
import { MELLOW_VAULTS_QUERY_SCOPE } from 'modules/mellow-meta-vaults/consts';

import {
  ETHDepositFormAsyncValidationContext,
  ETHDepositFormValidationContext,
  ETHDepositFormValues,
} from '../form-context/types';
import { ETH_VAULT_QUERY_SCOPE } from '../../consts';

export const useEthVaultDepositFormData = () => {
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
    };
  }, [ethBalanceQuery.data, wstethBalanceQuery.data, wethBalanceQuery.data]);

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
      }[token];

      const options = { cancelRefetch: true, throwOnError: false };

      return Promise.all([
        tokenBalanceRefetch(options),
        // refetch all Eth Vault related queries
        queryClient.refetchQueries(
          { queryKey: [ETH_VAULT_QUERY_SCOPE] },
          options,
        ),
        // The form state is not reloading without refetching MELLOW_VAULTS_QUERY_SCOPE because we are using it during queries
        // TODO: think about better state management for vault data to avoid unnecessary queries refetching
        queryClient.refetchQueries(
          { queryKey: [MELLOW_VAULTS_QUERY_SCOPE] },
          options,
        ),
      ]);
    },
    [
      ethBalanceQuery.refetch,
      wstethBalanceQuery.refetch,
      wethBalanceQuery.refetch,
      queryClient,
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
