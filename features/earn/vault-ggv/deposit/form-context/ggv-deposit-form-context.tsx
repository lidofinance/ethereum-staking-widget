import invariant from 'tiny-invariant';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
} from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { useDappStatus } from 'modules/web3';
import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';
import { FormControllerContext } from 'shared/hook-form/form-controller';
import { useQueryReferralForm } from 'shared/hooks/use-query-values-form';
import { minBN } from 'utils/bn';

import { useGGVDeposit } from '../hooks/use-ggv-deposit';
import { useGGVDepositStatus } from '../hooks/use-ggv-deposit-status';
import { useGGVAvailable } from '../../hooks/use-ggv-available';

import { useGGVDepositFormData } from '../hooks/use-ggv-deposit-form-data';
import { GGVDepositFormValidationResolver } from './validation';
import type {
  GGVDepositFormValidatedValues,
  GGVDepositFormValidationContext,
  GGVDepositFormValues,
  GGVDepositFormDataContextValue,
} from './types';

const GGVDepositFormDataContext =
  createContext<GGVDepositFormDataContextValue | null>(null);
GGVDepositFormDataContext.displayName = 'GGVDepositFormDataContext';

export const useGGVDepositForm = () => {
  const context = useContext(GGVDepositFormDataContext);
  invariant(
    context,
    '[useGGVDepositForm] GGVDepositFormDataContext is used outside provider',
  );
  return context;
};

export const GGVDepositFormProvider: FC<PropsWithChildren> = ({ children }) => {
  // Wallet state
  const { isDappActive, isWalletConnected } = useDappStatus();
  const { isGGVAvailable, isDepositEnabled } = useGGVAvailable();
  // Network data for form
  const {
    validationContext,
    asyncValidationContextValue,
    refetchData,
    isLoading,
  } = useGGVDepositFormData();
  const { data: depositStatus } = useGGVDepositStatus();

  // Retry event helper
  const { retryEvent } = useFormControllerRetry();
  // Deposit function
  const { depositGGV } = useGGVDeposit(retryEvent.fire);

  // Form state
  const formObject = useForm<
    GGVDepositFormValues,
    GGVDepositFormValidationContext,
    GGVDepositFormValidatedValues
  >({
    defaultValues: {
      amount: null,
      token: 'ETH',
      referral: null,
    },
    disabled:
      (isWalletConnected && !isDappActive) ||
      (isGGVAvailable && !isDepositEnabled) ||
      depositStatus?.canDeposit === false,
    criteriaMode: 'firstError',
    mode: 'onChange',
    context: validationContext,
    resolver: GGVDepositFormValidationResolver,
  });
  const token = formObject.watch('token');
  const { setValue } = formObject;
  useQueryReferralForm<GGVDepositFormValues>({ setValue });

  const formControllerValue = useMemo(
    () => ({
      onSubmit: async (values: GGVDepositFormValidatedValues) => {
        const result = await depositGGV(values);
        if (result) {
          await refetchData(values.token);
        }
        return result;
      },
      onReset: (values: GGVDepositFormValidatedValues) => {
        formObject.reset({ amount: null, token: values.token });
      },
      retryEvent,
    }),
    [depositGGV, formObject, refetchData, retryEvent],
  );

  const contextValue = useMemo<GGVDepositFormDataContextValue>(() => {
    const tokenValues = asyncValidationContextValue?.[token];
    return {
      isLoading,
      token,
      maxAmount: tokenValues
        ? minBN(tokenValues.balance, tokenValues?.maxDeposit)
        : undefined,
    };
  }, [asyncValidationContextValue, isLoading, token]);

  return (
    <FormProvider {...formObject}>
      <GGVDepositFormDataContext.Provider value={contextValue}>
        <FormControllerContext.Provider value={formControllerValue}>
          {children}
        </FormControllerContext.Provider>
      </GGVDepositFormDataContext.Provider>
    </FormProvider>
  );
};
