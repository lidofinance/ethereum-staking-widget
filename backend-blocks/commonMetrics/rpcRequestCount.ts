import { Counter } from 'prom-client';

export type RpcRequestCount = Counter<'chainId' | 'provider'>;

// TODO: split rpcRequestCount to rpcMethodCount & rpcRequestCount
// TODO: check if we work with node.cluster correctly https://github.com/siimon/prom-client#usage-with-nodejss-cluster-module
// TODO: add counter for method no chainId no provider no status
// TODO: add counter for rpc requests methods, which aren't whitelisted (DO NOT INCLUDE LABEL)
export const rpcRequestCountFactory = (prefix: string): RpcRequestCount =>
  new Counter({
    name: prefix + 'rpc_service_request_count',
    help: 'RPC service request count',
    labelNames: ['chainId', 'provider'],
    registers: [],
  });
