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
import { MAX_REQUESTS_COUNT } from 'features/withdrawals/withdrawals-constants';
import invariant from 'tiny-invariant';

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
  isInfiniteAllowance: boolean;
  isTokenLocked: boolean;
  allowance: BigNumber;
  onSubmit: NonNullable<React.ComponentProps<'form'>['onSubmit']>;
};

type RequestFormDataContextValueType = RequestFormDataType &
  ExtraRequestFormDataType;

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
    params: [maxAmountPerRequestSteth],
    shouldFetch: !!maxAmountPerRequestSteth,
    config: STRATEGY_LAZY,
  }).data;

  const onSuccessRequest = useCallback(() => {
    stethUpdate();
    wstethUpdate();
    withdrawalRequestsDataUpdate();
    unfinalizedStETHUpdate();
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

const useValidationContext = (
  requestData: RequestFormDataType,
  setIntermediateValidationResults: RequestFormValidationContextType['setIntermediateValidationResults'],
) => {
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
            maxRequestCount: MAX_REQUESTS_COUNT,
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
// Joint provider
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
    isInfiniteAllowance,
    isTokenLocked,
  } = useWithdrawalRequest({
    token,
    amount,
    onSuccess: () => {
      requestFormData.onSuccessRequest();
      formObject.reset;
    },
  });

  const value = useMemo(() => {
    return {
      ...requestFormData,
      isApprovalFlow,
      isApprovalFlowLoading,
      isInfiniteAllowance,
      isTokenLocked,
      allowance,
      onSubmit: handleSubmit(async ({ requests, amount }) => {
        invariant(requests, 'cannot submit empty requests');
        invariant(amount, 'cannot submit empty amount');
        return request(requests, amount);
      }),
    };
  }, [
    handleSubmit,
    allowance,
    isApprovalFlow,
    isApprovalFlowLoading,
    isInfiniteAllowance,
    isTokenLocked,
    request,
    requestFormData,
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
