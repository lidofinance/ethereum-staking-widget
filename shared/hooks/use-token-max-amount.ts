import { useMemo } from 'react';
import { ZERO, useMaxGasPrice } from 'modules/web3';

type UseTokenMaxAmountArgs = {
  balance?: bigint; // user balance
  limit?: bigint; // upper limit
  gasLimit?: bigint; // operation gas limit
  padding?: bigint; // untouchable amount to leave to user
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
}: UseTokenMaxAmountArgs): bigint | undefined => {
  const { maxGasPrice } = useMaxGasPrice();

  const maxAmount = useMemo(() => {
    if (!balance || isLoading) return undefined;

    let maxAmount: bigint | undefined = balance;

    if (isPadded) {
      if (padding) {
        maxAmount = maxAmount - padding;
      }
      // we return undefined if we should pad but don't have data
      if (gasLimit && maxGasPrice) {
        maxAmount = maxAmount - gasLimit * maxGasPrice;
        if (maxAmount < ZERO) maxAmount = ZERO;
      } else maxAmount = undefined;
    }

    if (limit && maxAmount && maxAmount > limit) {
      maxAmount = limit;
    }

    return maxAmount;
  }, [balance, gasLimit, padding, isLoading, isPadded, limit, maxGasPrice]);

  return maxAmount;
};
