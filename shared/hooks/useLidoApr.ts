import { SWRResponse, useLidoSWR } from '@lido-sdk/react';
import { CHAINS } from '@lido-sdk/constants';

import { getConfig } from 'config';
const { ethAPIBasePath } = getConfig();
import { STRATEGY_LAZY } from 'consts/swr-strategies';

import { standardFetcher } from 'utils/standardFetcher';

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
    `${ethAPIBasePath ?? ''}/v1/protocol/steth/apr/sma`,
    standardFetcher,
    STRATEGY_LAZY,
  );

  return { ...rest, apr: data?.data.smaApr.toFixed(1) };
};
