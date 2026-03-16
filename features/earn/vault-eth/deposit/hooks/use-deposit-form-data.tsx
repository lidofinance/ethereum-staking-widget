import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useAwaiter } from 'shared/hooks/use-awaiter';
import {
  useEthereumBalance,
  useWstethBalance,
  useWethBalance,
  useDappStatus,
  useStethBalance,
} from 'modules/web3';
import { MELLOW_VAULTS_QUERY_SCOPE } from 'modules/mellow-meta-vaults/consts';

import {
  ETHDepositFormAsyncValidationContext,
  ETHDepositFormValidationContext,
  ETHDepositFormValues,
} from '../form-context/types';
import { ETH_VAULT_QUERY_SCOPE } from '../../consts';
import { TOKEN_SYMBOLS } from 'consts/tokens';

export const useEthVaultDepositFormData = () => {
  const queryClient = useQueryClient();
  const { isAccountActive } = useDappStatus();
  const ethBalanceQuery = useEthereumBalance();
  const wstethBalanceQuery = useWstethBalance();
  const wethBalanceQuery = useWethBalance();
  const stethBalanceQuery = useStethBalance();

  const asyncValidationContextValue:
    | ETHDepositFormAsyncValidationContext
    | undefined = useMemo(() => {
    if (
      ethBalanceQuery.data == undefined ||
      wstethBalanceQuery.data == undefined ||
      wethBalanceQuery.data == undefined ||
      stethBalanceQuery.data == undefined
    ) {
      return undefined;
    }

    return {
      [TOKEN_SYMBOLS.eth]: {
        balance: ethBalanceQuery.data,
      },
      [TOKEN_SYMBOLS.wsteth]: {
        balance: wstethBalanceQuery.data,
      },
      [TOKEN_SYMBOLS.weth]: {
        balance: wethBalanceQuery.data,
      },
      [TOKEN_SYMBOLS.steth]: {
        balance: stethBalanceQuery.data,
      },
    };
  }, [
    ethBalanceQuery.data,
    wstethBalanceQuery.data,
    wethBalanceQuery.data,
    stethBalanceQuery.data,
  ]);

  const asyncContext = useAwaiter(asyncValidationContextValue).awaiter;

  const validationContext: ETHDepositFormValidationContext = {
    isWalletActive: isAccountActive,
    asyncContext,
  };

  const refetchData = useCallback(
    (tokenFormValue: ETHDepositFormValues['token']) => {
      const tokenBalanceRefetch =
        {
          [TOKEN_SYMBOLS.eth]: ethBalanceQuery.refetch,
          [TOKEN_SYMBOLS.wsteth]: wstethBalanceQuery.refetch,
          [TOKEN_SYMBOLS.weth]: wethBalanceQuery.refetch,
          [TOKEN_SYMBOLS.steth]: stethBalanceQuery.refetch,
        }[tokenFormValue] ??
        // fallback for upgradable tokens,
        // which are not part of the form validation context and don't require refetching on deposit page after upgrade
        (() => Promise.resolve());

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
      stethBalanceQuery.refetch,
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
