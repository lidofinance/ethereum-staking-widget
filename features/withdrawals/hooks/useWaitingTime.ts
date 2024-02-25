import { useMemo } from 'react';
import { SWRResponse, useLidoSWR } from '@lido-sdk/react';

import { getConfig } from 'config';
const { wqAPIBasePath } = getConfig();

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

// TODO: accept big Number
export const useWaitingTime = (
  amount: string,
  options: useWaitingTimeOptions = {},
) => {
  const { isApproximate } = options;
  const debouncedAmount = useDebouncedValue(amount, 1000);
  const url = useMemo(() => {
    const basePath = wqAPIBasePath;
    const params = encodeURLQuery({ amount: debouncedAmount });
    const queryString = params ? `?${params}` : '';
    return `${basePath}/v1/request-time${queryString}`;
  }, [debouncedAmount]);

  const { data, initialLoading, error } = useLidoSWR(url, standardFetcher, {
    ...STRATEGY_EAGER,
    shouldRetryOnError: (e: unknown) => {
      // if api is not happy about our request - no retry
      return !(e && typeof e == 'object' && 'status' in e && e.status == 400);
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
