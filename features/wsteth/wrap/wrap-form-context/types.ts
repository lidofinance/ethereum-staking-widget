import type { useWrapFormNetworkData } from '../hooks/use-wrap-form-network-data';
import type { useWrapTxOnL1Approve } from '../hooks/use-wrap-tx-on-l1-approve';

import type { TOKENS_WRAPPABLE } from 'features/wsteth/shared/types';
import { StakeLimitFullInfo } from 'shared/hooks';
import { LIMIT_LEVEL } from 'types';

export type WrapFormInputType = {
  amount: null | bigint;
  token: TOKENS_WRAPPABLE;
};

export type WrapFormNetworkData = ReturnType<typeof useWrapFormNetworkData>;

export type WrapFormApprovalData = ReturnType<typeof useWrapTxOnL1Approve>;

export type WrapFormValidationContext = {
  asyncContext: Promise<WrapFormAsyncValidationContext>;
};

export type WrapFormAsyncValidationContext = {
  stakingLimitLevel: LIMIT_LEVEL;
  currentStakeLimit: bigint;
  gasCost: bigint;
} & (
  | {
      isWalletActive: true;
      stethBalance: bigint;
      etherBalance: bigint;
      isMultisig: boolean;
    }
  | {
      isWalletActive: false;
    }
);

export type WrapFormDataContextValueType = WrapFormNetworkData &
  WrapFormApprovalData & {
    isSteth: boolean;
    maxAmount?: bigint;
    wrapGasLimit: bigint;
    stakeLimitInfo?: StakeLimitFullInfo;
  };
