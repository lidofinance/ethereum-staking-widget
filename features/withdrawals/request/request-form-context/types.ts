import type { TOKENS } from '@lido-sdk/constants';
import type { BigNumber } from 'ethers';
import type { Dispatch, SetStateAction } from 'react';
import type { useRequestFormNetworkData } from './use-request-form-newtork-data';

export type ValidationResults = {
  requests: null | BigNumber[];
};

export type RequestFormInputType = {
  amount: null | BigNumber;
  token: TOKENS.STETH | TOKENS.WSTETH;
  mode: 'lido' | 'dex';
} & ValidationResults;

export type SetIntermediateValidationResults = Dispatch<
  SetStateAction<ValidationResults>
>;

export type RequestFormNetworkData = ReturnType<
  typeof useRequestFormNetworkData
>['networkData'];

export type RequestFormDataContextValueType = RequestFormNetworkData & {
  isApprovalFlow: boolean;
  isApprovalFlowLoading: boolean;
  isTokenLocked: boolean;
  allowance: BigNumber;
  maxAmount?: BigNumber;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
};
