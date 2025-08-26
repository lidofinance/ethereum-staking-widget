import { API } from '@lidofinance/next-api-wrapper';
import { Cache } from 'memory-cache';
import { responseTimeExternalMetricWrapper } from './fetchApiWrapper';
import { standardFetcher } from 'utils/standardFetcher';
import { config } from 'config';
import { FetcherError } from 'utils/fetcherError';
import { ETH_API_ROUTES, getEthApiPath } from 'consts/api';

type ProxyOptions = {
  proxyUrl: string | (() => string);
  cacheTTL: number;
  timeout?: number;
  ignoreParams?: boolean;
  transformData?: (data: any) => any;
  metricsHost?: string;
};

export const createCachedProxy = ({
  cacheTTL,
  proxyUrl,
  ignoreParams,
  timeout = 5000,
  transformData = (data) => data,
  metricsHost = typeof proxyUrl === 'function' ? proxyUrl() : proxyUrl,
}: ProxyOptions): API => {
  const cache = new Cache<string, any>();
  return async (req, res) => {
    const params =
      ignoreParams || Object.keys(req.query).length === 0
        ? null
        : new URLSearchParams(
            Object.entries(req.query).reduce(
              (obj, [k, v]) => {
                if (typeof v === 'string') obj[k] = v;
                return obj;
              },
              {} as Record<string, string>,
            ),
          );
    const cacheKey = `${proxyUrl}-${params?.toString() ?? ''}`;

    const cachedValue = cache.get(cacheKey);
    if (cachedValue) {
      res.json(cachedValue);
      return;
    }

    const proxyUrlString =
      typeof proxyUrl === 'function' ? proxyUrl() : proxyUrl;
    const url = proxyUrlString + (params ? `?${params.toString()}` : '');

    try {
      const data = await responseTimeExternalMetricWrapper({
        payload: metricsHost,
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

      cache.put(cacheKey, transformedData, cacheTTL);
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
    proxyUrl,
    metricsHost: config.ethAPIBasePath,
    timeout: 5000,
  });
};
