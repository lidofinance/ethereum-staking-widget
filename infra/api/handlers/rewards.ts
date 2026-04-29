import { Cache, type CacheClass } from 'memory-cache';

// Inlined from utils/fetcherError.ts
class FetcherError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Inlined from env-dynamics.mjs and config/get-secret-config.ts
const rewardsBackendAPI = process.env.REWARDS_BACKEND;

const DEFAULT_CACHE_TTL = 1000; // 1 second

type CacheValue = unknown;
const cache: CacheClass<string, CacheValue> = new Cache();

const standardFetcher = async <T,>(url: string, params?: RequestInit) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-type': 'application/json' },
    ...params,
  });

  if (!response.ok) {
    let message = 'An error occurred while fetching the data';
    try {
      const error = await response.json();
      message = typeof error === 'string' ? error : JSON.stringify(error);
    } catch {
      // noop
    }
    throw new FetcherError(message, response.status);
  }

  return (await response.json()) as T;
};

const createCachedProxy = ({
  proxyUrl,
  cacheTTL,
  ignoreParams,
  timeout = 5000,
  transformData = (data: unknown) => data,
}: {
  proxyUrl: string;
  cacheTTL: number;
  timeout?: number;
  ignoreParams?: boolean;
  transformData?: (data: unknown) => unknown;
}) => {
  return async (req: { query?: Record<string, unknown> }) => {
    const params =
      ignoreParams || !req.query || Object.keys(req.query).length === 0
        ? null
        : new URLSearchParams(
            Object.entries(req.query).reduce((obj, [k, v]) => {
              if (typeof v === 'string') obj[k] = v;
              return obj;
            }, {} as Record<string, string>),
          );

    const cacheKey = `${proxyUrl}-${params?.toString() ?? ''}`;

    const cachedValue = cache.get(cacheKey);
    if (cachedValue) {
      return cachedValue;
    }

    const url = proxyUrl + (params ? `?${params.toString()}` : '');

    const data = await standardFetcher(url, {
      signal: AbortSignal.timeout(timeout),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const transformedData = transformData(data) ?? data;

    cache.put(cacheKey, transformedData, cacheTTL);
    return transformedData;
  };
};

const proxyHandler = rewardsBackendAPI
  ? createCachedProxy({
      proxyUrl: rewardsBackendAPI + '/',
      cacheTTL: DEFAULT_CACHE_TTL,
      ignoreParams: false,
      timeout: 10_000,
    })
  : null;

export const getRewardsResponse = async (req: { query?: Record<string, unknown> }) => {
  if (!proxyHandler) {
    return { status: 404 as const };
  }

  try {
    const data = await proxyHandler(req);
    return { status: 200 as const, data };
  } catch (e) {
    if (e instanceof FetcherError && e.status >= 400 && e.status < 500) {
      return { status: e.status as number, data: { error: e.message } };
    }
    return { status: 500 as const };
  }
};
