import {
  FetchRPC,
  fetchRPCFactory,
  FetchRPCFactoryParameters,
} from './fetchRPCFactory';
import { Registry } from 'prom-client';
import {
  rpcMetricsFactory,
  getProviderLabel,
  getStatusLabel,
} from '../metrics';

export type FetchRPCWithMetricsFactoryParameters = FetchRPCFactoryParameters & {
  metrics: {
    prefix: string;
    registry: Registry;
  };
};

export const fetchRPCWithMetricsFactory = ({
  metrics: { prefix, registry },
  ...rest
}: FetchRPCWithMetricsFactoryParameters): FetchRPC => {
  const { rpcRequestCount, rpcRequestMethods, rpcResponseTime } =
    rpcMetricsFactory(prefix, registry);

  return fetchRPCFactory({
    ...rest,
    onRequest: async (chainId, url, init) => {
      // Default metrics
      const provider = getProviderLabel(url);
      rpcRequestCount.labels({ chainId, provider }).inc();
      for (const { method } of Array.isArray(init.body)
        ? init.body
        : [init.body]) {
        rpcRequestMethods.labels({ method }).inc();
      }

      // Custom metrics
      rest?.onRequest?.(chainId, url, init);
    },
    onResponse: async (chainId, url, response, time) => {
      // Default metrics
      const provider = getProviderLabel(url);
      const status = getStatusLabel(response.status);
      rpcResponseTime.observe({ chainId, provider, status }, time);

      // Custom metrics
      rest?.onResponse?.(chainId, url, response, time);
    },
  });
};
