import { useLidoSWR, useSDK } from '@lido-sdk/react';

import { BigNumber } from 'ethers';
import { getFeeData } from 'utils/getFeeData';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

export const useMaxGasPrice = (): BigNumber | undefined => {
  const { chainId } = useSDK();
  const { data: maxGasPrice } = useLidoSWR(
    ['swr:max-gas-price', chainId],
    async () => {
      const { maxFeePerGas } = await getFeeData(chainId);
      return maxFeePerGas;
    },
    STRATEGY_LAZY,
  );

  return maxGasPrice;
};
