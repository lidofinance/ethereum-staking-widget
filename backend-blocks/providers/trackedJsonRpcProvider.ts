import { JsonRpcProvider } from '@ethersproject/providers';
import { getProviderLabel, rpcMetricsFactory } from '../metrics';
import { Registry } from 'prom-client';

export type TrackedJsonRpcProviderParameters<P extends typeof JsonRpcProvider> =
  {
    prefix: string;
    registry: Registry;
    Provider: P;
  };

export const trackedJsonRpcProvider = <P extends typeof JsonRpcProvider>({
  prefix,
  registry,
  Provider,
}: TrackedJsonRpcProviderParameters<P>) => {
  const { rpcRequestCount, rpcRequestMethods, rpcResponseTime } =
    rpcMetricsFactory(prefix, registry);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return class extends Provider {
    async send(method: string, params: unknown[]) {
      const chainId = this._network.chainId;
      const url = this.connection.url;

      const provider = getProviderLabel(url);
      rpcRequestCount.labels({ chainId, provider }).inc();
      rpcRequestMethods.labels({ method }).inc();
      const responseTime = rpcResponseTime.startTimer();

      const response = await super.send(method, params);

      responseTime(
        // Not sure how to get correct status here, but it's probably 2xx, or it throws an error
        { chainId, provider, status: '2xx' },
      );

      return response;
    }
  };
};
