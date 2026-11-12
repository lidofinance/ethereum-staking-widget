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
import { useDappStatus } from 'modules/web3';

import { useGGVAvailable } from '../../hooks/use-ggv-available';
import { useGGVWithdraw } from '../hooks/use-ggv-withdraw';
import { useGGVBulkWithdraw } from '../hooks/use-ggv-bulk-withdraw';
import { useGGVWithdrawFormData } from './use-withdraw-form-data';
import { GGVWithdrawalFormValidationResolver } from './validation';
import type {
  GGVWithdrawalFormValues,
  GGVWithdrawalFormDataContextValue,
  GGVWithdrawalFormValidatedValues,
} from '../types';

const GGVWithdrawFormDataContext =
  createContext<GGVWithdrawalFormDataContextValue | null>(null);

export const useGGVWithdrawForm = () => {
  const value = useContext(GGVWithdrawFormDataContext);
  invariant(
    value,
    'useGGVWithdrawForm must be used within a GGVWithdrawFormProvider',
  );
  return value;
};

export const GGVWithdrawFormProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const { isDappActive, isWalletConnected } = useDappStatus();
  const { isGGVAvailable, isWithdrawEnabled } = useGGVAvailable();
  const {
    validationContext,
    isLoadingFormState,
    refetchData,
    withdrawalState,
    withdrawalRequestsQuery,
    withdrawalStateQuery,
    bulkWithdrawalStateQuery,
    isBulkWithdraw,
  } = useGGVWithdrawFormData();

  const { retryEvent } = useFormControllerRetry();
  const { withdrawGGV: requestWithdrawGGV } = useGGVWithdraw(retryEvent.fire);
  const { withdrawGGV: bulkWithdrawGGV } = useGGVBulkWithdraw(retryEvent.fire);
  const withdrawGGV = isBulkWithdraw ? bulkWithdrawGGV : requestWithdrawGGV;

  const formObject = useForm<GGVWithdrawalFormValues>({
    defaultValues: {
      amount: null,
    },
    disabled:
      (isWalletConnected && !isDappActive) ||
      (isGGVAvailable && !isWithdrawEnabled) ||
      !withdrawalState.canWithdraw ||
      withdrawalRequestsQuery.data?.hasActiveRequests,
    mode: 'onChange',
    context: validationContext,
    resolver: GGVWithdrawalFormValidationResolver,
  });

  const formControllerValue = useMemo(
    (): FormControllerContextValueType<any> => ({
      onSubmit: async (values: GGVWithdrawalFormValidatedValues) => {
        const result = await withdrawGGV(values);
        if (result) {
          await refetchData();
        }
        return result;
      },
      retryEvent,
    }),
    [refetchData, retryEvent, withdrawGGV],
  );

  const contextValue = useMemo(
    (): GGVWithdrawalFormDataContextValue => ({
      ...withdrawalState,
      isLoading: isLoadingFormState,
      hasActiveRequests:
        withdrawalRequestsQuery.data?.hasActiveRequests ?? false,
      minDiscount: withdrawalStateQuery.data?.minDiscount,
      isBulkWithdraw,
      bulkRate: bulkWithdrawalStateQuery.data?.rate,
      shareDecimals: bulkWithdrawalStateQuery.data?.shareDecimals,
    }),
    [
      isLoadingFormState,
      withdrawalRequestsQuery.data?.hasActiveRequests,
      withdrawalState,
      withdrawalStateQuery.data?.minDiscount,
      isBulkWithdraw,
      bulkWithdrawalStateQuery.data?.rate,
      bulkWithdrawalStateQuery.data?.shareDecimals,
    ],
  );

  return (
    <FormProvider {...formObject}>
      <GGVWithdrawFormDataContext.Provider value={contextValue}>
        <FormControllerContext.Provider value={formControllerValue}>
          {children}
        </FormControllerContext.Provider>
      </GGVWithdrawFormDataContext.Provider>
    </FormProvider>
  );
};
