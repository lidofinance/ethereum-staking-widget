import { useCallback, useMemo } from 'react';
import { useAwaiter } from 'shared/hooks/use-awaiter';
import { useQueryClient } from '@tanstack/react-query';

import { useDappStatus } from 'modules/web3';
import { MELLOW_VAULTS_QUERY_SCOPE } from 'modules/mellow-meta-vaults';
import { useUsdVaultPosition } from '../../hooks/use-position';
import {
  UsdVaultWithdrawFormAsyncValidationContext,
  UsdVaultWithdrawFormValidationContext,
} from '../form-context/types';
import { USD_VAULT_QUERY_SCOPE, USD_VAULT_TOKEN_SYMBOL } from '../../consts';

export const useUsdVaultWithdrawFormData = () => {
  const queryClient = useQueryClient();
  const { isAccountActive } = useDappStatus();
  const { earnusdSharesBalance, isLoading } = useUsdVaultPosition();

  const asyncValidationContextValue:
    | UsdVaultWithdrawFormAsyncValidationContext
    | undefined = useMemo(() => {
    if (earnusdSharesBalance == undefined) {
      return undefined;
    }

    return {
      [USD_VAULT_TOKEN_SYMBOL]: {
        balance: earnusdSharesBalance,
      },
    };
  }, [earnusdSharesBalance]);

  const asyncContext = useAwaiter(asyncValidationContextValue).awaiter;

  const validationContext: UsdVaultWithdrawFormValidationContext = {
    isWalletActive: isAccountActive,
    asyncContext,
  };

  const refetchData = useCallback(() => {
    const options = { cancelRefetch: true, throwOnError: false };

    return Promise.all([
      // refetch all vault related queries
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
  }, [queryClient]);

  return {
    asyncValidationContextValue,
    validationContext,
    isLoading,
    refetchData,
  };
};
