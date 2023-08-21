import type { BigNumber } from 'ethers';
import type { TokensWrappable } from 'features/wrap/types';
import type { useWrapFormNetworkData } from './use-wrap-form-network-data';
import type { computeWrapFormContextValues } from './compute-wrap-form-context-values';
import type { useWrapTxApprove } from '../wrap-form/hooks/use-wrap-tx-approve';

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
  WrapFormComputedContextValues & {
    willReceiveWsteth?: BigNumber;
    onSubmit: NonNullable<React.ComponentProps<'form'>['onSubmit']>;
  };
