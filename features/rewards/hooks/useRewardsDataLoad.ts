import { useQuery } from '@tanstack/react-query';
import { config } from 'config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { Backend } from 'features/rewards/types';

import { standardFetcher } from 'utils/standardFetcher';
import { useLaggyDataWrapper } from './use-laggy-data-wrapper';

type UseRewardsDataLoad = (props: {
  address: string;
  currency: string;
  isIncludeTransfers: boolean;
  isUseArchiveExchangeRate: boolean;
  skip: number;
  limit: number;
}) => {
  data?: Backend;
  error?: unknown;
  isFetching: boolean;
  isLoading: boolean;
  isLagging: boolean;
};

export const useRewardsDataLoad: UseRewardsDataLoad = (props) => {
  const {
    address,
    currency,
    isIncludeTransfers,
    isUseArchiveExchangeRate,
    skip,
    limit,
  } = props;

  const requestOptions = {
    address,
    currency,
    onlyRewards: !isIncludeTransfers,
    archiveRate: isUseArchiveExchangeRate,
    skip,
    limit,
  };

  const params = new URLSearchParams();
  Object.entries(requestOptions).forEach(([k, v]) =>
    params.append(k, v.toString()),
  );

  let apiRewardsUrl;
  if (config.ipfsMode) {
    apiRewardsUrl = `${config.rewardsBackendBasePath}?${params.toString()}`;
  } else {
    apiRewardsUrl = `/api/rewards?${params.toString()}`;
  }

  const { data, error, isFetching, isLoading } = useQuery<Backend>({
    queryKey: ['rewards-data', address, apiRewardsUrl],
    enabled: !!address,
    ...STRATEGY_LAZY,
    staleTime: 0,
    // TODO
    // @ts-expect-error: cacheTime is a valid property on the UseQueryOptions type
    cacheTime: 0,
    queryFn: async ({ signal }) => {
      // The 'react-query' has AbortController support built in,
      // and it automatically cancels requests when
      // the component is unmounted or the queryKey changes.
      return standardFetcher(apiRewardsUrl, { signal });
    },
  });

  const { isLagging, dataOrLaggyData } = useLaggyDataWrapper(data);

  return {
    error,
    isFetching,
    isLoading,
    // Fix 'Type 'TQueryFnData' is not assignable to type 'Backend''
    data: dataOrLaggyData as Backend,
    isLagging: !!address && isLagging,
  };
};
