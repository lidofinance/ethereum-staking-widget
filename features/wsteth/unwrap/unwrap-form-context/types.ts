import type { useUnwrapFormNetworkData } from '../hooks/use-unwrap-form-network-data';

import type { BigNumber } from 'ethers';

export type UnwrapFormInputType = {
  amount: null | BigNumber;
};

export type UnwrapFormNetworkData = ReturnType<typeof useUnwrapFormNetworkData>;

export type UnwrapFormValidationContext = {
  active: boolean;
  maxAmount?: BigNumber;
};

export type UnwrapFormDataContextValueType = UnwrapFormNetworkData & {
  willReceiveStETH?: BigNumber;
};
