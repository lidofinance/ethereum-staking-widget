import { useQuery } from '@tanstack/react-query';

import { config } from 'config';
import { STRATEGY_EAGER } from 'consts/react-query-strategies';

import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { getWQApiUrlByChain } from 'features/withdrawals/utils/get-custom-api-url';
import { useDebouncedValue } from 'shared/hooks';

import { useLidoSDK } from 'modules/web3';
import { FetcherError } from 'utils/fetcherError';

const DEFAULT_DAYS_VALUE = 5;

const CONGESTED_DAYS_THRESHOLD = 7;

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
  amount: bigint | null,
  options: useWaitingTimeOptions = {},
) => {
  const { isApproximate } = options;
  const { withdraw, chainId } = useLidoSDK();
  const debouncedAmount = useDebouncedValue(amount, 1000);

  const { data, error, isLoading, isFetching } = useQuery<RequestTimeV2Dto>({
    queryKey: ['waiting-time', chainId, debouncedAmount?.toString()],
    enabled: !!config.wqAPIBasePath,
    queryFn: () =>
      withdraw.waitingTime.getWithdrawalWaitingTimeByAmount({
        amount: debouncedAmount != null ? debouncedAmount : undefined,
        getCustomApiUrl: getWQApiUrlByChain,
      }),
    ...STRATEGY_EAGER,
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

  const isCongested = days >= CONGESTED_DAYS_THRESHOLD;

  return {
    ...data,
    isLoading,
    isFetching,
    error,
    days,
    value,
    isCongested,
  };
};
