import type { useUnwrapFormNetworkData } from '../hooks/use-unwrap-form-network-data';

import type { BigNumber } from 'ethers';
import type { FormControllerContextValueType } from 'shared/hook-form/form-controller/form-controller-context';

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
  FormControllerContextValueType<UnwrapFormInputType>;
