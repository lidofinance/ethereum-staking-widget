import React, { createContext, useContext, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import invariant from 'tiny-invariant';

import {
  FormControllerContext,
  FormControllerContextValueType,
} from 'shared/hook-form/form-controller';
import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';
import { useDappStatus } from 'modules/web3/hooks/use-dapp-status';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import { useUsdVaultWithdraw } from '../hooks/use-withdraw';
import { useUsdVaultWithdrawFormData } from '../hooks/use-withdraw-form-data';
import { useUsdVaultAvailable } from '../../hooks/use-vault-available';
import { USD_VAULT_TOKEN_SYMBOL } from '../../consts';
import { asUsdWithdrawToken } from '../../utils';
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
  const { isUsdVaultAvailable, isWithdrawEnabled } = useUsdVaultAvailable();

  const {
    validationContext,
    asyncValidationContextValue,
    refetchData,
    isLoading,
  } = useUsdVaultWithdrawFormData();

  const { retryEvent } = useFormControllerRetry();

  const formObject = useForm({
    defaultValues: { amount: null, token: TOKEN_SYMBOLS.usdc },
    disabled:
      (isWalletConnected && !isDappActive) ||
      (isUsdVaultAvailable && !isWithdrawEnabled),
    criteriaMode: 'firstError',
    mode: 'onChange',
    context: validationContext,
    resolver: UsdVaultWithdrawFormValidationResolver,
  });

  // The selected payout token decides which redeem queue the withdrawal goes to.
  const tokenSymbol = formObject.watch('token');
  const { withdraw } = useUsdVaultWithdraw(
    retryEvent.fire,
    asUsdWithdrawToken(tokenSymbol),
  );

  const formControllerValue = useMemo(
    (): FormControllerContextValueType<any> => ({
      onSubmit: async (values: UsdVaultWithdrawFormValidatedValues) => {
        // Guards against submitting to a queue other than the selected token's.
        invariant(
          values.token === tokenSymbol,
          '[UsdVaultWithdrawForm] withdraw token and redeem queue are out of sync',
        );
        const result = await withdraw(values);
        if (result) {
          await refetchData();
        }
        return result;
      },
      // Keep the chosen payout token, reset only the amount.
      onReset: (values: UsdVaultWithdrawFormValidatedValues) => {
        formObject.reset({ amount: null, token: values.token });
      },
      retryEvent,
    }),
    [retryEvent, withdraw, refetchData, formObject, tokenSymbol],
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
