import { useMemo } from 'react';
import { BigNumber } from 'ethers';
import { useMaxGasPrice } from 'modules/web3';
import { Zero } from '@ethersproject/constants';

type UseTokenMaxAmountArgs = {
  balance?: BigNumber; // user balance
  limit?: BigNumber; // upper limit
  gasLimit?: bigint; // operation gas limit
  padding?: bigint; // untouchable amount to leave to user
  isPadded?: boolean;
  isLoading?: boolean;
};

// TODO: NEW_SDK (after stake iteration migrate to BigInt)
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
        const _padding = BigNumber.from(padding);
        maxAmount = maxAmount.sub(_padding);
      }
      // we return undefined if we should pad but don't have data
      if (gasLimit && maxGasPrice) {
        const _maxGasPrice = BigNumber.from(maxGasPrice);
        const _gasLimit = BigNumber.from(gasLimit);
        maxAmount = maxAmount.sub(_gasLimit.mul(_maxGasPrice));
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
