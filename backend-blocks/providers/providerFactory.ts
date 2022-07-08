import { JsonRpcProvider } from '@ethersproject/providers';

// ❗️ Same as in lido-js-sdk
export const providerFactory = <P extends typeof JsonRpcProvider>(
  Provider: P,
) => {
  const cache = new Map<string, InstanceType<P>>();

  return (
    chainId: string | number,
    url: string,
    cacheSeed = 0,
    pollingInterval: number | null = null,
  ): InstanceType<P> => {
    const cacheKey = `${chainId}-${cacheSeed}-${url}`;
    let provider = cache.get(cacheKey);

    if (!provider) {
      provider = new Provider(url, chainId) as InstanceType<P>;
      cache.set(cacheKey, provider);
    }

    if (pollingInterval) {
      provider.pollingInterval = pollingInterval;
    }

    return provider;
  };
};
