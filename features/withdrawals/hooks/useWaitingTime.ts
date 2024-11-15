import { useMemo } from 'react';

import { config } from 'config';
import { STRATEGY_EAGER } from 'consts/react-query-strategies';

import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { useLidoQuery } from 'shared/hooks/use-lido-query';
import { useDebouncedValue } from 'shared/hooks';

import { encodeURLQuery } from 'utils/encodeURLQuery';
import { standardFetcher } from 'utils/standardFetcher';
import { FetcherError } from 'utils/fetcherError';

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

export const useWaitingTime = (
  amount: string,
  options: useWaitingTimeOptions = {},
) => {
  const { isApproximate } = options;
  const debouncedAmount = useDebouncedValue(amount, 1000);

  const url = useMemo(() => {
    const basePath = config.wqAPIBasePath;
    const params = encodeURLQuery({ amount: debouncedAmount });
    const queryString = params ? `?${params}` : '';
    return `${basePath}/v2/request-time/calculate${queryString}`;
  }, [debouncedAmount]);

  const { data, error, initialLoading } = useLidoQuery<RequestTimeV2Dto>({
    queryKey: ['waiting-time', debouncedAmount],
    queryFn: () =>
      standardFetcher<RequestTimeV2Dto>(url, {
        headers: {
          'Content-Type': 'application/json',
          'WQ-Request-Source': 'widget',
        },
      }),
    strategy: STRATEGY_EAGER,
    retry: (failureCount, e) => {
      if (e && e instanceof FetcherError && e.status === 400) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const { isBunker, isPaused } = useWithdrawals();
  const isRequestError = error instanceof FetcherError && error.status < 500;

  const ms = data?.requestInfo?.finalizationIn;
  const days = ms ? Math.ceil(ms / (24 * 60 * 60 * 1000)) : DEFAULT_DAYS_VALUE;

  const waitingTime =
    days && days > 1
      ? `${isApproximate ? '~ ' : ''}${days} days`
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
