import { useLidoSWR, useSDK } from '@lido-sdk/react';
import { ONE_GWEI } from 'config';

import { BigNumber } from 'ethers';
import invariant from 'tiny-invariant';
import { getFeeData } from 'utils/getFeeData';

export const useMaxGasPrice = (): BigNumber | undefined => {
  const { chainId } = useSDK();
  const { data: maxGasPrice } = useLidoSWR(
    ['swr:max-gas-price', chainId],
    async () => {
      try {
        const feeData = await getFeeData(chainId);

        if (feeData.maxFeePerGas) {
          return feeData.maxFeePerGas;
        }
        if (feeData.gasPrice) {
          return feeData.gasPrice;
        }
        invariant(false, 'must have some gas data');
      } catch (e) {
        console.error(e);
      }
      return ONE_GWEI;
    },
    { isPaused: () => !chainId },
  );

  return maxGasPrice;
};
