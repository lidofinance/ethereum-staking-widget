import invariant from 'tiny-invariant';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
} from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';
import {
  FormControllerContext,
  FormControllerContextValueType,
} from 'shared/hook-form/form-controller';

import type {
  GGVDepositFormValidatedValues,
  GGVDepositFormValidationContext,
  GGVDepositFormValues,
  GGVDepositFormDataContextValue,
} from './types';
import { useGGVDepositFormData } from './use-ggv-deposit-form-data';
import { GGVDepositFormValidationResolver } from './validation';
import { useDappStatus } from 'modules/web3';
import { isGGVAvailable } from '../../utils';

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
  const { isDappActive, chainId } = useDappStatus();
  const { validationContext, asyncValidationContextValue, isLoading } =
    useGGVDepositFormData();
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
  const { retryEvent } = useFormControllerRetry();
  const token = formObject.watch('token');

  const formControllerValue = useMemo(
    (): FormControllerContextValueType<GGVDepositFormValues> => ({
      onSubmit: async () => false,
      retryEvent,
    }),
    [retryEvent],
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
