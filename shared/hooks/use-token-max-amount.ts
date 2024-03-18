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

// returns max amount that can be used for Max Button
export const useTokenMaxAmount = ({
  limit,
  balance,
  padding,
  gasLimit,
  isLoading = false,
  isPadded = false,
}: UseTokenMaxAmountArgs): BigNumber | undefined => {
  const { maxGasPrice } = useMaxGasPrice();

  const maxAmount = useMemo(() => {
    if (!balance || isLoading) return undefined;

    let maxAmount: BigNumber | undefined = balance;

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

    if (limit && maxAmount && maxAmount.gt(limit)) {
      maxAmount = limit;
    }

    return maxAmount;
  }, [balance, gasLimit, padding, isLoading, isPadded, limit, maxGasPrice]);

  return maxAmount;
};
