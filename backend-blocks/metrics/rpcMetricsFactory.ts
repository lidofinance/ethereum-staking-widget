import { Counter, Histogram, Registry } from 'prom-client';

export const rpcRequestCountFactory = (prefix: string) =>
  new Counter({
    name: prefix + 'rpc_service_request_count',
    help: 'RPC service request count',
    labelNames: ['chainId', 'provider'],
    registers: [],
  });

export const rpcResponseTimeFactory = (prefix: string) =>
  new Histogram({
    name: prefix + 'rpc_service_response_time',
    help: 'RPC service response time seconds',
    buckets: [0.1, 0.2, 0.3, 0.6, 1, 1.5, 2, 5],
    labelNames: ['provider', 'chainId'],
    registers: [],
  });

export const rpcResponseCountFactory = (prefix: string) =>
  new Counter({
    name: prefix + 'rpc_service_response_count',
    help: 'RPC service response count',
    labelNames: ['chainId', 'provider', 'status'],
    registers: [],
  });

export const rpcRequestMethodsFactory = (prefix: string) =>
  new Counter({
    name: prefix + 'rpc_service_request_methods',
    help: 'RPC service request methods',
    labelNames: ['method'],
    registers: [],
  });

let cache: {
  rpcRequestCount: ReturnType<typeof rpcRequestCountFactory>;
  rpcRequestMethods: ReturnType<typeof rpcRequestMethodsFactory>;
  rpcResponseTime: ReturnType<typeof rpcResponseTimeFactory>;
  rpcResponseCount: ReturnType<typeof rpcResponseCountFactory>;
} | null = null;

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
