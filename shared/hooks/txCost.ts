import type { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { useMaxGasPrice } from './useMaxGasPrice';
import { useEthUsd } from './use-eth-usd';

export const useTxCostInUsd = (gasLimit?: BigNumber) => {
  const { maxGasPrice, ...gasSwr } = useMaxGasPrice();
  const ethAmount = useMemo(
    () => (maxGasPrice && gasLimit ? maxGasPrice.mul(gasLimit) : undefined),
    [gasLimit, maxGasPrice],
  );
  const ethUsdSwr = useEthUsd(ethAmount);
  return {
    maxGasPrice: maxGasPrice,
    txCostUsd: ethUsdSwr.usdAmount,
    get initialLoading() {
      return gasSwr.initialLoading || ethUsdSwr.initialLoading;
    },
    get error() {
      return gasSwr.error || ethUsdSwr.error;
    },
    get loading() {
      return gasSwr.loading || ethUsdSwr.loading;
    },
    update() {
      return Promise.all([gasSwr.update(), ethUsdSwr.update()]);
    },
  };
};
