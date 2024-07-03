import type { useWrapFormNetworkData } from '../hooks/use-wrap-form-network-data';
import type { useWrapTxApprove } from '../hooks/use-wrap-tx-approve';

import type { BigNumber } from 'ethers';
import type { TokensWrappable } from 'features/wsteth/shared/types';
import { StakeLimitFullInfo } from 'shared/hooks';
import { LIMIT_LEVEL } from 'types';

export type WrapFormInputType = {
  amount: null | BigNumber;
  token: TokensWrappable;
};

export type WrapFormNetworkData = ReturnType<typeof useWrapFormNetworkData>;

export type WrapFormApprovalData = ReturnType<typeof useWrapTxApprove>;

export type WrapFormValidationContext = {
  asyncContext: Promise<WrapFormAsyncValidationContext>;
};

export type WrapFormAsyncValidationContext = {
  stakingLimitLevel: LIMIT_LEVEL;
  currentStakeLimit: BigNumber;
  gasCost: BigNumber;
} & (
  | {
      isWalletActive: true;
      stethBalance: BigNumber;
      etherBalance: BigNumber;
      isMultisig: boolean;
    }
  | {
      isWalletActive: false;
    }
);

export type WrapFormDataContextValueType = WrapFormNetworkData &
  WrapFormApprovalData & {
    isSteth: boolean;
    maxAmount?: BigNumber;
    wrapGasLimit: BigNumber;
    stakeLimitInfo?: StakeLimitFullInfo;
  };
