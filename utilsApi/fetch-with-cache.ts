import { CacheClass } from 'memory-cache';

type CacheEntry<T> = { value: T; timestamp: number };

type Params<T> = {
  cache: CacheClass<string, CacheEntry<T> | boolean>;
  cacheKey: string;
  cacheTTL?: number;
  failureTTL?: number;
  fetcher: () => Promise<T>;
  enabled?: boolean;
};

const DEFAULT_CACHE_TTL = 60_000; // 1 minute
const DEFAULT_FAILURE_TTL = 10_000; // 10 seconds

export const fetchWithCache = async <T>({
  cache,
  cacheKey,
  cacheTTL = DEFAULT_CACHE_TTL,
  failureTTL = DEFAULT_FAILURE_TTL,
  fetcher,
  enabled = true,
}: Params<T>): Promise<CacheEntry<T> | undefined> => {
  try {
    if (!enabled) {
      return undefined;
    }

    const failureKey = `${cacheKey}__error__`;
    if (cache.get(failureKey)) {
      return undefined;
    }

    const cached = cache.get(cacheKey);
    if (cached != undefined && typeof cached !== 'boolean') {
      return cached;
    }

    const data: CacheEntry<T> = {
      value: await fetcher(),
      timestamp: Math.floor(Date.now() / 1000),
    };
    cache.put(cacheKey, data, cacheTTL);
    return data;
  } catch (error) {
    console.error(`Error in fetchWithCache for key: ${cacheKey}`, error);
    if (failureTTL > 0) {
      cache.put(`${cacheKey}__error__`, true, failureTTL);
    }
    return undefined;
  }
};
