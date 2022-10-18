import getConfig from 'next/config';
import { CHAINS } from 'utils/chains';
import { standardFetcher } from 'utils/standardFetcher';
import { responseTimeExternalMetricWrapper } from 'utilsApi';

const { serverRuntimeConfig } = getConfig();
const { aprAPIBasePath } = serverRuntimeConfig;

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
  const url = `${aprAPIBasePath}/v1/protocol/steth/apr/sma`;

  const data = await responseTimeExternalMetricWrapper({
    payload: aprAPIBasePath,
    request: () => standardFetcher<SMA_APR_RESPONSE>(url),
  });

  return data.data.smaApr.toFixed(1);
};
