import { FetchRpc, fetchRpc } from './fetchRpc';
import { Registry } from 'prom-client';
import {
  rpcMetricsFactory,
  getProviderLabel,
  getStatusLabel,
  startTimer,
} from '../metrics';

export type FetchRPCWithMetricsFactoryParameters = {
  prefix: string;
  registry: Registry;
};

export const trackedFetchRpcFactory = ({
  prefix,
  registry,
}: FetchRPCWithMetricsFactoryParameters): FetchRpc => {
  const { rpcRequestCount, rpcRequestMethods, rpcResponseTime } =
    rpcMetricsFactory(prefix, registry);

  return async (chainId, url, init) => {
    const provider = getProviderLabel(url);

    rpcRequestCount.labels({ chainId, provider }).inc();
    for (const { method } of Array.isArray(init.body)
      ? init.body
      : [init.body]) {
      rpcRequestMethods.labels({ method }).inc();
    }
    const timer = startTimer();

    const response = await fetchRpc(chainId, url, init);

    const elapsedTime = timer();
    const status = getStatusLabel(response.status);
    rpcResponseTime.observe({ chainId, provider, status }, elapsedTime);

    return response;
  };
};
