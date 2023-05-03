import { useMemo } from 'react';
import { useWithdrawalsBaseData } from 'features/withdrawals/hooks';
import { parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';

import { MAX_REQUESTS_COUNT } from 'features/withdrawals/withdrawalsConstants';
import { isValidEtherValue } from 'utils';

export const useSplitRequest = (inputValue: string) => {
  const wqBaseData = useWithdrawalsBaseData();
  const { maxAmount } = wqBaseData.data ?? {};

  const { requests, requestCount } = useMemo(() => {
    if (
      !maxAmount ||
      !inputValue ||
      isNaN(Number(inputValue)) ||
      !isValidEtherValue(inputValue)
    )
      return { requests: [], requestCount: 0 };

    const parsedInputValue = parseEther(inputValue);
    const max = maxAmount.mul(MAX_REQUESTS_COUNT);
    const isMoreThanMax = parsedInputValue.gt(max);

    const requestCount = parsedInputValue.div(maxAmount).toNumber();
    const lastRequestAmountEther = parsedInputValue.mod(maxAmount);
    const hasRest = lastRequestAmountEther.gt(0);
    const requests: BigNumber[] = [];

    if (isMoreThanMax) {
      return {
        requests,
        requestCount: requestCount + (hasRest ? 1 : 0),
      };
    }

    for (let i = 0; i < requestCount; i++) {
      requests.push(maxAmount);
    }
    if (hasRest) requests.push(lastRequestAmountEther);

    return {
      requests,
      requestCount: requestCount + (hasRest ? 1 : 0),
    };
  }, [inputValue, maxAmount]);

  return { requests, requestCount };
};
