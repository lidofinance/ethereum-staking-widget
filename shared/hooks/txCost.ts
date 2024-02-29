import type { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { useMaxGasPrice } from './useMaxGasPrice';
import { useEthUsd } from './use-eth-usd';

type UseTxCostInUsd = (gasLimit?: BigNumber) => number | undefined;

export const useTxCostInUsd: UseTxCostInUsd = (gasLimit) => {
  const { maxGasPrice } = useMaxGasPrice();
  const amount = useMemo(
    () => (maxGasPrice && gasLimit ? maxGasPrice.mul(gasLimit) : undefined),
    [gasLimit, maxGasPrice],
  );
  return useEthUsd(amount).usdAmount;
};
