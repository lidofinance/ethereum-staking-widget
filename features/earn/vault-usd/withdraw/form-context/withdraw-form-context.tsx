import React, { createContext, useContext, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import invariant from 'tiny-invariant';

import {
  FormControllerContext,
  FormControllerContextValueType,
} from 'shared/hook-form/form-controller';
import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';
import { useDappStatus } from 'modules/web3/hooks/use-dapp-status';
import { useUsdVaultWithdraw } from '../hooks/use-withdraw';
import { useUsdVaultWithdrawFormData } from '../hooks/use-withdraw-form-data';
import { USD_VAULT_TOKEN_SYMBOL } from '../../consts';
import { UsdVaultWithdrawFormValidationResolver } from './validation';
import type {
  UsdVaultWithdrawFormDataContextValue,
  UsdVaultWithdrawFormValidatedValues,
} from './types';

const USDWithdrawFormDataContext =
  createContext<UsdVaultWithdrawFormDataContextValue | null>(null);
USDWithdrawFormDataContext.displayName = 'USDWithdrawFormDataContext';

export const useUsdVaultWithdrawForm = () => {
  const context = useContext(USDWithdrawFormDataContext);
  invariant(
    context,
    '[useUSDWithdrawForm] USDWithdrawFormDataContext is used outside provider',
  );
  return context;
};

export const UsdVaultWithdrawFormProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { isDappActive, isWalletConnected } = useDappStatus();

  const {
    validationContext,
    asyncValidationContextValue,
    refetchData,
    isLoading,
  } = useUsdVaultWithdrawFormData();

  const { retryEvent } = useFormControllerRetry();
  const { withdraw } = useUsdVaultWithdraw(retryEvent.fire);

  const formObject = useForm({
    defaultValues: { amount: null },
    disabled: isWalletConnected && !isDappActive,
    criteriaMode: 'firstError',
    mode: 'onChange',
    context: validationContext,
    resolver: UsdVaultWithdrawFormValidationResolver,
  });

  const formControllerValue = useMemo(
    (): FormControllerContextValueType<any> => ({
      onSubmit: async (values: UsdVaultWithdrawFormValidatedValues) => {
        const result = await withdraw(values);
        if (result) {
          await refetchData();
        }
        return result;
      },
      onReset: () => {
        formObject.reset({ amount: null });
      },
      retryEvent,
    }),
    [retryEvent, withdraw, refetchData, formObject],
  );

  const contextValue = useMemo<UsdVaultWithdrawFormDataContextValue>(() => {
    const tokenBalance = asyncValidationContextValue?.[USD_VAULT_TOKEN_SYMBOL];
    const maxAmount =
      tokenBalance?.balance != undefined ? tokenBalance?.balance : undefined;
    return {
      maxAmount,
      isLoading,
    };
  }, [asyncValidationContextValue, isLoading]);

  return (
    <FormProvider {...formObject}>
      <USDWithdrawFormDataContext.Provider value={contextValue}>
        <FormControllerContext.Provider value={formControllerValue as any}>
          {children}
        </FormControllerContext.Provider>
      </USDWithdrawFormDataContext.Provider>
    </FormProvider>
  );
};
