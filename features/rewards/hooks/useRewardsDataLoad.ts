import { config } from 'config';
import { Backend } from 'features/rewards/types';
import { useLidoSWR } from 'shared/hooks';
import { swrAbortableMiddleware } from 'utils';
import { useLaggyDataWrapper } from './use-laggy-data-wrapper';

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

  let apiRewardsUrl;
  if (config.ipfsMode) {
    apiRewardsUrl = `${config.rewardsBackendBasePath}?${params.toString()}`;
  } else {
    apiRewardsUrl = `/api/rewards?${params.toString()}`;
  }

  const { data, ...rest } = useLidoSWR<Backend>(
    address ? apiRewardsUrl : null,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      use: [swrAbortableMiddleware],
    },
  );

  const { isLagging, dataOrLaggyData } = useLaggyDataWrapper(data);

  return { ...rest, isLagging: !!address && isLagging, data: dataOrLaggyData };
};
