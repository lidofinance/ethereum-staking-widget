import { JsonRpcProvider } from '@ethersproject/providers';
import { withMetrics } from './withMetrics';
import { Registry } from 'prom-client';

// TODO: provide regular providerFactory without metrics
export const providerFactoryWithMetrics = <P extends typeof JsonRpcProvider>(
  prefix: string,
  registry: Registry,
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
      const ProviderWithMetrics = withMetrics(Provider);
      provider = new ProviderWithMetrics(
        prefix,
        registry,
        url,
        chainId,
      ) as InstanceType<P>;
      cache.set(cacheKey, provider);
    }

    if (pollingInterval) {
      provider.pollingInterval = pollingInterval;
    }

    return provider;
  };
};
