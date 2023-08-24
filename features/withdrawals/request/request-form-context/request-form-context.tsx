import { useMemo, useState, createContext, useContext, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import invariant from 'tiny-invariant';
import { TOKENS } from '@lido-sdk/constants';

import { useWithdrawalRequest } from 'features/withdrawals/hooks';

import { RequestFormValidationResolver } from './validators';
import { useRequestFormNetworkData } from './use-request-form-newtork-data';
import {
  RequestFormDataContextValueType,
  RequestFormInputType,
  RequestFormNetworkData,
  ValidationResults,
} from './types';
import { useTransactionModal } from 'features/withdrawals/contexts/transaction-modal-context';

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

  const { networkData, networkDataPromise } = useRequestFormNetworkData({
    setIntermediateValidationResults,
  });
  const { balanceSteth, balanceWSteth, revalidateRequestFormData } =
    networkData;
  const formObject = useForm<
    RequestFormInputType,
    Promise<RequestFormNetworkData>
  >({
    defaultValues: {
      amount: null,
      token: TOKENS.STETH,
      mode: 'lido',
      requests: null,
    },
    context: networkDataPromise,
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
      ...networkData,
      isApprovalFlow,
      isApprovalFlowLoading,
      isTokenLocked,
      allowance,
      maxAmount,
      onSubmit,
    }),
    [
      networkData,
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
