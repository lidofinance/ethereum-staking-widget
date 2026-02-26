import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useAwaiter } from 'shared/hooks/use-awaiter';
import { useDappStatus, useStablecoinBalance } from 'modules/web3';
import { MELLOW_VAULTS_QUERY_SCOPE } from 'modules/mellow-meta-vaults/consts';
import { TOKEN_SYMBOLS } from 'consts/tokens';

import {
  USDDepositFormAsyncValidationContext,
  USDDepositFormValidationContext,
  USDDepositFormValues,
} from '../form-context/types';
import { USD_VAULT_QUERY_SCOPE } from '../../consts';

export const useUsdVaultDepositFormData = () => {
  const queryClient = useQueryClient();
  const { isAccountActive, address } = useDappStatus();
  const usdcBalanceQuery = useStablecoinBalance({
    account: address,
    token: TOKEN_SYMBOLS.usdc,
  });
  const usdtBalanceQuery = useStablecoinBalance({
    account: address,
    token: TOKEN_SYMBOLS.usdt,
  });

  const asyncValidationContextValue:
    | USDDepositFormAsyncValidationContext
    | undefined = useMemo(() => {
    if (
      usdcBalanceQuery.data == undefined ||
      usdtBalanceQuery.data == undefined
    ) {
      return undefined;
    }

    return {
      [TOKEN_SYMBOLS.usdc]: {
        balance: usdcBalanceQuery.data,
      },
      [TOKEN_SYMBOLS.usdt]: {
        balance: usdtBalanceQuery.data,
      },
    };
  }, [usdcBalanceQuery.data, usdtBalanceQuery.data]);

  const asyncContext = useAwaiter(asyncValidationContextValue).awaiter;

  const validationContext: USDDepositFormValidationContext = {
    isWalletActive: isAccountActive,
    asyncContext,
  };

  const refetchData = useCallback(
    (token: USDDepositFormValues['token']) => {
      const tokenBalanceRefetch = {
        [TOKEN_SYMBOLS.usdc]: usdcBalanceQuery.refetch,
        [TOKEN_SYMBOLS.usdt]: usdtBalanceQuery.refetch,
      }[token];

      const options = { cancelRefetch: true, throwOnError: false };

      return Promise.all([
        tokenBalanceRefetch(options),
        // refetch all Usd Vault related queries
        queryClient.refetchQueries(
          { queryKey: [USD_VAULT_QUERY_SCOPE] },
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
    [usdcBalanceQuery.refetch, usdtBalanceQuery.refetch, queryClient],
  );

  const isLoading = usdcBalanceQuery.isLoading || usdtBalanceQuery.isLoading;

  return {
    asyncValidationContextValue,
    validationContext,
    isLoading,
    refetchData,
  };
};
