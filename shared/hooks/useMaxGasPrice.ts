import { useSDK } from '@lido-sdk/react';
import { ONE_GWEI } from 'config';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

export const useMaxGasPrice = (): BigNumber | undefined => {
  const [gasPrice, setGasPrice] = useState<BigNumber>();
  const { providerRpc } = useSDK();

  const getGasPrice = useCallback(async () => {
    if (providerRpc) {
      try {
        const feeData = await providerRpc.getFeeData();
        const maxGasPrice = feeData.maxFeePerGas ?? undefined;

        const gasPrice = await providerRpc.getGasPrice();
        setGasPrice(maxGasPrice || gasPrice);
      } catch (e) {
        console.error(e);
        setGasPrice(ONE_GWEI);
      }
    }
  }, [providerRpc]);

  useEffect(() => {
    getGasPrice();
  }, [getGasPrice]);

  return gasPrice;
};
