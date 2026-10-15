import invariant from 'tiny-invariant';
import { z } from 'zod';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { ETH_API_ROUTES, getEthApiPath } from 'consts/api';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { standardFetcher } from 'utils/standardFetcher';
import { useLidoSDK } from 'modules/web3';

const SMA_APR_RESPONSE_SCHEMA = z.object({
  data: z.object({
    smaApr: z.number(),
    aprs: z
      .array(z.object({ timeUnix: z.number(), apr: z.number() }))
      .optional(),
  }),
  meta: z.looseObject({}).optional(),
});

type SMA_APR_RESPONSE = z.infer<typeof SMA_APR_RESPONSE_SCHEMA>;

type UseLidoAprResult = UseQueryResult<SMA_APR_RESPONSE> & {
  apr?: string;
};

export const useLidoApr = (): UseLidoAprResult => {
  const { statistics } = useLidoSDK();
  const url = getEthApiPath(ETH_API_ROUTES.STETH_SMA_APR);

  const result = useQuery<SMA_APR_RESPONSE>({
    queryKey: ['lido-apr', url],
    ...STRATEGY_CONSTANT,
    queryFn: async () => {
      try {
        invariant(url, 'Missing URL for fetching the SMA APR');
        // a malformed response falls through to the SDK like a failed request
        return SMA_APR_RESPONSE_SCHEMA.parse(
          await standardFetcher<unknown>(url),
        );
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
