import React, { createContext, useContext, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import invariant from 'tiny-invariant';

import {
  FormControllerContext,
  FormControllerContextValueType,
} from 'shared/hook-form/form-controller';
import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';
import { useDappStatus } from 'modules/web3/hooks/use-dapp-status';
import { useEthVaultWithdraw } from '../hooks/use-withdraw';
import { useEthVaultWithdrawFormData } from '../hooks/use-withdraw-form-data';
import { useEthVaultAvailable } from '../../hooks/use-vault-available';
import { ETH_VAULT_TOKEN_SYMBOL } from '../../consts';
import { EthVaultWithdrawFormValidationResolver } from './validation';
import type {
  EthVaultWithdrawFormDataContextValue,
  EthVaultWithdrawFormValidatedValues,
} from './types';

const ETHWithdrawFormDataContext =
  createContext<EthVaultWithdrawFormDataContextValue | null>(null);
ETHWithdrawFormDataContext.displayName = 'ETHWithdrawFormDataContext';

export const useEthVaultWithdrawForm = () => {
  const context = useContext(ETHWithdrawFormDataContext);
  invariant(
    context,
    '[useETHWithdrawForm] ETHWithdrawFormDataContext is used outside provider',
  );
  return context;
};

export const EthVaultWithdrawFormProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { isDappActive, isWalletConnected } = useDappStatus();
  const { isEthVaultAvailable, isWithdrawEnabled } = useEthVaultAvailable();

  const {
    validationContext,
    asyncValidationContextValue,
    refetchData,
    isLoading,
  } = useEthVaultWithdrawFormData();

  const { retryEvent } = useFormControllerRetry();
  const { withdraw } = useEthVaultWithdraw(retryEvent.fire);

  const formObject = useForm({
    defaultValues: { amount: null },
    disabled:
      (isWalletConnected && !isDappActive) ||
      (isEthVaultAvailable && !isWithdrawEnabled),
    criteriaMode: 'firstError',
    mode: 'onChange',
    context: validationContext,
    resolver: EthVaultWithdrawFormValidationResolver,
  });

  const formControllerValue = useMemo(
    (): FormControllerContextValueType<any> => ({
      onSubmit: async (values: EthVaultWithdrawFormValidatedValues) => {
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

  const contextValue = useMemo<EthVaultWithdrawFormDataContextValue>(() => {
    const tokenBalance = asyncValidationContextValue?.[ETH_VAULT_TOKEN_SYMBOL];
    const maxAmount =
      tokenBalance?.balance != undefined ? tokenBalance?.balance : undefined;
    return {
      maxAmount,
      isLoading,
    };
  }, [asyncValidationContextValue, isLoading]);

  return (
    <FormProvider {...formObject}>
      <ETHWithdrawFormDataContext.Provider value={contextValue}>
        <FormControllerContext.Provider value={formControllerValue as any}>
          {children}
        </FormControllerContext.Provider>
      </ETHWithdrawFormDataContext.Provider>
    </FormProvider>
  );
};
