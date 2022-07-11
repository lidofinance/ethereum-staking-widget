import { JsonRpcProvider } from '@ethersproject/providers';
import { rpcMetricsFactory, getProviderLabel } from '../metrics';
import { Registry } from 'prom-client';
import {
  patchRPCProviderWithCallbacks,
  PatchRPCProviderWithCallbacksParameters,
} from './patchRPCProviderWithCallbacks';

export type PatchRPCProviderWithMetricsParameters<
  P extends typeof JsonRpcProvider,
> = PatchRPCProviderWithCallbacksParameters<P> & {
  metrics: {
    prefix: string;
    registry: Registry;
  };
};

export const patchRPCProviderWithMetrics = <P extends typeof JsonRpcProvider>({
  metrics: { prefix, registry },
  Provider,
  onRequest,
  onResponse,
}: PatchRPCProviderWithMetricsParameters<P>) => {
  const { rpcRequestCount, rpcRequestMethods, rpcResponseTime } =
    rpcMetricsFactory(prefix, registry);

  return patchRPCProviderWithCallbacks({
    Provider,
    onRequest: (chainId, url, method, parameters) => {
      const provider = getProviderLabel(url);
      rpcRequestCount.labels({ chainId, provider }).inc();
      rpcRequestMethods.labels({ method }).inc();

      onRequest?.(chainId, url, method, parameters);
    },
    onResponse: (chainId, url, elapsedTime) => {
      const provider = getProviderLabel(url);
      // Not sure how to get correct status here, it's probably 200 or throws an error
      rpcResponseTime.observe(
        { chainId, provider, status: '2xx' },
        elapsedTime,
      );

      onResponse?.(chainId, url, elapsedTime);
    },
  });
};
