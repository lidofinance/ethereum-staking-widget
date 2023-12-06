import { useMemo } from 'react';
import { SWRResponse, useLidoSWR } from '@lido-sdk/react';
import { dynamics } from 'config';

import { useDebouncedValue } from 'shared/hooks';
import { encodeURLQuery } from 'utils/encodeURLQuery';
import { standardFetcher } from 'utils/standardFetcher';
import { STRATEGY_EAGER } from 'utils/swrStrategies';
import { FetcherError } from 'utils/fetcherError';

import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';

const DEFAULT_DAYS_VALUE = 5;

type useWaitingTimeOptions = {
  isApproximate?: boolean;
};

type RequestTimeV2Dto = {
  requestInfo: {
    finalizationIn: number;
    finalizationAt: string;
  };
  nextCalculationAt: string;
};

// TODO: accept big Number
export const useWaitingTime = (
  amount: string,
  options: useWaitingTimeOptions = {},
) => {
  const { isApproximate } = options;
  const debouncedAmount = useDebouncedValue(amount, 1000);
  const url = useMemo(() => {
    const basePath = dynamics.wqAPIBasePath;
    const params = encodeURLQuery({ amount: debouncedAmount });
    const queryString = params ? `?${params}` : '';
    return `${basePath}/v2/request-time/calculate${queryString}`;
  }, [debouncedAmount]);

  const { data, initialLoading, error } = useLidoSWR(url, standardFetcher, {
    ...STRATEGY_EAGER,
    shouldRetryOnError: (e: unknown) => {
      // if api is not happy about our request - no retry
      return !(e && typeof e == 'object' && 'status' in e && e.status == 400);
    },
  }) as SWRResponse<RequestTimeV2Dto>;
  const { isBunker, isPaused } = useWithdrawals();
  const isRequestError = error instanceof FetcherError && error.status < 500;

  const ms = data?.requestInfo?.finalizationIn;
  const days = ms ? Math.ceil(ms / (24 * 60 * 60 * 1000)) : DEFAULT_DAYS_VALUE;

  const waitingTime =
    days && days > 1
      ? `${isApproximate ? '~ ' : ''}1-${days} day(s)`
      : `${isApproximate ? '~ ' : ''}${days} day`;
  const value =
    isPaused || isRequestError ? '—' : isBunker ? 'Not estimated' : waitingTime;

  return {
    ...data,
    initialLoading,
    error,
    days,
    value,
  };
};
