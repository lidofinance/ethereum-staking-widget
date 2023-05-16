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

type RequestTimeResponse = {
  days: number;
  stethLastUpdate: number;
  validatorsLastUpdate: number;
  steth: string;
  requests: number;
};

type useWaitingTimeOptions = {
  isApproximate?: boolean;
};

export const useWaitingTime = (
  amount: string,
  options: useWaitingTimeOptions = {},
) => {
  const { isApproximate } = options;
  const debouncedAmount = useDebouncedValue(amount, 1000);
  const url = useMemo(() => {
    const basePath = dynamics.wqAPIBasePath;
    const params = encodeURLQuery({ amount: debouncedAmount });

    return `${basePath}/v1/request-time${params ? `?${params}` : ''}`;
  }, [debouncedAmount]);

  const { data, initialLoading, error } = useLidoSWR(url, standardFetcher, {
    ...STRATEGY_EAGER,
    shouldRetryOnError: (e: unknown) => {
      // if api is not happy about our request - no retry
      if (e && typeof e == 'object' && 'status' in e && e.status == 400)
        return false;
      return true;
    },
  }) as SWRResponse<RequestTimeResponse>;
  const { isBunker, isPaused } = useWithdrawals();
  const isRequestError = error instanceof FetcherError && error.status < 500;

  const stethLastUpdate =
    data?.stethLastUpdate && new Date(data?.stethLastUpdate * 1000);
  const days = data?.days ?? DEFAULT_DAYS_VALUE;

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
    stethLastUpdate,
    days,
    value,
  };
};
