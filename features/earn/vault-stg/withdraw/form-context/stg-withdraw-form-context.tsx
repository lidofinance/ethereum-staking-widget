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
  STGWithdrawFormDataContextValue,
  STGWithdrawFormValidatedValues,
} from './types';
import { useSTGWithdraw } from '../hooks/use-stg-withdraw';
import { useSTGWithdrawFormData } from '../hooks/use-stg-withdraw-form-data';
import { STGWithdrawFormValidationResolver } from './validation';

const STGWithdrawFormDataContext =
  createContext<STGWithdrawFormDataContextValue | null>(null);
STGWithdrawFormDataContext.displayName = 'STGWithdrawFormDataContext';

export const useSTGWithdrawForm = () => {
  const context = useContext(STGWithdrawFormDataContext);
  invariant(
    context,
    '[useSTGWithdrawForm] STGWithdrawFormDataContext is used outside provider',
  );
  return context;
};

export const STGWithdrawFormProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { isDappActive, isWalletConnected } = useDappStatus();

  const {
    validationContext,
    asyncValidationContextValue,
    refetchData,
    isLoading,
  } = useSTGWithdrawFormData();

  const { retryEvent } = useFormControllerRetry();
  const { withdrawSTG } = useSTGWithdraw(retryEvent.fire);

  const formObject = useForm({
    defaultValues: { amount: null, token: 'strETH' as const },
    disabled: isWalletConnected && !isDappActive,
    criteriaMode: 'firstError',
    mode: 'onChange',
    context: validationContext,
    resolver: STGWithdrawFormValidationResolver,
  });

  const token = formObject.watch('token');

  const formControllerValue = useMemo(
    (): FormControllerContextValueType<any> => ({
      onSubmit: async (values: STGWithdrawFormValidatedValues) => {
        const result = await withdrawSTG(values);
        if (result) {
          await refetchData(values.token);
        }
        return result;
      },
      onReset: (values: STGWithdrawFormValidatedValues) => {
        formObject.reset({ amount: null, token: values.token });
      },
      retryEvent,
    }),
    [withdrawSTG, formObject, refetchData, retryEvent],
  );

  const contextValue = useMemo<STGWithdrawFormDataContextValue>(() => {
    const tokenBalance = asyncValidationContextValue?.[token];
    const maxAmount =
      tokenBalance?.balance != undefined ? tokenBalance?.balance : undefined;
    return {
      maxAmount,
      token,
      isLoading,
    };
  }, [asyncValidationContextValue, isLoading, token]);

  return (
    <FormProvider {...formObject}>
      <STGWithdrawFormDataContext.Provider value={contextValue}>
        <FormControllerContext.Provider value={formControllerValue as any}>
          {children}
        </FormControllerContext.Provider>
      </STGWithdrawFormDataContext.Provider>
    </FormProvider>
  );
};
