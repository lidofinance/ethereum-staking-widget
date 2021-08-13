import { useWeb3 } from '@lido-sdk/web3-react';
import { ONE_GWEI } from 'config';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

export const useGasPrice = (): BigNumber | undefined => {
  const [gasPrice, setGasPrice] = useState<BigNumber>();
  const { library } = useWeb3();

  const getGasPrice = useCallback(async () => {
    if (library) {
      try {
        const newGasPrice = await library.getGasPrice();
        setGasPrice(newGasPrice);
      } catch (e) {
        console.error(e);
        setGasPrice(ONE_GWEI);
      }
    }
  }, [library]);

  useEffect(() => {
    getGasPrice();
  }, [getGasPrice]);

  return gasPrice;
};
