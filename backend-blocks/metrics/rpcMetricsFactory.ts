import { Counter, Histogram, Registry } from 'prom-client';

export type RpcRequestCount = Counter<'chainId' | 'provider'>;
export const rpcRequestCountFactory = (prefix: string): RpcRequestCount =>
  new Counter({
    name: prefix + 'rpc_service_request_count',
    help: 'RPC service request count',
    labelNames: ['chainId', 'provider'],
    registers: [],
  });

export type RpcResponseTime = Histogram<'provider' | 'chainId'>;
export const rpcResponseTimeFactory = (prefix: string): RpcResponseTime =>
  new Histogram({
    name: prefix + 'rpc_service_response_time',
    help: 'RPC service response time seconds',
    buckets: [0.1, 0.2, 0.3, 0.6, 1, 1.5, 2, 5],
    labelNames: ['provider', 'chainId'],
    registers: [],
  });

export type RpcResponseCount = Counter<'chainId' | 'provider' | 'status'>;
export const rpcResponseCountFactory = (prefix: string): RpcResponseCount =>
  new Counter({
    name: prefix + 'rpc_service_response_count',
    help: 'RPC service response count',
    labelNames: ['chainId', 'provider', 'status'],
    registers: [],
  });

export type RpcRequestMethods = Counter<'method'>;
export const rpcRequestMethodsFactory = (prefix: string): RpcRequestMethods =>
  new Counter({
    name: prefix + 'rpc_service_request_methods',
    help: 'RPC service request methods',
    labelNames: ['method'],
    registers: [],
  });

let cache: {
  rpcRequestCount: RpcRequestCount;
  rpcRequestMethods: RpcRequestMethods;
  rpcResponseTime: RpcResponseTime;
  rpcResponseCount: RpcResponseCount;
} | null = null;

// TODO: check if we work with node.cluster correctly https://github.com/siimon/prom-client#usage-with-nodejss-cluster-module
export const rpcMetricsFactory = (prefix: string, registry: Registry) => {
  if (cache == null) {
    const rpcRequestCount = rpcRequestCountFactory(prefix);
    registry.registerMetric(rpcRequestCount);

    const rpcRequestMethods = rpcRequestMethodsFactory(prefix);
    registry.registerMetric(rpcRequestMethods);

    const rpcResponseTime = rpcResponseTimeFactory(prefix);
    registry.registerMetric(rpcResponseTime);

    const rpcResponseCount = rpcResponseCountFactory(prefix);
    registry.registerMetric(rpcResponseCount);

    cache = {
      rpcRequestCount,
      rpcRequestMethods,
      rpcResponseTime,
      rpcResponseCount,
    };
  }

  return cache;
};
