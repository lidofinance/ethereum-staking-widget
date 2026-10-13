import { useMemo } from 'react';
import { useMaxGasPrice } from 'modules/web3';

type UseTokenMaxAmountArgs = {
  balance?: bigint; // user balance
  limit?: bigint; // upper limit
  gasLimit?: bigint; // operation gas limit, priced with the fee-history gas price
  gasCost?: bigint; // operation max cost in wei, takes precedence over gasLimit
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
  gasCost,
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
      const cost =
        gasCost ??
        (gasLimit && maxGasPrice ? gasLimit * maxGasPrice : undefined);
      // we return undefined if we should pad but don't have data
      if (cost !== undefined) {
        maxAmount = maxAmount - cost;
        if (maxAmount < 0n) maxAmount = 0n;
      } else maxAmount = undefined;
    }

    if (limit && maxAmount && maxAmount > limit) {
      maxAmount = limit;
    }

    return maxAmount;
  }, [
    balance,
    gasLimit,
    gasCost,
    padding,
    isLoading,
    isPadded,
    limit,
    maxGasPrice,
  ]);

  return maxAmount;
};
