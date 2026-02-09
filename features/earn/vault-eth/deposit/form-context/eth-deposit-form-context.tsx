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
import {
  ETHDepositFormDataContextValue,
  ETHDepositFormValidatedValues,
  ETHDepositFormValues,
} from './types';
import { useETHDeposit } from '../hooks/use-eth-deposit';
import { useETHDepositFormData } from '../hooks/use-eth-deposit-form-data';
import { ETHDepositFormValidationResolver } from './validation';
import { useETHAvailable } from '../../hooks/use-eth-available';
import { useDepositRequest } from '../hooks';

const ETHDepositFormDataContext =
  createContext<ETHDepositFormDataContextValue | null>(null);
ETHDepositFormDataContext.displayName = 'ETHDepositFormDataContext';

export const useETHDepositForm = () => {
  const context = useContext(ETHDepositFormDataContext);
  invariant(
    context,
    '[useETHDepositForm] ETHDepositFormDataContext is used outside provider',
  );
  return context;
};

export const ETHDepositFormProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  // Wallet state
  const { isDappActive, isWalletConnected } = useDappStatus();
  const { isETHAvailable, isDepositEnabled } = useETHAvailable();

  const {
    validationContext,
    asyncValidationContextValue,
    refetchData,
    isLoading,
  } = useETHDepositFormData();

  // Retry event helper
  const { retryEvent } = useFormControllerRetry();
  // Deposit function
  const { deposit } = useETHDeposit(retryEvent.fire);

  const formObject = useForm({
    defaultValues: { amount: null, token: 'ETH', referral: null },
    disabled:
      (isWalletConnected && !isDappActive) ||
      (isETHAvailable && !isDepositEnabled),
    criteriaMode: 'firstError',
    mode: 'onChange',
    context: validationContext,
    resolver: ETHDepositFormValidationResolver,
  });

  const token = formObject.watch('token');
  const { setValue } = formObject;
  useQueryParamsReferralForm<ETHDepositFormValues>({ setValue });

  const depositRequest = useDepositRequest(token);

  const formControllerValue = useMemo(
    (): FormControllerContextValueType<any> => ({
      onSubmit: async (values: ETHDepositFormValidatedValues) => {
        const result = await deposit(values);
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
      <ETHDepositFormDataContext.Provider value={contextValue}>
        <FormControllerContext.Provider value={formControllerValue as any}>
          {children}
        </FormControllerContext.Provider>
      </ETHDepositFormDataContext.Provider>
    </FormProvider>
  );
};
