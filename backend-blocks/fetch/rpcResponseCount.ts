import { Counter } from 'prom-client';

export type RpcResponseCount = Counter<'chainId' | 'provider' | 'status'>;

export const rpcResponseCountFactory = (prefix: string): RpcResponseCount =>
  new Counter({
    name: prefix + 'rpc_service_response_count',
    help: 'RPC service response count',
    labelNames: ['chainId', 'provider', 'status'],
    registers: [],
  });
