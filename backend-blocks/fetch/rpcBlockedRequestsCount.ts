import { Counter } from 'prom-client';

export type RpcBlockedRequestCount = Counter<string>;

export const rpcBlockedRequestCountFactory = (
  prefix: string,
): RpcBlockedRequestCount =>
  new Counter({
    name: prefix + 'rpc_service_blocked_request_count',
    help: 'RPC service blocked requests count',
    labelNames: [],
    registers: [],
  });
