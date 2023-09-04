import { useMemo, useState, createContext, useContext, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
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
import { useTransactionModal } from 'shared/transaction-modal';

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
  const { dispatchModalState } = useTransactionModal();
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
    Promise<RequestFormValidationContextType>
  >({
    defaultValues: {
      amount: null,
      token: TOKENS.STETH,
      mode: 'lido',
      requests: null,
    },
    context: validationContext.awaiter,
    criteriaMode: 'firstError',
    mode: 'onChange',
    resolver: RequestFormValidationResolver,
  });

  // TODO refactor this part as part of TX flow
  const { handleSubmit, reset, watch } = formObject;
  const [token, amount] = watch(['token', 'amount']);
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
  });

  const onSubmit = useMemo(
    () =>
      handleSubmit(async ({ requests, amount, token }) => {
        const { success } = await request(requests, amount, token);
        if (success) reset();
      }),
    [reset, handleSubmit, request],
  );

  useEffect(() => {
    dispatchModalState({ type: 'set_on_retry', callback: onSubmit });
  }, [dispatchModalState, onSubmit]);

  const maxAmount = token === TOKENS.STETH ? balanceSteth : balanceWSteth;

  const value = useMemo(
    (): RequestFormDataContextValueType => ({
      ...requestFormData,
      isApprovalFlow,
      isApprovalFlowLoading,
      isTokenLocked,
      allowance,
      maxAmount,
      onSubmit,
    }),
    [
      requestFormData,
      isApprovalFlow,
      isApprovalFlowLoading,
      isTokenLocked,
      allowance,
      maxAmount,
      onSubmit,
    ],
  );

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
