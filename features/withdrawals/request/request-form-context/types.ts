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
export type RequestFormDataType = ReturnType<
  typeof useRequestFormDataContextValue
>;

export type ExtraRequestFormDataType = {
  isApprovalFlow: boolean;
  isApprovalFlowLoading: boolean;
  isTokenLocked: boolean;
  allowance: BigNumber;
  onSubmit: NonNullable<React.ComponentProps<'form'>['onSubmit']>;
};

export type RequestFormDataContextValueType = RequestFormDataType &
  ExtraRequestFormDataType;
