import { Registry } from 'prom-client';
import { FetchRpc, fetchRpc } from './fetchRpc';
import {
  rpcMetricsFactory,
  getProviderLabel,
  getStatusLabel,
} from '../metrics';
import { ChainID } from '../types';

export type TrackedFetchRpcFactoryParameters = {
  prefix: string;
  registry: Registry;
};

export type TrackedFetchRPC = FetchRpc<{ chainId: ChainID }>;

export const trackedFetchRpcFactory = ({
  prefix,
  registry,
}: TrackedFetchRpcFactoryParameters): TrackedFetchRPC => {
  const { rpcRequestCount, rpcRequestMethods, rpcResponseTime } =
    rpcMetricsFactory(prefix, registry);

  return async ({ url, init, chainId }) => {
    const provider = getProviderLabel(url);

    rpcRequestCount.labels({ chainId, provider }).inc();
    for (const { method } of Array.isArray(init.body)
      ? init.body
      : [init.body]) {
      rpcRequestMethods.labels({ method }).inc();
    }
    const responseTime = rpcResponseTime.startTimer();

    const response = await fetchRpc({ url, init });

    const status = getStatusLabel(response.status);
    responseTime({ chainId, provider, status });

    return response;
  };
};
