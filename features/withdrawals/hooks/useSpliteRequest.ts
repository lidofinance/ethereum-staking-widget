import { useMemo } from 'react';
import { useWithdrawalsConstants } from 'features/withdrawals/hooks';
import { parseEther, formatEther } from '@ethersproject/units';
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

    const requestsCount = parseEther(inputValue).div(maxAmount).toNumber();

    if (isMoreThanMax) return { requests: [], requestsCount };

    const lastRequestAmountEther = parseEther(inputValue).mod(maxAmount);
    const lastRequestAmount = lastRequestAmountEther;
    const requests: BigNumber[] = Array(requestsCount).fill(maxAmount);

    if (formatEther(lastRequestAmount) === '0.0')
      return { requests, requestsCount };

    requests.push(lastRequestAmount);
    return { requests, requestsCount };
  }, [inputValue, maxAmount]);

  return { requests, requestsCount };
};
