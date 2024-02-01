import type { useWrapFormNetworkData } from '../hooks/use-wrap-form-network-data';
import type { useWrapTxApprove } from '../hooks/use-wrap-tx-approve';

import type { BigNumber } from 'ethers';
import type { TokensWrappable } from 'features/wsteth/shared/types';
import type { FormControllerContextValueType } from 'shared/hook-form/form-controller/form-controller-context';
import { StakeLimitFullInfo } from 'shared/hooks';
import { LIMIT_LEVEL } from 'types';

export type WrapFormInputType = {
  amount: null | BigNumber;
  token: TokensWrappable;
};

export type WrapFormNetworkData = ReturnType<typeof useWrapFormNetworkData>;

export type WrapFormApprovalData = ReturnType<typeof useWrapTxApprove>;

export type WrapFormValidationContext = {
  active: boolean;
  asyncContext: Promise<WrapFormAsyncValidationContext>;
};

export type WrapFormAsyncValidationContext = {
  stethBalance: BigNumber;
  etherBalance: BigNumber;
  stakingLimitLevel: LIMIT_LEVEL;
  currentStakeLimit: BigNumber;
  gasCost: BigNumber;
  isMultisig: boolean;
};

export type WrapFormDataContextValueType = WrapFormNetworkData &
  WrapFormApprovalData &
  FormControllerContextValueType<WrapFormInputType> & {
    isSteth: boolean;
    maxAmount?: BigNumber;
    wrapGasLimit: BigNumber;
    willReceiveWsteth?: BigNumber;
    stakeLimitInfo?: StakeLimitFullInfo;
  };
