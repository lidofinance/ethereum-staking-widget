import { Address } from 'viem';
import type { useWrapFormNetworkData } from '../hooks/use-wrap-form-network-data';
import type { useWrapTxOnL1Approve } from '../hooks/use-wrap-tx-on-l1-approve';

import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';
import { StakeLimitFullInfo } from 'shared/hooks';
import { LIMIT_LEVEL } from 'types';

export type WrapFormInputType = {
  amount: bigint | null;
  token: TOKENS_TO_WRAP;
  referral: Address | null;
};

export type WrapFormNetworkData = ReturnType<typeof useWrapFormNetworkData>;

export type WrapFormApprovalData = ReturnType<typeof useWrapTxOnL1Approve>;

export type WrapFormValidationContext = {
  asyncContext: Promise<WrapFormAsyncValidationContext>;
};

export type WrapFormAsyncValidationContext = {
  stakingLimitLevel: LIMIT_LEVEL;
  currentStakeLimit: bigint;
  shouldValidateEtherBalance: boolean;
  gasCost: bigint;
} & (
  | {
      isWalletActive: true;
      stethBalance: bigint;
      etherBalance: bigint;
      isSmartAccount: boolean;
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
