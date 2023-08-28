import type { useWrapFormNetworkData } from '../hooks/use-wrap-form-network-data';
import type { useWrapTxApprove } from '../hooks/use-wrap-tx-approve';

import type { BigNumber } from 'ethers';
import type { TokensWrappable } from 'features/wsteth/shared/types';
import type { computeWrapFormContextValues } from './compute-wrap-form-context-values';
import type { FormControllerContextValueType } from 'features/wsteth/shared/form-controller/form-controller-context';

export type WrapFormInputType = {
  amount: null | BigNumber;
  token: TokensWrappable;
};

export type WrapFormNetworkData = ReturnType<
  typeof useWrapFormNetworkData
>['networkData'];

export type WrapFormApprovalData = ReturnType<typeof useWrapTxApprove>;

export type WrapFormComputedContextValues = ReturnType<
  typeof computeWrapFormContextValues
>;

export type WrapFormDataContextValueType = WrapFormNetworkData &
  WrapFormApprovalData &
  WrapFormComputedContextValues &
  FormControllerContextValueType<WrapFormInputType> & {
    willReceiveWsteth?: BigNumber;
  };
