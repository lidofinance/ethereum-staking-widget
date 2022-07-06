import { Counter } from 'prom-client';

export type RpcMethodCount = Counter<'method'>;

export const rpcMethodCountFactory = (prefix: string): RpcMethodCount =>
  new Counter({
    name: prefix + 'rpc_service_method_count',
    help: 'RPC service method count',
    labelNames: ['method'],
    registers: [],
  });
