import { TOKENS } from '@lido-sdk/constants';
import { BigNumber } from 'ethers';
import { Dispatch, SetStateAction } from 'react';
import { useRequestFormDataContextValue } from './use-request-form-data-context-value';

export type ValidationResults = {
  requests: null | BigNumber[];
};

export type RequestFormInputType = {
  amount: null | BigNumber;
  token: TOKENS.STETH | TOKENS.WSTETH;
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
  onSubmit: React.FormEventHandler<HTMLFormElement>;
};

export type RequestFormDataContextValueType = RequestFormDataType &
  ExtraRequestFormDataType;
