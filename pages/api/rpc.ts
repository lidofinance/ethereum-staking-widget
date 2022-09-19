import Metrics from 'utilsApi/metrics';
import { rpcFactory } from '@lidofinance/next-pages';
import { dynamics, METRICS_PREFIX } from 'config';
import { fetchRPC, serverLogger } from 'utilsApi';
import { rpcUrls } from 'utilsApi/rpcUrls';
import { wrapNextRequest, responseTimeMetric } from 'utilsApi';

const rpc = rpcFactory({
  fetchRPC,
  serverLogger,
  metrics: {
    prefix: METRICS_PREFIX,
    registry: Metrics.registry,
  },
  allowedRPCMethods: [
    'test',
    'eth_call',
    'eth_gasPrice',
    'eth_estimateGas',
    'eth_getBlockByNumber',
    'eth_getBalance',
    'eth_blockNumber',
    'eth_getTransactionByHash',
    'eth_getTransactionReceipt',
    'eth_getTransactionCount',
    'eth_sendRawTransaction',
    'eth_getLogs',
    'eth_chainId',
    'net_version',
  ],
  defaultChain: `${dynamics.defaultChain}`,
  providers: rpcUrls,
});

export default wrapNextRequest([
  responseTimeMetric(Metrics.request.apiTimings),
])(rpc);
