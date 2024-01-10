import { useEffect, useRef } from 'react';
import { Backend } from 'features/rewards/types';
import { dynamics } from 'config';
import { useLidoSWR } from 'shared/hooks';
import { swrAbortableMiddleware } from 'utils';

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

  const apiRewardsPath = `/api/rewards?${params.toString()}`;
  const apiRewardsUrl = dynamics.ipfsMode
    ? `${dynamics.widgetApiBasePathForIpfs}${apiRewardsPath}`
    : apiRewardsPath;

  const { data, ...rest } = useLidoSWR<Backend>(
    address ? apiRewardsUrl : null,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      use: [swrAbortableMiddleware],
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
