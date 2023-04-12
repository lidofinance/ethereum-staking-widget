import { useMemo } from 'react';
import { useWithdrawalsConstants } from 'features/withdrawals/hooks';
import { parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';

import { MAX_REQUESTS_COUNT } from 'features/withdrawals/withdrawalsConstants';
import { isValidEtherValue } from 'utils';

export const useSplitRequest = (inputValue: string) => {
  const { maxAmount } = useWithdrawalsConstants();

  const { requests, requestsCount } = useMemo(() => {
    if (
      !maxAmount ||
      !inputValue ||
      isNaN(Number(inputValue)) ||
      !isValidEtherValue(inputValue)
    )
      return { requests: [], requestsCount: 0 };

    const max = maxAmount.mul(MAX_REQUESTS_COUNT);
    const isMoreThanMax = parseEther(inputValue).gt(max);

    let requestsCount = parseEther(inputValue).div(maxAmount).toNumber();
    const lastRequestAmountEther = parseEther(inputValue).mod(maxAmount);
    const hasRest = lastRequestAmountEther.gt(0);
    if (hasRest) requestsCount++;

    if (isMoreThanMax) return { requests: [], requestsCount };

    const lastRequestAmount = lastRequestAmountEther;
    const requests: BigNumber[] = Array(requestsCount).fill(maxAmount);

    if (hasRest) requests.push(lastRequestAmount);

    return { requests, requestsCount };
  }, [inputValue, maxAmount]);

  return { requests, requestsCount };
};
