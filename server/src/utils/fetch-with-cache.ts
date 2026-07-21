/**
 * Port of `utilsApi/fetch-with-cache.ts` with a Map-based TTL cache instead
 * of the `memory-cache` package (one less dependency; identical semantics:
 * success cached for `cacheTTL`, failures negative-cached for `failureTTL`
 * so a broken upstream isn't hammered).
 */
export type CacheEntry<T> = { value: T; timestamp: number };

class TtlCache<T> {
  private store = new Map<string, { data: T; expiresAt: number }>();

  get(key: string): T | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (Date.now() > hit.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return hit.data;
  }

  put(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }
}

type Params<T> = {
  cache: TtlCache<CacheEntry<T> | boolean>;
  cacheKey: string;
  cacheTTL?: number;
  failureTTL?: number;
  fetcher: () => Promise<T>;
};

const DEFAULT_CACHE_TTL = 60_000; // 1 minute
const DEFAULT_FAILURE_TTL = 10_000; // 10 seconds

export const createTtlCache = <T>() => new TtlCache<CacheEntry<T> | boolean>();

export const fetchWithCache = async <T>({
  cache,
  cacheKey,
  cacheTTL = DEFAULT_CACHE_TTL,
  failureTTL = DEFAULT_FAILURE_TTL,
  fetcher,
}: Params<T>): Promise<CacheEntry<T> | undefined> => {
  const failureKey = `${cacheKey}__error__`;
  try {
    if (cache.get(failureKey)) {
      return undefined;
    }

    const cached = cache.get(cacheKey);
    if (cached !== undefined && typeof cached !== 'boolean') {
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
      cache.put(failureKey, true, failureTTL);
    }
    return undefined;
  }
};
