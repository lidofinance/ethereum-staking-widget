import { useCallback, useMemo } from 'react';
import { useAwaiter } from 'shared/hooks/use-awaiter';
import { useQueryClient } from '@tanstack/react-query';

import { useDappStatus } from 'modules/web3';
import { useSTGPosition } from '../../hooks/use-stg-position';
import {
  STGWithdrawFormAsyncValidationContext,
  STGWithdrawFormValidationContext,
} from '../form-context/types';

export const useSTGWithdrawFormData = () => {
  const queryClient = useQueryClient();
  const { isAccountActive } = useDappStatus();
  const { strethSharesBalance, isLoading } = useSTGPosition();

  const asyncValidationContextValue:
    | STGWithdrawFormAsyncValidationContext
    | undefined = useMemo(() => {
    if (strethSharesBalance == undefined) {
      return undefined;
    }

    return {
      strETH: {
        balance: strethSharesBalance,
      },
    };
  }, [strethSharesBalance]);

  const asyncContext = useAwaiter(asyncValidationContextValue).awaiter;

  const validationContext: STGWithdrawFormValidationContext = {
    isWalletActive: isAccountActive,
    asyncContext,
  };

  const refetchData = useCallback(() => {
    const options = { cancelRefetch: true, throwOnError: false };

    return Promise.all([
      // refetch all STG related queries
      queryClient.refetchQueries({ queryKey: ['stg'] }, options),
    ]);
  }, [queryClient]);

  return {
    asyncValidationContextValue,
    validationContext,
    isLoading,
    refetchData,
  };
};
