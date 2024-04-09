import { secretConfig } from 'config';
import { CHAINS } from 'consts/chains';

import { standardFetcher } from 'utils/standardFetcher';
import { responseTimeExternalMetricWrapper } from 'utilsApi';

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
  const url = `${secretConfig.ethAPIBasePath}/v1/protocol/steth/apr/sma`;
  const data = await responseTimeExternalMetricWrapper({
    payload: secretConfig.ethAPIBasePath,
    request: () => standardFetcher<SMA_APR_RESPONSE>(url),
  });

  return data?.data.smaApr.toFixed(1);
};
