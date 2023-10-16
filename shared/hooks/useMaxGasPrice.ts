import { BigNumber } from 'ethers';
import invariant from 'tiny-invariant';

import { useLidoSWR } from '@lido-sdk/react';

import { ONE_GWEI } from 'config';
import { getFeeData } from 'utils/getFeeData';

import { useCurrentProvider } from './use-current-provider';

export const useMaxGasPrice = (): BigNumber | undefined => {
  const { chainId, provider } = useCurrentProvider();

  const { data: maxGasPrice } = useLidoSWR(
    ['swr:max-gas-price', chainId],
    async () => {
      try {
        const feeData = await getFeeData(provider);

        if (feeData.maxFeePerGas) {
          return feeData.maxFeePerGas;
        }
        if (feeData.gasPrice) {
          return feeData.gasPrice;
        }
        invariant(false, 'must have some gas data');
      } catch (error) {
        console.error(error);
      }
      return ONE_GWEI;
    },
    { isPaused: () => !chainId },
  );

  return maxGasPrice;
};
