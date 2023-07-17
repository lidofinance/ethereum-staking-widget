import { useMemo } from 'react';
import { useToken, useWithdrawalsBaseData } from 'features/withdrawals/hooks';
import { parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';

import {
  MAX_REQUESTS_COUNT,
  MAX_REQUESTS_COUNT_LEDGER_LIMIT,
} from 'features/withdrawals/withdrawals-constants';
import { isValidEtherValue } from 'utils';
import { useContractSWR, useWSTETHContractRPC } from '@lido-sdk/react';
import { TOKENS } from '@lido-sdk/constants';
import { STRATEGY_LAZY } from 'utils/swrStrategies';
import { useIsLedgerLive } from 'shared/hooks/useIsLedgerLive';

export const useSplitRequest = (inputValue: string) => {
  const isLedgerLive = useIsLedgerLive();
  const maxRequestCount = isLedgerLive
    ? MAX_REQUESTS_COUNT_LEDGER_LIMIT
    : MAX_REQUESTS_COUNT;
  const { token } = useToken();

  const wstethContract = useWSTETHContractRPC();
  const isWSteth = token === TOKENS.WSTETH;
  const maxAmountSteth = useWithdrawalsBaseData().data?.maxAmount;
  const maxAmountWsteth = useContractSWR({
    contract: wstethContract,
    method: 'getWstETHByStETH',
    params: [maxAmountSteth],
    shouldFetch: !!(isWSteth && maxAmountSteth),
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
    const max = maxAmount.mul(maxRequestCount);
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
  }, [inputValue, maxAmount, maxRequestCount]);
};
