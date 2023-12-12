import { useMemo } from 'react';
import { BigNumber } from 'ethers';
import { useMaxGasPrice } from './useMaxGasPrice';
import { Zero } from '@ethersproject/constants';

type UseTokenMaxAmountArgs = {
  balance?: BigNumber; // user balance
  limit?: BigNumber; // upper limit
  gasLimit?: BigNumber; // operation gas limit
  padding?: BigNumber; // untouchable amount to leave to user
  isPadded?: boolean;
  isLoading?: boolean;
};

export const useTokenMaxAmount = ({
  limit,
  balance,
  padding,
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
      if (padding) {
        maxAmount = maxAmount.sub(padding);
      }
      // we return undefined if we should pad but don't have data
      if (gasLimit && maxGasPrice) {
        maxAmount = maxAmount.sub(gasLimit.mul(maxGasPrice));
        if (maxAmount.lt(Zero)) maxAmount = Zero;
      } else maxAmount = undefined;
    }

    return maxAmount;
  }, [balance, gasLimit, padding, isLoading, isPadded, limit, maxGasPrice]);

  return maxAmount;
};
