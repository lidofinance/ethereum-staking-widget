import { Backend } from 'features/rewards/types';
import { useEffect, useRef } from 'react';
import { useLidoSWR } from 'shared/hooks';

type UseRewardsDataLoad = (props: {
  address: string;
  currency: string;
  isOnlyRewards: boolean;
  isUseArchiveExchangeRate: boolean;
  skip: number;
  limit: number;
}) => {
  data?: Backend;
  error?: unknown;
  loading: boolean;
  initialLoading: boolean;
  isLagging: boolean;
};

export const useRewardsDataLoad: UseRewardsDataLoad = (props) => {
  const {
    address,
    currency,
    isOnlyRewards,
    isUseArchiveExchangeRate,
    skip,
    limit,
  } = props;

  const laggyDataRef = useRef<Backend | undefined>();

  const requestOptions = {
    address,
    currency,
    onlyRewards: isOnlyRewards,
    archiveRate: isUseArchiveExchangeRate,
    skip,
    limit,
  };

  const params = new URLSearchParams();
  Object.entries(requestOptions).forEach(([k, v]) =>
    params.append(k, v.toString()),
  );
  const { data, ...rest } = useLidoSWR<Backend>(
    address ? `/api/rewards?${params.toString()}` : null,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (data !== undefined) {
      laggyDataRef.current = data;
    }
  }, [data]);

  // Return to previous data if current data is not defined.
  const dataOrLaggyData = data === undefined ? laggyDataRef.current : data;

  // Shows previous data.
  const isLagging =
    !!address && data === undefined && laggyDataRef.current !== undefined;

  return { ...rest, isLagging, data: dataOrLaggyData };
};
