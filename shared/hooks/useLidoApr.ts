import invariant from 'tiny-invariant';

import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { ETH_API_ROUTES, getEthApiPath } from 'consts/api';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { standardFetcher } from 'utils/standardFetcher';
import { useLidoSDK } from 'modules/web3';

type APR_RECORD = { timeUnix: number; apr: number };

type SMA_APR_RESPONSE = {
  data: {
    smaApr: number;
    aprs?: APR_RECORD[];
  };
  meta?: {
    symbol: 'stETH';
    address: string;
    chainId: CHAINS;
  };
};

type UseLidoAprResult = UseQueryResult<SMA_APR_RESPONSE> & {
  apr?: string;
};

export const useLidoApr = (): UseLidoAprResult => {
  const { statistics } = useLidoSDK();
  const url = getEthApiPath(ETH_API_ROUTES.STETH_SMA_APR);

  const result = useQuery<SMA_APR_RESPONSE>({
    queryKey: ['lido-apr', url],
    ...STRATEGY_LAZY,
    queryFn: async () => {
      try {
        invariant(url, 'Missing URL for fetching the SMA APR');
        return await standardFetcher<SMA_APR_RESPONSE>(url);
      } catch (error) {
        // Fallback from SDK
        const lastApr = await statistics.apr.getSmaApr({ days: 7 });
        return { data: { smaApr: lastApr } };
        // if "await statistics.apr.getLastApr()" does not work,
        // then the result will be "{ data: undefined; isError: true, ...}"
        // the widget will handle this response
      }
    },
  });

  const { data } = result;

  return {
    ...result,
    apr: data?.data?.smaApr?.toFixed(1),
  };
};
