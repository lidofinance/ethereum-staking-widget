import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';
import { trackedFetchRpcFactory } from '@lidofinance/api-rpc';

import { config, secretConfig } from 'config';
import { API_ROUTES } from 'consts/api';
import { CHAINS } from 'consts/chains';
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
import { rpcFactory } from 'utilsApi/rpcFactory';
import {
  METRIC_CONTRACT_ADDRESSES,
  METRIC_CONTRACT_EVENT_ADDRESSES,
} from 'utilsApi/contractAddressesMetricsMap';

const allowedCallAddresses: Record<string, string[]> = Object.entries(
  METRIC_CONTRACT_ADDRESSES,
).reduce(
  (acc, [chainId, addresses]) => {
    acc[chainId] = Object.keys(addresses);
    return acc;
  },
  {} as Record<string, string[]>,
);

const allowedLogsAddresses: Record<string, string[]> = Object.entries(
  METRIC_CONTRACT_EVENT_ADDRESSES,
).reduce(
  (acc, [chainId, addresses]) => {
    acc[chainId] = Object.keys(addresses);
    return acc;
  },
  {} as Record<string, string[]>,
);

const allowedRPCMethods = [
  'test',
  'eth_call',
  'eth_gasPrice',
  'eth_getCode',
  'eth_estimateGas',
  'eth_getBlockByNumber',
  'eth_feeHistory',
  'eth_maxPriorityFeePerGas',
  'eth_getBalance',
  'eth_blockNumber',
  'eth_getTransactionByHash',
  'eth_getTransactionReceipt',
  'eth_getTransactionCount',
  'eth_sendRawTransaction',
  'eth_getLogs',
  'eth_chainId',
  'net_version',
];

const rpc = rpcFactory({
  fetchRPC: trackedFetchRpcFactory({
    registry: Metrics.registry,
    prefix: METRICS_PREFIX,
  }),
  metrics: {
    prefix: METRICS_PREFIX,
    registry: Metrics.registry,
  },
  defaultChain: `${config.defaultChain}`,
  providers: {
    [CHAINS.Mainnet]: secretConfig.rpcUrls_1,
    [CHAINS.Holesky]: secretConfig.rpcUrls_17000,
    [CHAINS.Sepolia]: secretConfig.rpcUrls_11155111,
    [CHAINS.Optimism]: secretConfig.rpcUrls_10,
    [CHAINS.OptimismSepolia]: secretConfig.rpcUrls_11155420,
  },
  validation: {
    allowedRPCMethods,
    allowedCallAddresses,
    allowedLogsAddresses,
    maxBatchCount: config.PROVIDER_MAX_BATCH,
    blockEmptyAddressGetLogs: true,
    maxGetLogsRange: 20_000, // only 20k blocks size historical queries
    maxResponseSize: 1_000_000, // 1mb max response
  },
});

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.POST]),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.RPC),
  requestAddressMetric(Metrics.request.ethCallToAddress),
  defaultErrorHandler,
])(rpc);
