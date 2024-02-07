import {
  FC,
  PropsWithChildren,
  useMemo,
  useState,
  createContext,
  useContext,
} from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import invariant from 'tiny-invariant';
import { TOKENS } from '@lido-sdk/constants';

import { useWithdrawalRequest } from 'features/withdrawals/hooks';

import { useRequestFormDataContextValue } from './use-request-form-data-context-value';
import { useValidationContext } from './use-validation-context';
import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';

import {
  FormControllerContext,
  FormControllerContextValueType,
} from 'shared/hook-form/form-controller';
import { RequestFormValidationResolver } from './validators';
import {
  RequestFormDataContextValueType,
  RequestFormInputType,
  RequestFormValidationContextType,
  ValidationResults,
} from './types';

//
// data context
//
const RequestFormDataContext =
  createContext<RequestFormDataContextValueType | null>(null);
RequestFormDataContext.displayName = 'RequestFormDataContext';

export const useRequestFormData = () => {
  const value = useContext(RequestFormDataContext);
  invariant(value, 'useRequestFormData was used outside the provider');
  return value;
};

//
// intermediate values context
//
const IntermediateValidationResultsContext =
  createContext<ValidationResults | null>(null);
IntermediateValidationResultsContext.displayName =
  'IntermediateValidationResultsContext';

export const useValidationResults = () => {
  const value = useContext(IntermediateValidationResultsContext);
  invariant(value, 'useValidationResults was used outside the provider');
  return value;
};

//
// Joint provider for form state, data, intermediate validation results
//
export const RequestFormProvider: FC<PropsWithChildren> = ({ children }) => {
  const [intermediateValidationResults, setIntermediateValidationResults] =
    useState<ValidationResults>({ requests: null });

  const requestFormData = useRequestFormDataContextValue();
  const { balanceSteth, balanceWSteth, revalidateRequestFormData } =
    requestFormData;
  const validationContext = useValidationContext(
    requestFormData,
    setIntermediateValidationResults,
  );
  const formObject = useForm<
    RequestFormInputType,
    RequestFormValidationContextType
  >({
    defaultValues: {
      amount: null,
      token: TOKENS.STETH,
      mode: 'lido',
      requests: null,
    },
    context: validationContext,
    criteriaMode: 'firstError',
    mode: 'onChange',
    resolver: RequestFormValidationResolver,
  });

  // TODO refactor this part as part of TX flow
  const {
    reset,
    watch,
    formState: { defaultValues },
  } = formObject;
  const [token, amount] = watch(['token', 'amount']);
  const { retryEvent, retryFire } = useFormControllerRetry();

  const {
    allowance,
    request,
    isApprovalFlow,
    isApprovalFlowLoading,
    isTokenLocked,
  } = useWithdrawalRequest({
    token,
    amount,
    onConfirm: revalidateRequestFormData,
    onRetry: retryFire,
  });

  const maxAmount = token === TOKENS.STETH ? balanceSteth : balanceWSteth;

  const value = useMemo(
    (): RequestFormDataContextValueType => ({
      ...requestFormData,
      isApprovalFlow,
      isApprovalFlowLoading,
      isTokenLocked,
      allowance,
      maxAmount,
    }),
    [
      requestFormData,
      isApprovalFlow,
      isApprovalFlowLoading,
      isTokenLocked,
      allowance,
      maxAmount,
    ],
  );

  const formControllerValue: FormControllerContextValueType<RequestFormInputType> =
    useMemo(
      () => ({
        onSubmit: request,
        onReset: ({ mode, token }: RequestFormInputType) => {
          reset({
            ...defaultValues,
            mode,
            token,
          });
        },
        retryEvent,
      }),
      [request, retryEvent, reset, defaultValues],
    );

  return (
    <FormProvider {...formObject}>
      <RequestFormDataContext.Provider value={value}>
        <FormControllerContext.Provider value={formControllerValue}>
          <IntermediateValidationResultsContext.Provider
            value={intermediateValidationResults}
          >
            {children}
          </IntermediateValidationResultsContext.Provider>
        </FormControllerContext.Provider>
      </RequestFormDataContext.Provider>
    </FormProvider>
  );
};
