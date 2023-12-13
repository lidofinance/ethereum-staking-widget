import { SWRResponse, useLidoSWR } from '@lido-sdk/react';
import { CHAINS } from '@lido-sdk/constants';
import { standardFetcher } from 'utils/standardFetcher';
import { dynamics } from 'config';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

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
    `${dynamics.ethAPIBasePath ?? ''}/v1/protocol/steth/apr/sma`,
    standardFetcher,
    STRATEGY_LAZY,
  );

  return { ...rest, apr: data?.data.smaApr.toFixed(1) };
};
