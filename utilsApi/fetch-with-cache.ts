import { CacheClass } from 'memory-cache';

type CacheEntry<T> = { value: T; timestamp: number };

type Params<T> = {
  cache: CacheClass<string, CacheEntry<T>>;
  cacheKey: string;
  cacheTTL?: number;
  fetcher: () => Promise<T>;
  enabled?: boolean;
};

const DEFAULT_CACHE_TTL = 60_000; // 1 minute

export const fetchWithCache = async <T>({
  cache,
  cacheKey,
  cacheTTL = DEFAULT_CACHE_TTL,
  fetcher,
  enabled = true,
}: Params<T>): Promise<CacheEntry<T> | undefined> => {
  try {
    if (!enabled) {
      return undefined;
    }

    const cached = cache.get(cacheKey);
    if (cached != undefined) {
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
    throw error;
  }
};
