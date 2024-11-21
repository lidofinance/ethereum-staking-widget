import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { ETH_API_ROUTES, getEthApiPath } from 'consts/api';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { standardFetcher } from 'utils/standardFetcher';

type SMA_APR_RESPONSE = {
  data: {
    aprs: [
      { timeUnix: number; apr: number },
      { timeUnix: number; apr: number },
      { timeUnix: number; apr: number },
      { timeUnix: number; apr: number },
      { timeUnix: number; apr: number },
      { timeUnix: number; apr: number },
      { timeUnix: number; apr: number },
      { timeUnix: number; apr: number },
    ];
    smaApr: number;
  };
  meta: {
    symbol: 'stETH';
    address: string;
    chainId: CHAINS;
  };
};

type UseLidoAprResult = UseQueryResult<SMA_APR_RESPONSE> & {
  apr?: string;
};

export const useLidoApr = (): UseLidoAprResult => {
  const url = getEthApiPath(ETH_API_ROUTES.STETH_SMA_APR);

  const result = useQuery<SMA_APR_RESPONSE>({
    queryKey: ['lido-apr', url],
    queryFn: () => standardFetcher<SMA_APR_RESPONSE>(url),
    ...STRATEGY_LAZY,
  });

  const { data } = result;

  return {
    ...result,
    apr: data?.data?.smaApr?.toFixed(1),
  };
};
