import { useLidoSWR } from '@lido-sdk/react';

import { getFeeData } from 'utils/getFeeData';
import { STRATEGY_LAZY } from 'consts/swr-strategies';

import { useCurrentStaticRpcProvider } from './use-current-static-rpc-provider';

export const useMaxGasPrice = () => {
  const { chainId, staticRpcProvider } = useCurrentStaticRpcProvider();

  const swr = useLidoSWR(
    ['swr:max-gas-price', chainId],
    async () => {
      const { maxFeePerGas } = await getFeeData(staticRpcProvider);
      return maxFeePerGas;
    },
    STRATEGY_LAZY,
  );

  return {
    get maxGasPrice() {
      return swr.data;
    },
    get initialLoading() {
      return swr.initialLoading;
    },
    get error() {
      return swr.error;
    },
    get loading() {
      return swr.loading;
    },
    update() {
      return swr.update;
    },
  };
};
