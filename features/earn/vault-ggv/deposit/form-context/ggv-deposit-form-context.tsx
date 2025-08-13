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

import { isGGVAvailable } from '../../utils';
import { useGGVDeposit } from '../../hooks/use-ggv-deposit';

import { useGGVDepositFormData } from './use-ggv-deposit-form-data';
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

const minBN = (a: bigint, b?: bigint | null) => (b == null || a < b ? a : b);

export const GGVDepositFormProvider: FC<PropsWithChildren> = ({ children }) => {
  // Wallet state
  const { isDappActive, chainId } = useDappStatus();

  // Network data for form
  const {
    validationContext,
    asyncValidationContextValue,
    refetchData,
    isLoading,
  } = useGGVDepositFormData();

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
    },
    disabled: !isDappActive || !isGGVAvailable(chainId),
    criteriaMode: 'firstError',
    mode: 'onChange',
    context: validationContext,
    resolver: GGVDepositFormValidationResolver,
  });

  const token = formObject.watch('token');

  const formControllerValue = useMemo(
    () => ({
      onSubmit: async (values: GGVDepositFormValidatedValues) => {
        const result = await depositGGV(values);
        if (result) {
          await refetchData(values.token);
        }
        return result;
      },
      retryEvent,
    }),
    [depositGGV, refetchData, retryEvent],
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
