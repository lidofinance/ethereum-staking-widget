import type { NextApiRequest } from 'next';
import { API } from '@lidofinance/next-api-wrapper';
import { LRUCache } from 'lru-cache';

import { responseTimeExternalMetricWrapper } from './fetchApiWrapper';
import { standardFetcher } from 'utils/standardFetcher';
import { config } from 'config';
import { FetcherError } from 'utils/fetcherError';
import { ETH_API_ROUTES, getEthApiPath } from 'consts/api';
import { buildParams } from './cached-proxy-build-params';

export { buildParams } from './cached-proxy-build-params';

const DEFAULT_CACHE_MAX_ENTRIES = 200;

type ProxyOptions = {
  proxyUrl: string | ((req: NextApiRequest) => Promise<string>);
  cacheTTL: number;
  timeout?: number;
  ignoreParams?: boolean;
  /** Whitelist of query keys used in cache key + upstream URL. Unset = all. */
  allowedQueryParams?: string[];
  transformData?: (data: any) => any;
  metricsHost?: string;
  /** Hard cap on cache entries. Default 200. */
  cacheMaxEntries?: number;
};

export const createCachedProxy = ({
  cacheTTL,
  proxyUrl,
  ignoreParams,
  allowedQueryParams,
  timeout = 5000,
  transformData = (data) => data,
  metricsHost,
  cacheMaxEntries = DEFAULT_CACHE_MAX_ENTRIES,
}: ProxyOptions): API => {
  const cache = new LRUCache<string, any>({
    max: cacheMaxEntries,
    ttl: cacheTTL,
  });
  return async (req, res) => {
    const params = buildParams(req.query, ignoreParams, allowedQueryParams);

    // Generate the actual proxy URL, passing req if the function accepts it
    const proxyUrlString =
      typeof proxyUrl === 'function' ? await proxyUrl(req) : proxyUrl;

    const cacheKey = `${proxyUrlString}-${params?.toString() ?? ''}`;

    const cachedValue = cache.get(cacheKey);
    if (cachedValue) {
      res.json(cachedValue);
      return;
    }
    const url = proxyUrlString + (params ? `?${params.toString()}` : '');

    try {
      const data = await responseTimeExternalMetricWrapper({
        payload: metricsHost || proxyUrlString,
        request: () =>
          standardFetcher(url, {
            signal: AbortSignal.timeout(timeout),
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }),
      });

      const transformedData = transformData(data) ?? data;

      cache.set(cacheKey, transformedData);
      res.json(transformedData);
    } catch (e) {
      if (e instanceof FetcherError && e.status >= 400 && e.status < 500) {
        console.warn(`[CachedProxy]Forwarding ${e.status} error from ${url}`);
        res.status(e.status);
        res.json({ error: e.message });
        return;
      }
      console.warn(`[CachedProxy] Failed to proxy from ${url}`, e);
      res.status(500).end();
      throw e;
    }
  };
};

type EthApiProxyOptions = Pick<
  ProxyOptions,
  'transformData' | 'ignoreParams' | 'cacheTTL'
> & {
  endpoint: ETH_API_ROUTES;
};

export const createEthApiProxy = ({
  endpoint,
  cacheTTL,
  ignoreParams,
  transformData,
}: EthApiProxyOptions): API => {
  const proxyUrl = getEthApiPath(endpoint);

  if (!proxyUrl) {
    console.error('[createEthApiProxy] Skipped setup: EthApiPath is null');
    return (_req, res) => {
      res.status(404).end();
    };
  }

  return createCachedProxy({
    cacheTTL,
    ignoreParams,
    transformData,
    proxyUrl: async () => proxyUrl, // Wrap string in function
    metricsHost: config.ethAPIBasePath,
    timeout: 5000,
  });
};
