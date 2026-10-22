import type { NextApiRequest } from 'next';
import { API } from '@lidofinance/next-api-wrapper';
import { LRUCache } from 'lru-cache';

import { CACHE_DEFAULT_ERROR_HEADERS } from 'config/groups/cache';

import { responseTimeExternalMetricWrapper } from './fetchApiWrapper';
import { standardFetcher } from 'utils/standardFetcher';
import { FetcherError } from 'utils/fetcherError';
import { buildParams } from './cached-proxy-build-params';

export { buildParams } from './cached-proxy-build-params';

const DEFAULT_CACHE_MAX_ENTRIES = 200;
// Full rewards histories reach several MB each: a count cap alone let 200 of
// them pin the heap of the one server process
const DEFAULT_CACHE_MAX_BYTES = 32 * 1024 * 1024;

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
  /** Hard cap on cached bytes (serialized). Larger bodies are served uncached. Default 32MB. */
  cacheMaxBytes?: number;
  /** Extra upstream headers from the request; cache hits don't reach upstream. */
  forwardHeaders?: (req: NextApiRequest) => Record<string, string>;
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
  cacheMaxBytes = DEFAULT_CACHE_MAX_BYTES,
  forwardHeaders,
}: ProxyOptions): API => {
  const cache = new LRUCache<string, string>({
    max: cacheMaxEntries,
    maxSize: cacheMaxBytes,
    sizeCalculation: (value) => Buffer.byteLength(value),
    ttl: cacheTTL,
    // Without this an expired entry stays in memory until its key is read
    // again or the cache is full
    ttlAutopurge: true,
  });
  return async (req, res) => {
    const params = buildParams(req.query, ignoreParams, allowedQueryParams);

    // Generate the actual proxy URL, passing req if the function accepts it
    const proxyUrlString =
      typeof proxyUrl === 'function' ? await proxyUrl(req) : proxyUrl;

    const cacheKey = `${proxyUrlString}-${params?.toString() ?? ''}`;

    const sendJson = (body: string) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.send(body);
    };

    const cachedValue = cache.get(cacheKey);
    if (cachedValue) {
      sendJson(cachedValue);
      return;
    }
    const url = proxyUrlString + (params ? `?${params.toString()}` : '');

    try {
      // set() is case-insensitive, so forwarded headers can't override these
      const headers = new Headers(forwardHeaders?.(req));
      headers.set('Accept', 'application/json');
      headers.set('Content-Type', 'application/json');

      const data = await responseTimeExternalMetricWrapper({
        payload: metricsHost || proxyUrlString,
        request: () =>
          standardFetcher(url, {
            signal: AbortSignal.timeout(timeout),
            headers,
          }),
      });

      const body = JSON.stringify(transformData(data) ?? data);

      cache.set(cacheKey, body);
      sendJson(body);
    } catch (e) {
      // route-level cacheControl set public caching before the handler ran
      res.setHeader('Cache-Control', CACHE_DEFAULT_ERROR_HEADERS);
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
