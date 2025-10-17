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
import { minBN } from 'utils/bn';
import { useDappStatus } from 'modules/web3';
import { useQueryParamsReferralForm } from 'shared/hooks/use-query-values-form';

import { useDVVAvailable } from '../../hooks/use-dvv-available';
import { useDVVDepositFormData } from './use-dvv-deposit-form-data';
import { DVVDepositFormValidationResolver } from './validation';
import { useDVVDeposit } from '../hooks/use-dvv-deposit';

import type {
  DVVDepositFormContext,
  DVVDepositFormValues,
  DVVDepositFormValidatedValues,
} from '../types';

const DVVDepositFormDataContext = createContext<DVVDepositFormContext | null>(
  null,
);
DVVDepositFormDataContext.displayName = 'DVVDepositFormDataContext';

export const useDVVDepositForm = () => {
  const context = useContext(DVVDepositFormDataContext);
  invariant(
    context,
    'useDVVDepositForm must be used within a DVVDepositFormProvider',
  );
  return context;
};

export const DVVDepositFormProvider: FC<PropsWithChildren> = ({ children }) => {
  const { isDappActive, isWalletConnected } = useDappStatus();
  const { isDVVAvailable, isDepositEnabled } = useDVVAvailable();
  const {
    asyncValidationContextValue,
    validationContext,
    depositLimitQuery,
    refetchData,
    isLoading,
  } = useDVVDepositFormData();
  const { retryEvent } = useFormControllerRetry();
  const { depositDVV } = useDVVDeposit(retryEvent.fire);

  const formObject = useForm<DVVDepositFormValues>({
    defaultValues: {
      amount: null,
      token: 'ETH',
      referral: null,
    },
    disabled:
      (isWalletConnected && !isDappActive) ||
      (isDVVAvailable && !isDepositEnabled) ||
      depositLimitQuery.data?.maxDepositETH === 0n,
    criteriaMode: 'firstError',
    mode: 'onChange',
    context: validationContext,
    resolver: DVVDepositFormValidationResolver,
  });

  const token = formObject.watch('token');
  const { setValue } = formObject;
  useQueryParamsReferralForm<DVVDepositFormValues>({ setValue });

  const formControllerValue = useMemo(
    (): FormControllerContextValueType<any> => ({
      onSubmit: async (values: DVVDepositFormValidatedValues) => {
        const result = await depositDVV(values);
        if (result) {
          await refetchData(values.token);
        }
        return result;
      },
      onReset: (values: DVVDepositFormValidatedValues) => {
        formObject.reset({ amount: null, token: values.token });
      },
      retryEvent,
    }),
    [depositDVV, formObject, refetchData, retryEvent],
  );

  const contextValue = useMemo<DVVDepositFormContext>(() => {
    const tokenBalance = asyncValidationContextValue?.[token];
    const maxAmount =
      tokenBalance?.balance != undefined
        ? minBN(tokenBalance?.balance, tokenBalance?.maxDeposit)
        : undefined;
    return {
      maxAmount,
      token,
      isLoading,
    };
  }, [asyncValidationContextValue, isLoading, token]);

  return (
    <FormProvider {...formObject}>
      <DVVDepositFormDataContext.Provider value={contextValue}>
        <FormControllerContext.Provider value={formControllerValue}>
          {children}
        </FormControllerContext.Provider>
      </DVVDepositFormDataContext.Provider>
    </FormProvider>
  );
};
