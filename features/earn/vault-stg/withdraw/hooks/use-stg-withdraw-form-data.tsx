import { useCallback, useMemo } from 'react';
import { useAwaiter } from 'shared/hooks/use-awaiter';
import { useQueryClient } from '@tanstack/react-query';

import { useDappStatus } from 'modules/web3';
import { useSTGPosition } from '../../hooks/use-stg-position';
import {
  STGWithdrawFormAsyncValidationContext,
  STGWithdrawFormValidationContext,
  STGWithdrawFormValues,
} from '../form-context/types';

export const useSTGWithdrawFormData = () => {
  const queryClient = useQueryClient();
  const { isAccountActive } = useDappStatus();
  const { sharesBalance } = useSTGPosition();

  const asyncValidationContextValue:
    | STGWithdrawFormAsyncValidationContext
    | undefined = useMemo(() => {
    if (sharesBalance == undefined) {
      return undefined;
    }

    return {
      strETH: {
        balance: sharesBalance,
      },
    };
  }, [sharesBalance]);

  const asyncContext = useAwaiter(asyncValidationContextValue).awaiter;

  const validationContext: STGWithdrawFormValidationContext = {
    isWalletActive: isAccountActive,
    asyncContext,
  };

  const refetchData = useCallback(
    (_token: STGWithdrawFormValues['token']) => {
      const options = { cancelRefetch: true, throwOnError: false };

      return Promise.all([
        // refetch all STG related queries
        queryClient.refetchQueries({ queryKey: ['stg'] }, options),
      ]);
    },
    [queryClient],
  );

  const isLoading = false; // TODO: Add proper loading state

  return {
    asyncValidationContextValue,
    validationContext,
    isLoading,
    refetchData,
  };
};
