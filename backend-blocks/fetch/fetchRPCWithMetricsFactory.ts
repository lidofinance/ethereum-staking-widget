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
  const {
    rpcRequestCount,
    rpcRequestMethods,
    rpcResponseCount,
    rpcResponseTime,
  } = rpcMetricsFactory(prefix, registry);

  return fetchRPCFactory({
    ...rest,
    onRequest: async (chainId, url, init) => {
      // Default metrics
      const provider = getProviderLabel(url);
      rpcRequestCount.labels({ chainId, provider }).inc();
      const methods = Array.isArray(init?.body)
        ? init?.body.map((item) => item?.method)
        : [init?.body?.method];
      methods.forEach((method) => {
        rpcRequestMethods.labels(method).inc();
      });

      // Custom metrics
      rest?.onRequest?.(chainId, url, init);
    },
    onResponse: async (chainId, url, response, time) => {
      // Default metrics
      const provider = getProviderLabel(url);
      const status = getStatusLabel(response.status);
      rpcResponseCount.labels({ chainId, provider, status }).inc();
      rpcResponseTime.observe({ chainId, provider }, time);

      // Custom metrics
      rest?.onResponse?.(chainId, url, response, time);
    },
  });
};
