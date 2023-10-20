import { BigNumberish } from 'ethers';
import { useMemo } from 'react';
import { useMaxGasPrice } from './useMaxGasPrice';
import { useEthUsd } from './use-eth-usd';

type UseTxCostInUsd = (gasLimit?: BigNumberish) => number | undefined;

export const useTxCostInUsd: UseTxCostInUsd = (gasLimit) => {
  const gasPrice = useMaxGasPrice();
  const amount = useMemo(
    () => (gasPrice && gasLimit ? gasPrice.mul(gasLimit) : undefined),
    [gasLimit, gasPrice],
  );
  return useEthUsd(amount);
};
