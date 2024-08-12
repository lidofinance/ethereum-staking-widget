import { SWRResponse, useLidoSWR } from '@lido-sdk/react';
import { CHAINS } from '@lido-sdk/constants';

import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { standardFetcher } from 'utils/standardFetcher';
import { ETH_API_ROUTES, getEthApiPath } from 'consts/api';

type SMA_APR_RESPONSE = {
  data: {
    aprs: [
      {
        timeUnix: number;
        apr: number;
      },
      {
        timeUnix: number;
        apr: number;
      },
      {
        timeUnix: number;
        apr: number;
      },
      {
        timeUnix: number;
        apr: number;
      },
      {
        timeUnix: number;
        apr: number;
      },
      {
        timeUnix: number;
        apr: number;
      },
      {
        timeUnix: number;
        apr: number;
      },
      {
        timeUnix: number;
        apr: number;
      },
    ];
    smaApr: number;
  };
  meta: {
    symbol: 'stETH';
    address: string;
    chainId: CHAINS;
  };
};

export const useLidoApr = (): SWRResponse<SMA_APR_RESPONSE> & {
  apr?: string;
} => {
  const { data, ...rest } = useLidoSWR<SMA_APR_RESPONSE>(
    getEthApiPath(ETH_API_ROUTES.STETH_SMA_APR),
    standardFetcher,
    STRATEGY_LAZY,
  );

  return { ...rest, apr: data?.data.smaApr.toFixed(1) };
};
