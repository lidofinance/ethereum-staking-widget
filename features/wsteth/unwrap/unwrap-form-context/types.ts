import type { BigNumber } from 'ethers';

import type { useUnwrapFormNetworkData } from '../hooks/use-unwrap-form-network-data';
import { useUnwrapTxOnL2Approve } from '../hooks/use-unwrap-tx-on-l2-approve';

export type UnwrapFormApprovalData = ReturnType<typeof useUnwrapTxOnL2Approve>;

export type UnwrapFormInputType = {
  amount: null | BigNumber;
  dummyErrorField: null;
};

export type UnwrapFormNetworkData = ReturnType<typeof useUnwrapFormNetworkData>;

export type UnwrapFormValidationContext = {
  isWalletActive: boolean;
  maxAmount?: BigNumber;
};

export type UnwrapFormDataContextValueType = UnwrapFormNetworkData &
  UnwrapFormApprovalData;
