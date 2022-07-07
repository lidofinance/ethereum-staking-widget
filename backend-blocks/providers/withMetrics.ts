import { JsonRpcProvider } from '@ethersproject/providers';
import {
  rpcMetricsFactory,
  RpcRequestCount,
  RpcRequestMethods,
  RpcResponseCount,
  RpcResponseTime,
  getProviderLabel,
  startTimer,
} from '../metrics';
import { Registry } from 'prom-client';

export const withMetrics = <P extends typeof JsonRpcProvider>(Provider: P) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return class extends Provider {
    private rpcRequestCount: RpcRequestCount;
    private rpcRequestMethods: RpcRequestMethods;
    private rpcResponseTime: RpcResponseTime;
    private rpcResponseCount: RpcResponseCount;

    constructor(prefix: string, registry: Registry, ...args: any) {
      super(...args);

      const metrics = rpcMetricsFactory(prefix, registry);
      this.rpcRequestCount = metrics.rpcRequestCount;
      this.rpcRequestMethods = metrics.rpcRequestMethods;
      this.rpcResponseTime = metrics.rpcResponseTime;
      this.rpcResponseCount = metrics.rpcResponseCount;
    }

    async send(method: string, params: any[]) {
      const chainId = this._network.chainId;
      const provider = getProviderLabel(this.connection.url);
      this.rpcRequestCount.labels({ chainId, provider }).inc();
      this.rpcRequestMethods.labels(method).inc();
      const timer = startTimer();

      const response = await super.send(method, params);

      const elapsedTime = timer();
      // Not sure how to get correct status here, it's probably 200 or throws an error
      this.rpcResponseCount.labels({ chainId, provider, status: '2xx' }).inc();
      this.rpcResponseTime.observe({ chainId, provider }, elapsedTime);

      return response;
    }
  };
};
