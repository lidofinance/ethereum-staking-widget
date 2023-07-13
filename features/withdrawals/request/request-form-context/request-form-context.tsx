import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
  createContext,
  useContext,
} from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { BigNumber } from 'ethers';

import { TOKENS } from '@lido-sdk/constants';
import {
  useWSTETHContractRPC,
  useSTETHBalance,
  useWSTETHBalance,
  useContractSWR,
  useSTETHTotalSupply,
} from '@lido-sdk/react';
import {
  useUnfinalizedStETH,
  useWithdrawalRequest,
} from 'features/withdrawals/hooks';
import { STRATEGY_LAZY } from 'utils/swrStrategies';
import { RequestFormValidationResolver } from './validators';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import {
  MAX_REQUESTS_COUNT,
  MAX_REQUESTS_COUNT_LEDGER_LIMIT,
} from 'features/withdrawals/withdrawals-constants';
import invariant from 'tiny-invariant';
import { useIsLedgerLive } from 'shared/hooks/useIsLedgerLive';

export type ValidationResults = {
  requests: null | BigNumber[];
};

export type RequestFormInputType = {
  amount: null | BigNumber;
  token: TOKENS.STETH | TOKENS.WSTETH;
  mode: 'lido' | 'dex';
} & ValidationResults;

export type RequestFormValidationContextType = {
  setIntermediateValidationResults: Dispatch<SetStateAction<ValidationResults>>;
  minUnstakeSteth: BigNumber;
  minUnstakeWSteth: BigNumber;
  balanceSteth: BigNumber;
  balanceWSteth: BigNumber;
  maxAmountPerRequestSteth: BigNumber;
  maxAmountPerRequestWSteth: BigNumber;
  stethTotalSupply: BigNumber;
  maxRequestCount: number;
};

type RequestFormDataType = ReturnType<typeof useRequestFormDataContextValue>;

type ExtraRequestFormDataType = {
  isApprovalFlow: boolean;
  isApprovalFlowLoading: boolean;
  isTokenLocked: boolean;
  allowance: BigNumber;
  onSubmit: NonNullable<React.ComponentProps<'form'>['onSubmit']>;
};

type RequestFormDataContextValueType = RequestFormDataType &
  ExtraRequestFormDataType;

// Provides all data fetching for form to function
const useRequestFormDataContextValue = () => {
  const { update: withdrawalRequestsDataUpdate } = useClaimData();
  const stethTotalSupply = useSTETHTotalSupply().data;
  const { maxAmount: maxAmountPerRequestSteth, minAmount: minUnstakeSteth } =
    useWithdrawals();
  const wstethContract = useWSTETHContractRPC();
  const { data: balanceSteth, update: stethUpdate } = useSTETHBalance();
  const { data: balanceWSteth, update: wstethUpdate } = useWSTETHBalance();
  const { data: unfinalizedStETH, update: unfinalizedStETHUpdate } =
    useUnfinalizedStETH();

  const maxAmountPerRequestWSteth = useContractSWR({
    contract: wstethContract,
    method: 'getWstETHByStETH',
    params: [maxAmountPerRequestSteth],
    shouldFetch: !!maxAmountPerRequestSteth,
    config: STRATEGY_LAZY,
  }).data;
  const minUnstakeWSteth = useContractSWR({
    contract: wstethContract,
    method: 'getWstETHByStETH',
    params: [minUnstakeSteth],
    shouldFetch: !!minUnstakeSteth,
    config: STRATEGY_LAZY,
  }).data;

  const onSuccessRequest = useCallback(() => {
    return Promise.all([
      stethUpdate(),
      wstethUpdate(),
      withdrawalRequestsDataUpdate(),
      unfinalizedStETHUpdate(),
    ]);
  }, [
    stethUpdate,
    unfinalizedStETHUpdate,
    withdrawalRequestsDataUpdate,
    wstethUpdate,
  ]);

  return useMemo(
    () => ({
      maxAmountPerRequestSteth,
      minUnstakeSteth,
      balanceSteth,
      balanceWSteth,
      maxAmountPerRequestWSteth,
      minUnstakeWSteth,
      stethTotalSupply,
      unfinalizedStETH,
      onSuccessRequest,
    }),
    [
      balanceSteth,
      balanceWSteth,
      maxAmountPerRequestSteth,
      maxAmountPerRequestWSteth,
      minUnstakeSteth,
      minUnstakeWSteth,
      stethTotalSupply,
      unfinalizedStETH,
      onSuccessRequest,
    ],
  );
};

// Prepares validation context object from request form data
const useValidationContext = (
  requestData: RequestFormDataType,
  setIntermediateValidationResults: RequestFormValidationContextType['setIntermediateValidationResults'],
) => {
  const isLedgerLive = useIsLedgerLive();
  const maxRequestCount = isLedgerLive
    ? MAX_REQUESTS_COUNT_LEDGER_LIMIT
    : MAX_REQUESTS_COUNT;
  const {
    balanceSteth,
    balanceWSteth,
    maxAmountPerRequestSteth,
    maxAmountPerRequestWSteth,
    minUnstakeSteth,
    minUnstakeWSteth,

    stethTotalSupply,
  } = requestData;
  return useMemo(() => {
    const validationContextObject =
      balanceSteth &&
      balanceWSteth &&
      maxAmountPerRequestSteth &&
      maxAmountPerRequestWSteth &&
      minUnstakeSteth &&
      minUnstakeWSteth &&
      stethTotalSupply
        ? {
            balanceSteth,
            balanceWSteth,
            maxAmountPerRequestSteth,
            maxAmountPerRequestWSteth,
            minUnstakeSteth,
            minUnstakeWSteth,
            maxRequestCount,
            stethTotalSupply,
            setIntermediateValidationResults,
          }
        : undefined;
    return validationContextObject;
  }, [
    balanceSteth,
    balanceWSteth,
    maxAmountPerRequestSteth,
    maxAmountPerRequestWSteth,
    maxRequestCount,
    minUnstakeSteth,
    minUnstakeWSteth,
    setIntermediateValidationResults,
    stethTotalSupply,
  ]);
};

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
    mode: 'all',
    resolver: RequestFormValidationResolver,
  });

  // TODO refactor this part as part of TX flow
  const { control, handleSubmit } = formObject;
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

  const value = useMemo(() => {
    return {
      ...requestFormData,
      isApprovalFlow,
      isApprovalFlowLoading,
      isTokenLocked,
      allowance,
      onSubmit: handleSubmit(async ({ requests, amount, token }) => {
        invariant(requests, 'cannot submit empty requests');
        invariant(amount, 'cannot submit empty amount');
        const { success } = await request(requests, amount, token);
        if (success) {
          await requestFormData.onSuccessRequest();
          formObject.reset;
        }
      }),
    };
  }, [
    requestFormData,
    isApprovalFlow,
    isApprovalFlowLoading,
    isTokenLocked,
    allowance,
    handleSubmit,
    request,
    formObject.reset,
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
