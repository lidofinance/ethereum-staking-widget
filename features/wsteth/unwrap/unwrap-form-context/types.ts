import type { BigNumber } from 'ethers';
import type { useUnwrapFormNetworkData } from '../hooks/use-unwrap-form-network-data';

export type UnwrapFormInputType = {
  amount: null | BigNumber;
};

export type UnwrapFormNetworkData = ReturnType<
  typeof useUnwrapFormNetworkData
>['networkData'];

export type UnwrapFormDataContextValueType = UnwrapFormNetworkData & {
  willReceiveStETH?: BigNumber;
  onSubmit: (args: UnwrapFormInputType) => Promise<boolean>;
};
