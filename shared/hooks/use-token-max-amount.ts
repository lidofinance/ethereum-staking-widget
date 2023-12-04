import { useMemo } from 'react';
import { BigNumber } from 'ethers';
import { useMaxGasPrice } from './useMaxGasPrice';
import { Zero } from '@ethersproject/constants';

type UseTokenMaxAmountArgs = {
  balance?: BigNumber;
  limit?: BigNumber;
  gasLimit?: BigNumber;
  isPadded?: boolean;
  isLoading?: boolean;
};

export const useTokenMaxAmount = ({
  limit,
  balance,
  gasLimit,
  isLoading = false,
  isPadded = false,
}: UseTokenMaxAmountArgs): BigNumber | undefined => {
  const maxGasPrice = useMaxGasPrice();

  const maxAmount = useMemo(() => {
    let maxAmount: BigNumber | undefined = undefined;
    if (!balance || isLoading) return maxAmount;
    maxAmount = balance;

    if (limit && balance.gt(limit)) {
      maxAmount = limit;
    }

    if (isPadded) {
      // we return undefined if we should pad but don't have data
      if (gasLimit && maxGasPrice) {
        maxAmount = maxAmount.sub(gasLimit.mul(maxGasPrice));
        if (maxAmount.lt(Zero)) maxAmount = Zero;
      } else maxAmount = undefined;
    }

    return maxAmount;
  }, [balance, gasLimit, isLoading, isPadded, limit, maxGasPrice]);

  return maxAmount;
};
