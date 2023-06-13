import { useMemo } from 'react';
import { useToken, useWithdrawalsBaseData } from 'features/withdrawals/hooks';
import { parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';

import { MAX_REQUESTS_COUNT } from 'features/withdrawals/withdrawals-constants';
import { isValidEtherValue } from 'utils';
import { useContractSWR } from '@lido-sdk/react';
import { WstethAbi } from '@lido-sdk/contracts';
import { TOKENS } from '@lido-sdk/constants';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

export const useSplitRequest = (inputValue: string) => {
  const { token, tokenContract } = useToken();
  const isWSteth = token === TOKENS.WSTETH;
  const maxAmountSteth = useWithdrawalsBaseData().data?.maxAmount;
  const maxAmountWsteth = useContractSWR({
    contract: tokenContract as WstethAbi,
    method: 'getWstETHByStETH',
    params: [maxAmountSteth],
    shouldFetch: !!(isWSteth && tokenContract && maxAmountSteth),
    config: STRATEGY_LAZY,
  }).data;

  const maxAmount = isWSteth ? maxAmountWsteth : maxAmountSteth;

  return useMemo(() => {
    if (
      !maxAmount ||
      !inputValue ||
      isNaN(Number(inputValue)) ||
      !isValidEtherValue(inputValue)
    )
      return { requests: [], requestCount: 0, areRequestsValid: false };

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
        areRequestsValid: false,
      };
    }

    for (let i = 0; i < requestCount; i++) {
      requests.push(maxAmount);
    }
    if (hasRest) requests.push(lastRequestAmountEther);

    return {
      requests,
      requestCount: requestCount + (hasRest ? 1 : 0),
      areRequestsValid: requests.length > 0,
    };
  }, [inputValue, maxAmount]);
};
