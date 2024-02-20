import { rpcFactory } from '@lidofinance/next-pages';
import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';
import { dynamics } from 'config';
import { API_ROUTES } from 'consts/api';
import { METRICS_PREFIX } from 'consts/metrics';
import {
  fetchRPC,
  rateLimit,
  responseTimeMetric,
  defaultErrorHandler,
  requestAddressMetric,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { rpcUrls } from 'utilsApi/rpcUrls';

const rpc = rpcFactory({
  fetchRPC,
  serverLogger: console,
  metrics: {
    prefix: METRICS_PREFIX,
    registry: Metrics.registry,
  },
  allowedRPCMethods: [
    'test',
    'eth_call',
    'eth_gasPrice',
    'eth_getCode',
    'eth_estimateGas',
    'eth_getBlockByNumber',
    'eth_feeHistory',
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
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.RPC),
  requestAddressMetric(Metrics.request.ethCallToAddress),
  defaultErrorHandler,
])(rpc);
