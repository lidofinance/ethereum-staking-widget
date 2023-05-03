import { SWRResponse, useLidoSWR } from '@lido-sdk/react';
import { dynamics } from 'config';
import { useMemo } from 'react';
import { useDebouncedValue } from 'shared/hooks';
import { encodeURLQuery } from 'utils/encodeURLQuery';
import { standardFetcher } from 'utils/standardFetcher';
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
  const debouncedAmount = useDebouncedValue(amount, 2000);
  const url = useMemo(() => {
    // TODO: remove fallback after deploy env variables
    const basePath = dynamics.wqAPIBasePath
      ? dynamics.wqAPIBasePath
      : 'https://wq-api.testnet.fi';
    const params = encodeURLQuery({ amount: debouncedAmount });

    return `${basePath}/v1/request-time${params ? `?${params}` : ''}`;
  }, [debouncedAmount]);

  const { data, initialLoading, error } = useLidoSWR(
    url,
    standardFetcher,
  ) as SWRResponse<RequestTimeResponse>;
  const { isBunkerMode, isPaused } = useWithdrawals();

  const stethLastUpdate =
    data?.stethLastUpdate && new Date(data?.stethLastUpdate * 1000);
  const days = data?.days ?? DEFAULT_DAYS_VALUE;

  const waitingTime =
    days && days > 1
      ? `${isApproximate ? '~ ' : ''}1-${days} day(s)`
      : `${isApproximate ? '~ ' : ''}${days} day`;
  const value = isPaused ? '—' : isBunkerMode ? 'Not estimated' : waitingTime;

  return {
    ...data,
    initialLoading,
    error,
    stethLastUpdate,
    days,
    value,
  };
};
