import type { useUnwrapFormNetworkData } from '../hooks/use-unwrap-form-network-data';
import { useUnwrapTxOnL2Approve } from '../hooks/use-unwrap-tx-on-l2-approve';

export type UnwrapFormApprovalData = ReturnType<typeof useUnwrapTxOnL2Approve>;

export type UnwrapFormInputType = {
  amount: null | bigint;
  dummyErrorField: null;
};

export type UnwrapFormNetworkData = ReturnType<typeof useUnwrapFormNetworkData>;

export type UnwrapFormValidationContext = {
  isWalletActive: boolean;
  maxAmount?: bigint;
};

export type UnwrapFormDataContextValueType = UnwrapFormNetworkData &
  UnwrapFormApprovalData;
