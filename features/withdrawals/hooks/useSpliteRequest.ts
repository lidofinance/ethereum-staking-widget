import { useMemo } from 'react';
import { useWithdrawalsConstants } from 'features/withdrawals/hooks';
import { parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';

import { MAX_REQUESTS_COUNT } from 'features/withdrawals/withdrawalsConstants';
import { isValidEtherValue } from 'utils';

export const useSplitRequest = (inputValue: string) => {
  const { maxAmount } = useWithdrawalsConstants();

  const { requests, requestCount } = useMemo(() => {
    if (
      !maxAmount ||
      !inputValue ||
      isNaN(Number(inputValue)) ||
      !isValidEtherValue(inputValue)
    )
      return { requests: [], requestCount: 0 };

    const max = maxAmount.mul(MAX_REQUESTS_COUNT);
    const isMoreThanMax = parseEther(inputValue).gt(max);

    let requestCount = parseEther(inputValue).div(maxAmount).toNumber();
    const lastRequestAmountEther = parseEther(inputValue).mod(maxAmount);
    const hasRest = lastRequestAmountEther.gt(0);

    if (hasRest) requestCount++;
    if (isMoreThanMax) return { requests: [], requestCount };

    const requests: BigNumber[] = Array(requestCount).fill(maxAmount);
    if (hasRest) requests.push(lastRequestAmountEther);

    return { requests, requestCount };
  }, [inputValue, maxAmount]);

  return { requests, requestCount };
};
