import { rpcFactory } from '@lidofinance/next-pages';
import { CHAINS } from '@lido-sdk/constants';
import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';
import { trackedFetchRpcFactory } from '@lidofinance/api-rpc';

import { config, secretConfig } from 'config';
import { API_ROUTES } from 'consts/api';
import { METRICS_PREFIX } from 'consts/metrics';
import {
  rateLimit,
  responseTimeMetric,
  defaultErrorHandler,
  requestAddressMetric,
  httpMethodGuard,
  HttpMethod,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';

const rpc = rpcFactory({
  fetchRPC: trackedFetchRpcFactory({
    registry: Metrics.registry,
    prefix: METRICS_PREFIX,
  }),
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
    'eth_newFilter',
    'eth_getFilterChanges',
    'eth_uninstallFilter',
  ],
  defaultChain: `${config.defaultChain}`,
  providers: {
    [CHAINS.Mainnet]: secretConfig.rpcUrls_1,
    [CHAINS.Holesky]: secretConfig.rpcUrls_17000,
    [CHAINS.Sepolia]: secretConfig.rpcUrls_11155111,
  },
});

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.POST]),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.RPC),
  requestAddressMetric(Metrics.request.ethCallToAddress),
  defaultErrorHandler,
])(rpc);
