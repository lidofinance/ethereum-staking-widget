import getConfig from 'next/config';
import { CHAINS } from 'utils/chains';

import { standardFetcher } from 'utils/standardFetcher';
import { responseTimeExternalMetricWrapper } from 'utilsApi';

const { serverRuntimeConfig } = getConfig();
const { ethAPIBasePath } = serverRuntimeConfig;

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

export const getSmaStethApr = async (): Promise<string> => {
  // TODO: remove after deploy env variables
  const basePath = ethAPIBasePath ? ethAPIBasePath : 'https://eth-api.lido.fi';
  const url = `${basePath}/v1/protocol/steth/apr/sma`;

  const data = await responseTimeExternalMetricWrapper({
    payload: basePath,
    request: () => standardFetcher<SMA_APR_RESPONSE>(url),
  });

  return data.data.smaApr.toFixed(1);
};
