import { Counter } from 'prom-client';

export type RpcRequestCount = Counter<'chainId' | 'rpcMethod'>;

export const rpcRequestCountFactory = (prefix: string): RpcRequestCount =>
  new Counter({
    name: prefix + 'rpc_service_request_count',
    help: 'RPC service request count',
    labelNames: ['chainId', 'rpcMethod'],
    registers: [],
  });
