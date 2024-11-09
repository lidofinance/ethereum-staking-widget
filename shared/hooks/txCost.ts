import { useMemo } from 'react';
import { useMaxGasPrice } from 'modules/web3';
import { useEthUsd } from './use-eth-usd';

// TODO: NEW_SDK (remove)
// DEPRECATED
export const useTxCostInUsd = (gasLimit?: bigint, chainIdForce?: number) => {
  const { maxGasPrice, ...gasSwr } = useMaxGasPrice(chainIdForce);

  const ethAmount = useMemo(
    () => (maxGasPrice && gasLimit ? maxGasPrice * gasLimit : undefined),
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
