import { BigNumber } from 'ethers';
import { TokensWithdrawable } from 'features/withdrawals/types/tokens-withdrawable';
import { Dispatch, SetStateAction } from 'react';
import { useRequestFormDataContextValue } from './use-request-form-data-context-value';

export type ValidationResults = {
  requests: null | BigNumber[];
};

export type RequestFormInputType = {
  amount: null | BigNumber;
  token: TokensWithdrawable;
  mode: 'lido' | 'dex';
} & ValidationResults;

export type RequestFormValidationContextType = {
  isWalletActive: boolean;
  asyncContext: Promise<RequestFormValidationAsyncContextType>;
  setIntermediateValidationResults: Dispatch<SetStateAction<ValidationResults>>;
};

export type RequestFormValidationAsyncContextType = {
  minUnstakeSteth: BigNumber;
  minUnstakeWSteth: BigNumber;
  balanceSteth: BigNumber;
  balanceWSteth: BigNumber;
  maxAmountPerRequestSteth: BigNumber;
  maxAmountPerRequestWSteth: BigNumber;
  stethTotalSupply: BigNumber;
  maxRequestCount: number;
};
export type RequestFormDataType = ReturnType<
  typeof useRequestFormDataContextValue
>;

export type ExtraRequestFormDataType = {
  isApprovalFlow: boolean;
  isApprovalFlowLoading: boolean;
  isTokenLocked: boolean;
  allowance: BigNumber | undefined;
  maxAmount?: BigNumber;
};

export type RequestFormDataContextValueType = RequestFormDataType &
  ExtraRequestFormDataType;
