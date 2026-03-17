import React, { createContext, useContext, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import invariant from 'tiny-invariant';

import {
  FormControllerContext,
  FormControllerContextValueType,
} from 'shared/hook-form/form-controller';
import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';
import { useQueryParamsReferralForm } from 'shared/hooks/use-query-values-form';
import { useDappStatus } from 'modules/web3/hooks/use-dapp-status';
import { TOKEN_SYMBOLS } from 'consts/tokens';

import type {
  ETHDepositFormDataContextValue,
  ETHDepositFormValidatedValues,
  ETHDepositFormValues,
} from './types';
import { useEthVaultDeposit } from '../hooks/use-deposit';
import { useEthVaultDepositFormData } from '../hooks/use-deposit-form-data';
import { EthVaultDepositFormValidationResolver } from './validation';
import { useEthVaultAvailable } from '../../hooks/use-vault-available';
import { useEthVaultDepositRequest } from '../hooks';
import { asEthDepositToken } from '../../utils';

const EthVaultDepositFormDataContext =
  createContext<ETHDepositFormDataContextValue | null>(null);
EthVaultDepositFormDataContext.displayName = 'EthVaultDepositFormDataContext';

export const useETHDepositForm = () => {
  const context = useContext(EthVaultDepositFormDataContext);
  invariant(
    context,
    '[useETHDepositForm] EthVaultDepositFormDataContext is used outside provider',
  );
  return context;
};

export const EthVaultDepositFormProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  // Wallet state
  const { isDappActive, isWalletConnected } = useDappStatus();
  const { isEthVaultAvailable, isDepositEnabled } = useEthVaultAvailable();

  const {
    validationContext,
    asyncValidationContextValue,
    refetchData,
    isLoading,
  } = useEthVaultDepositFormData();

  // Retry event helper
  const { retryEvent } = useFormControllerRetry();
  // Deposit function
  const { deposit } = useEthVaultDeposit(retryEvent.fire);

  const formObject = useForm({
    defaultValues: { amount: null, token: TOKEN_SYMBOLS.eth, referral: null },
    disabled:
      (isWalletConnected && !isDappActive) ||
      (isEthVaultAvailable && !isDepositEnabled),
    criteriaMode: 'firstError',
    mode: 'onChange',
    context: validationContext,
    resolver: EthVaultDepositFormValidationResolver,
  });

  const tokenSymbol = formObject.watch('token');
  const { setValue } = formObject;
  useQueryParamsReferralForm<ETHDepositFormValues>({ setValue });

  // stETH deposits go through the wstETH deposit queue, so check wstETH queue for pending requests
  const depositRequestToken =
    tokenSymbol === TOKEN_SYMBOLS.steth
      ? TOKEN_SYMBOLS.wsteth
      : tokenSymbol;

  const depositRequest = useEthVaultDepositRequest({
    token: asEthDepositToken(depositRequestToken),
  });

  const formControllerValue = useMemo(
    (): FormControllerContextValueType<any> => ({
      onSubmit: async (values: ETHDepositFormValidatedValues) => {
        const result = await deposit({
          ...values,
          token: asEthDepositToken(values.token),
        });
        if (result) {
          await refetchData(values.token);
        }
        return result;
      },
      onReset: (values: ETHDepositFormValidatedValues) => {
        formObject.reset({ amount: null, token: values.token });
      },
      retryEvent,
    }),
    [deposit, formObject, refetchData, retryEvent],
  );

  const contextValue = useMemo<ETHDepositFormDataContextValue>(() => {
    const tokenBalance = asyncValidationContextValue?.[tokenSymbol];
    const maxAmount =
      tokenBalance?.balance != undefined ? tokenBalance?.balance : undefined;
    return {
      maxAmount,
      token: tokenSymbol,
      isLoading,
      // deposit is locked if the last request is not yet claimable
      isDepositLockedForCurrentToken:
        !!depositRequest && !depositRequest.isClaimable,
    };
  }, [asyncValidationContextValue, depositRequest, isLoading, tokenSymbol]);

  return (
    <FormProvider {...formObject}>
      <EthVaultDepositFormDataContext.Provider value={contextValue}>
        <FormControllerContext.Provider value={formControllerValue as any}>
          {children}
        </FormControllerContext.Provider>
      </EthVaultDepositFormDataContext.Provider>
    </FormProvider>
  );
};
