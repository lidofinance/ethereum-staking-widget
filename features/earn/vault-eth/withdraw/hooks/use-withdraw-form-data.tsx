import { useCallback, useMemo } from 'react';
import { useAwaiter } from 'shared/hooks/use-awaiter';
import { useQueryClient } from '@tanstack/react-query';

import { useDappStatus } from 'modules/web3';
import { useEthVaultPosition } from '../../hooks/use-position';
import {
  EthVaultWithdrawFormAsyncValidationContext,
  EthVaultWithdrawFormValidationContext,
} from '../form-context/types';
import { ETH_VAULT_QUERY_KEY, ETH_VAULT_TOKEN_SYMBOL } from '../../consts';

export const useEthVaultWithdrawFormData = () => {
  const queryClient = useQueryClient();
  const { isAccountActive } = useDappStatus();
  const { earnethSharesBalance, isLoading } = useEthVaultPosition();

  const asyncValidationContextValue:
    | EthVaultWithdrawFormAsyncValidationContext
    | undefined = useMemo(() => {
    if (earnethSharesBalance == undefined) {
      return undefined;
    }

    return {
      [ETH_VAULT_TOKEN_SYMBOL]: {
        balance: earnethSharesBalance,
      },
    };
  }, [earnethSharesBalance]);

  const asyncContext = useAwaiter(asyncValidationContextValue).awaiter;

  const validationContext: EthVaultWithdrawFormValidationContext = {
    isWalletActive: isAccountActive,
    asyncContext,
  };

  const refetchData = useCallback(() => {
    const options = { cancelRefetch: true, throwOnError: false };

    return Promise.all([
      // refetch all vault related queries
      queryClient.refetchQueries({ queryKey: [ETH_VAULT_QUERY_KEY] }, options),
    ]);
  }, [queryClient]);

  return {
    asyncValidationContextValue,
    validationContext,
    isLoading,
    refetchData,
  };
};
