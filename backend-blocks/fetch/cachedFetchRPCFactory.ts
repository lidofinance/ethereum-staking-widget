import { FetchRpc, fetchRpc } from './fetchRpc';
import { Cache } from 'memory-cache';
import { Response } from 'node-fetch';

export type CachedFetchRPC = FetchRpc<{ cacheKey: string }>;

// Just a sample how to use extend fetchRPC
export const cachedFetchRpcFactory = (timeout: number): CachedFetchRPC => {
  const cache = new Cache<string, Response>();

  return async (url, init, { cacheKey }) => {
    const cachedValue = cache.get(cacheKey);
    if (cachedValue != null) {
      return cachedValue;
    }
    const response = await fetchRpc(url, init);
    cache.put(cacheKey, response, timeout);
    return response;
  };
};
