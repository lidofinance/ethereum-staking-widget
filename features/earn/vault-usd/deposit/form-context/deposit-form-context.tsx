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
import {
  USDDepositFormDataContextValue,
  USDDepositFormValidatedValues,
  USDDepositFormValues,
} from './types';
import { useUsdVaultDeposit } from '../hooks/use-deposit';
import { useUsdVaultDepositFormData } from '../hooks/use-deposit-form-data';
import { UsdVaultDepositFormValidationResolver } from './validation';
import { useUsdVaultAvailable } from '../../hooks/use-vault-available';
import { useUsdVaultDepositRequest } from '../hooks';

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

  const token = formObject.watch('token');
  const { setValue } = formObject;
  useQueryParamsReferralForm<USDDepositFormValues>({ setValue });

  const depositRequest = useUsdVaultDepositRequest({ token });

  const formControllerValue = useMemo(
    (): FormControllerContextValueType<any> => ({
      onSubmit: async (values: USDDepositFormValidatedValues) => {
        const result = await deposit(values);
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
      <UsdVaultDepositFormDataContext.Provider value={contextValue}>
        <FormControllerContext.Provider value={formControllerValue as any}>
          {children}
        </FormControllerContext.Provider>
      </UsdVaultDepositFormDataContext.Provider>
    </FormProvider>
  );
};
