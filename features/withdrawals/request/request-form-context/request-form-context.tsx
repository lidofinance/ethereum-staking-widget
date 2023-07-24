import { useMemo, useState, createContext, useContext } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import invariant from 'tiny-invariant';
import { TOKENS } from '@lido-sdk/constants';

import { useWithdrawalRequest } from 'features/withdrawals/hooks';

import { RequestFormValidationResolver } from './validators';
import { useRequestFormDataContextValue } from './use-request-form-data-context-value';
import { useValidationContext } from './use-validation-context';
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
export const RequestFormProvider: React.FC = ({ children }) => {
  const [intermediateValidationResults, setIntermediateValidationResults] =
    useState<ValidationResults>({ requests: null });

  const requestFormData = useRequestFormDataContextValue();
  const { onSuccessRequest } = requestFormData;

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
    context: useValidationContext(
      requestFormData,
      setIntermediateValidationResults,
    ),
    criteriaMode: 'firstError',
    mode: 'onChange',
    resolver: RequestFormValidationResolver,
  });

  // TODO refactor this part as part of TX flow
  const { control, handleSubmit, reset } = formObject;
  const [token, amount] = useWatch({
    control: control,
    name: ['token', 'amount'],
  });
  const {
    allowance,
    request,
    isApprovalFlow,
    isApprovalFlowLoading,
    isTokenLocked,
  } = useWithdrawalRequest({
    token,
    amount,
  });

  const onSubmit = useMemo(
    () =>
      handleSubmit(async ({ requests, amount, token }) => {
        const { success } = await request(requests, amount, token);
        if (success) {
          await onSuccessRequest();
          reset();
        }
      }),
    [reset, handleSubmit, request, onSuccessRequest],
  );

  const value = useMemo(() => {
    return {
      ...requestFormData,
      isApprovalFlow,
      isApprovalFlowLoading,
      isTokenLocked,
      allowance,
      onSubmit,
    };
  }, [
    requestFormData,
    isApprovalFlow,
    isApprovalFlowLoading,
    isTokenLocked,
    allowance,
    onSubmit,
  ]);

  return (
    <FormProvider {...formObject}>
      <RequestFormDataContext.Provider value={value}>
        <IntermediateValidationResultsContext.Provider
          value={intermediateValidationResults}
        >
          {children}
        </IntermediateValidationResultsContext.Provider>
      </RequestFormDataContext.Provider>
    </FormProvider>
  );
};
