import { BigNumber } from 'ethers';
import { useMemo } from 'react';

import { useEthPrice } from '@lido-sdk/react';
import { weiToEth } from 'utils/weiToEth';
import { STRATEGY_LAZY } from 'consts/swr-strategies';

// TODO: NEW_SDK
//  - (not use useEthPrice from '@lido-sdk/react')
//  - use own code
// DEPRECATED
export const useEthUsd = (amount?: BigNumber) => {
  const { data: price, ...swr } = useEthPrice({
    ...STRATEGY_LAZY,
  });

  const usdAmount = useMemo(() => {
    if (price && amount) {
      const txCostInEth = weiToEth(amount);
      return txCostInEth * price;
    }
    return undefined;
  }, [amount, price]);

  return {
    usdAmount,
    price,
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
      return swr.update();
    },
  };
};
