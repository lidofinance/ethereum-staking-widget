import { useMemo } from 'react';
import { useWithdrawalsConstants } from 'features/withdrawals/hooks';
import { parseEther, formatEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';

import { isValidEtherValue } from 'utils';

// max requests count for one tx
const MAX_REQUESTS_COUNT = 200;

export const useSplitRequest = (inputValue: string) => {
  const { maxAmount } = useWithdrawalsConstants();

  const requests = useMemo(() => {
    if (
      !maxAmount ||
      !inputValue ||
      isNaN(Number(inputValue)) ||
      !isValidEtherValue(inputValue)
    )
      return;

    const max = maxAmount.mul(MAX_REQUESTS_COUNT);
    const isMoreThanMax = parseEther(inputValue).gt(max);

    if (isMoreThanMax) return;

    const requestsCount = parseEther(inputValue).div(maxAmount).toNumber();
    const lastRequestAmountEther = parseEther(inputValue).mod(maxAmount);
    const lastRequestAmount = lastRequestAmountEther;
    const items: BigNumber[] = Array(requestsCount).fill(maxAmount);

    if (formatEther(lastRequestAmount) === '0.0') return items;

    items.push(lastRequestAmount);
    return items;
  }, [inputValue, maxAmount]);

  return { requests };
};
