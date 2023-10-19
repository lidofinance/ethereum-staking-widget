import type { useWrapFormNetworkData } from '../hooks/use-wrap-form-network-data';
import type { useWrapTxApprove } from '../hooks/use-wrap-tx-approve';

import type { BigNumber } from 'ethers';
import type { TokensWrappable } from 'features/wsteth/shared/types';
import type { FormControllerContextValueType } from 'shared/hook-form/form-controller/form-controller-context';

export type WrapFormInputType = {
  amount: null | BigNumber;
  token: TokensWrappable;
};

export type WrapFormNetworkData = ReturnType<typeof useWrapFormNetworkData>;

export type WrapFormApprovalData = ReturnType<typeof useWrapTxApprove>;

export type WrapFormValidationContext = {
  active: boolean;
  maxAmountETH?: BigNumber;
  maxAmountStETH?: BigNumber;
};

export type WrapFormDataContextValueType = WrapFormNetworkData &
  WrapFormApprovalData &
  FormControllerContextValueType<WrapFormInputType> & {
    isSteth: boolean;
    maxAmount?: BigNumber;
    wrapGasLimit?: BigNumber;
    willReceiveWsteth?: BigNumber;
  };
