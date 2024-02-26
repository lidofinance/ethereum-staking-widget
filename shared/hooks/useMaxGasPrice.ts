import { useLidoSWR } from '@lido-sdk/react';

import { BigNumber } from 'ethers';

import { getFeeData } from 'utils/getFeeData';
import { STRATEGY_LAZY } from 'consts/swr-strategies';

import { useCurrentStaticRpcProvider } from './use-current-static-rpc-provider';

export const useMaxGasPrice = (): BigNumber | undefined => {
  const { chainId, staticRpcProvider } = useCurrentStaticRpcProvider();

  const { data: maxGasPrice } = useLidoSWR(
    ['swr:max-gas-price', chainId],
    async () => {
      const { maxFeePerGas } = await getFeeData(staticRpcProvider);
      return maxFeePerGas;
    },
    STRATEGY_LAZY,
  );

  return maxGasPrice;
};
