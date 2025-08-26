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

import { useDVVAvailable } from '../../hooks/use-dvv-available';

import { useDVVWithdraw } from '../hooks/use-dvv-withdraw';
import { useDVVWithdrawFormData } from './use-dvv-withdraw-form-data';
import { DVVWithdrawalFormValidationResolver } from './validation';

import type {
  DVVWithdrawalFormValues,
  DVVWithdrawalFormContext,
} from '../types';

const DVVWithdrawFormDataContext =
  createContext<DVVWithdrawalFormContext | null>(null);

export const useDVVWithdrawForm = () => {
  const context = useContext(DVVWithdrawFormDataContext);
  invariant(
    context,
    'useDVVWithdrawForm must be used within a DVVWithdrawFormProvider',
  );
  return context;
};

export const DVVWithdrawFormProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const { isDappActive, isWalletConnected } = useDappStatus();
  const { validationContext, isLoading, refetchData, isWithdrawalPaused } =
    useDVVWithdrawFormData();
  const { isDVVAvailable, isWithdrawEnabled } = useDVVAvailable();
  const { retryEvent } = useFormControllerRetry();
  const { withdrawDVV } = useDVVWithdraw(retryEvent.fire);

  const formObject = useForm<DVVWithdrawalFormValues>({
    defaultValues: {
      amount: null,
    },
    disabled:
      (isWalletConnected && !isDappActive) ||
      isWithdrawalPaused ||
      (isDVVAvailable && !isWithdrawEnabled),
    mode: 'onChange',
    context: validationContext,
    resolver: DVVWithdrawalFormValidationResolver,
  });

  const formControllerValue = useMemo(
    (): FormControllerContextValueType<any> => ({
      onSubmit: async (values) => {
        const result = await withdrawDVV(values);
        if (result) {
          await refetchData();
        }
        return result;
      },
      retryEvent,
    }),
    [refetchData, retryEvent, withdrawDVV],
  );

  const contextValue = useMemo<DVVWithdrawalFormContext>(
    () => ({
      isLoading,
    }),
    [isLoading],
  );

  return (
    <FormProvider {...formObject}>
      <DVVWithdrawFormDataContext.Provider value={contextValue}>
        <FormControllerContext.Provider value={formControllerValue}>
          {children}
        </FormControllerContext.Provider>
      </DVVWithdrawFormDataContext.Provider>
    </FormProvider>
  );
};
