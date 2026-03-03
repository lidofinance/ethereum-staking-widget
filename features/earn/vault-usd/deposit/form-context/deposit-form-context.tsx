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
  USDDepositFormDataContextValue,
  USDDepositFormValidatedValues,
  USDDepositFormValues,
} from './types';
import { useUsdVaultDeposit } from '../hooks/use-deposit';
import { useUsdVaultDepositFormData } from '../hooks/use-deposit-form-data';
import { UsdVaultDepositFormValidationResolver } from './validation';
import { useUsdVaultAvailable } from '../../hooks/use-vault-available';
import { useUsdVaultDepositRequest } from '../hooks';
import { asUsdDepositToken } from '../../utils';

const UsdVaultDepositFormDataContext =
  createContext<USDDepositFormDataContextValue | null>(null);
UsdVaultDepositFormDataContext.displayName = 'UsdVaultDepositFormDataContext';

export const useUSDDepositForm = () => {
  const context = useContext(UsdVaultDepositFormDataContext);
  invariant(
    context,
    '[useUSDDepositForm] UsdVaultDepositFormDataContext is used outside provider',
  );
  return context;
};

export const UsdVaultDepositFormProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  // Wallet state
  const { isDappActive, isWalletConnected } = useDappStatus();
  const { isUsdVaultAvailable, isDepositEnabled } = useUsdVaultAvailable();

  const {
    validationContext,
    asyncValidationContextValue,
    refetchData,
    isLoading,
  } = useUsdVaultDepositFormData();

  // Retry event helper
  const { retryEvent } = useFormControllerRetry();
  // Deposit function
  const { deposit } = useUsdVaultDeposit(retryEvent.fire);

  const formObject = useForm({
    defaultValues: { amount: null, token: TOKEN_SYMBOLS.usdc, referral: null },
    disabled:
      (isWalletConnected && !isDappActive) ||
      (isUsdVaultAvailable && !isDepositEnabled),
    criteriaMode: 'firstError',
    mode: 'onChange',
    context: validationContext,
    resolver: UsdVaultDepositFormValidationResolver,
  });

  const tokenSymbol = formObject.watch('token');
  const { setValue } = formObject;
  useQueryParamsReferralForm<USDDepositFormValues>({ setValue });

  const depositRequest = useUsdVaultDepositRequest({
    token: asUsdDepositToken(tokenSymbol),
  });

  const formControllerValue = useMemo(
    (): FormControllerContextValueType<any> => ({
      onSubmit: async (values: USDDepositFormValidatedValues) => {
        const result = await deposit({
          ...values,
          token: asUsdDepositToken(values.token),
        });
        if (result) {
          await refetchData(values.token);
        }
        return result;
      },
      onReset: (values: USDDepositFormValidatedValues) => {
        formObject.reset({ amount: null, token: values.token });
      },
      retryEvent,
    }),
    [deposit, formObject, refetchData, retryEvent],
  );

  const contextValue = useMemo<USDDepositFormDataContextValue>(() => {
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
      <UsdVaultDepositFormDataContext.Provider value={contextValue}>
        <FormControllerContext.Provider value={formControllerValue as any}>
          {children}
        </FormControllerContext.Provider>
      </UsdVaultDepositFormDataContext.Provider>
    </FormProvider>
  );
};
