import { Histogram } from 'prom-client';

export const INFURA = 'infura';
export const ALCHEMY = 'alchemy';

type RpcResponseTime = Histogram<'provider' | 'chainId'>;

export const rpcResponseTimeFactory = (prefix: string): RpcResponseTime =>
  new Histogram({
    name: prefix + 'rpc_service_response',
    help: 'RPC service response time seconds',
    buckets: [0.1, 0.2, 0.3, 0.6, 1, 1.5, 2, 5],
    labelNames: ['provider', 'chainId'],
    registers: [],
  });
