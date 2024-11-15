import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

import { ETH_API_ROUTES, getEthApiPath } from 'consts/api';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useLidoQuery, UseLidoQueryResult } from 'shared/hooks/use-lido-query';
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

type UseLidoAprResult = UseLidoQueryResult<SMA_APR_RESPONSE> & {
  apr?: string;
};

export const useLidoApr = (): UseLidoAprResult => {
  const url = getEthApiPath(ETH_API_ROUTES.STETH_SMA_APR);

  const result = useLidoQuery<SMA_APR_RESPONSE>({
    queryKey: ['lido-apr', url],
    queryFn: () => standardFetcher<SMA_APR_RESPONSE>(url),
    strategy: STRATEGY_LAZY,
  });

  const { data } = result;

  return {
    ...result,
    apr: data?.data?.smaApr?.toFixed(1),
  };
};
