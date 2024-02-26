import { BigNumber } from 'ethers';
import { useMemo } from 'react';

import { useEthPrice } from '@lido-sdk/react';
import { weiToEth } from 'utils/weiToEth';
import { STRATEGY_LAZY } from 'consts/swr-strategies';

export const useEthUsd = (amount?: BigNumber): number | undefined => {
  const { data: price } = useEthPrice(STRATEGY_LAZY);
  return useMemo(() => {
    if (price && amount) {
      const txCostInEth = weiToEth(amount);
      return txCostInEth * price;
    }
    return undefined;
  }, [amount, price]);
};
