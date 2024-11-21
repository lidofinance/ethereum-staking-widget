import { TOKENS_TO_WITHDRAWLS } from 'features/withdrawals/types/tokens-withdrawable';
import { Dispatch, SetStateAction } from 'react';
import type { useRequestFormDataContextValue } from './use-request-form-data-context-value';

export type ValidationResults = {
  requests: null | bigint[];
};

export type RequestFormInputType = {
  amount: null | bigint;
  token: TOKENS_TO_WITHDRAWLS;
  mode: 'lido' | 'dex';
} & ValidationResults;

export type RequestFormValidationContextType = {
  isWalletActive: boolean;
  asyncContext: Promise<RequestFormValidationAsyncContextType>;
  setIntermediateValidationResults: Dispatch<SetStateAction<ValidationResults>>;
};

export type RequestFormValidationAsyncContextType = {
  minUnstakeSteth: bigint;
  minUnstakeWSteth: bigint;
  balanceSteth: bigint;
  balanceWSteth: bigint;
  maxAmountPerRequestSteth: bigint;
  maxAmountPerRequestWSteth: bigint;
  stethTotalSupply: bigint;
  maxRequestCount: number;
};
export type RequestFormDataType = ReturnType<
  typeof useRequestFormDataContextValue
>;

export type ExtraRequestFormDataType = {
  isApprovalFlow: boolean;
  isApprovalFlowLoading: boolean;
  isTokenLocked: boolean;
  allowance: bigint | undefined;
  maxAmount?: bigint;
};

export type RequestFormDataContextValueType = RequestFormDataType &
  ExtraRequestFormDataType;
