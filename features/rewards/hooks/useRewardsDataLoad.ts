import { useQuery } from '@tanstack/react-query';
import { config, useConfig } from 'config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { Backend } from 'features/rewards/types';

import { backendRequest } from 'features/rewards/fetchers/backend';
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

  const { featureFlags } = useConfig().externalConfig;

  const { data, error, isFetching, isLoading } = useQuery({
    queryKey: [
      'rewards-data',
      { address, ipfsMode: config.ipfsMode, requestOptions },
    ],
    enabled: !!address && !featureFlags.rewardsMaintenance,
    ...STRATEGY_LAZY,
    queryFn: async ({ signal }) => {
      return backendRequest(requestOptions, { signal });
    },
  });

  const { isLagging, dataOrLaggyData } = useLaggyDataWrapper(data);

  return {
    error,
    isFetching,
    isLoading,
    // Fix 'Type 'TQueryFnData' is not assignable to type 'Backend''
    data: dataOrLaggyData,
    isLagging: !!address && isLagging,
  };
};
