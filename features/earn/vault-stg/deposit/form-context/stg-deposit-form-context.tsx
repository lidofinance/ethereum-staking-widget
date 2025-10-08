import React, { createContext, useContext, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import invariant from 'tiny-invariant';

import {
  FormControllerContext,
  FormControllerContextValueType,
} from 'shared/hook-form/form-controller';
import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';
import { useDappStatus } from 'modules/web3/hooks/use-dapp-status';
import {
  STGDepositFormDataContextValue,
  STGDepositFormValidatedValues,
} from './types';
import { useSTGDeposit } from '../hooks/use-stg-deposit';
import { useSTGDepositFormData } from '../hooks/use-stg-deposit-form-data';
import { STGDepositFormValidationResolver } from './validation';
import { useSTGAvailable } from '../../hooks/use-stg-available';
import { useDepositRequest } from '../hooks';

const STGDepositFormDataContext =
  createContext<STGDepositFormDataContextValue | null>(null);
STGDepositFormDataContext.displayName = 'STGDepositFormDataContext';

export const useSTGDepositForm = () => {
  const context = useContext(STGDepositFormDataContext);
  invariant(
    context,
    '[useSTGDepositForm] STGDepositFormDataContext is used outside provider',
  );
  return context;
};

export const STGDepositFormProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  // Wallet state
  const { isDappActive, isWalletConnected } = useDappStatus();
  const { isSTGAvailable, isDepositEnabled } = useSTGAvailable();

  const {
    validationContext,
    asyncValidationContextValue,
    refetchData,
    isLoading,
  } = useSTGDepositFormData();

  // Retry event helper
  const { retryEvent } = useFormControllerRetry();
  // Deposit function
  const { deposit } = useSTGDeposit(retryEvent.fire);

  const formObject = useForm({
    defaultValues: { amount: null, token: 'ETH' },
    disabled:
      (isWalletConnected && !isDappActive) ||
      (isSTGAvailable && !isDepositEnabled),
    criteriaMode: 'firstError',
    mode: 'onChange',
    context: validationContext,
    resolver: STGDepositFormValidationResolver,
  });

  const token = formObject.watch('token');

  const depositRequest = useDepositRequest(token);

  const formControllerValue = useMemo(
    (): FormControllerContextValueType<any> => ({
      onSubmit: async (values: STGDepositFormValidatedValues) => {
        const result = await deposit(values);
        if (result) {
          await refetchData(values.token);
        }
        return result;
      },
      onReset: (values: STGDepositFormValidatedValues) => {
        formObject.reset({ amount: null, token: values.token });
      },
      retryEvent,
    }),
    [deposit, formObject, refetchData, retryEvent],
  );

  const contextValue = useMemo<STGDepositFormDataContextValue>(() => {
    const tokenBalance = asyncValidationContextValue?.[token];
    const maxAmount =
      tokenBalance?.balance != undefined ? tokenBalance?.balance : undefined;
    return {
      maxAmount,
      token,
      isLoading,
      // deposit is locked if the last request is not yet claimable
      isDepositLockedForCurrentToken:
        !!depositRequest && !depositRequest.isClaimable,
    };
  }, [asyncValidationContextValue, depositRequest, isLoading, token]);

  return (
    <FormProvider {...formObject}>
      <STGDepositFormDataContext.Provider value={contextValue}>
        <FormControllerContext.Provider value={formControllerValue as any}>
          {children}
        </FormControllerContext.Provider>
      </STGDepositFormDataContext.Provider>
    </FormProvider>
  );
};
