import { NextApiRequest, NextApiResponse } from 'next';
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
import { initializeMetricContractAddresses } from 'utilsApi/contractAddressesMetricsMap';
import { rpcFactory } from 'utilsApi/rpcFactory';
import Metrics from 'utilsApi/metrics';

let rpcFactoryInstance: ReturnType<typeof rpcFactory> | null = null;
// Flag indicating the initialization process
let initializing = false;
// Queue of pending API requests
const waitingPromises: (() => void)[] = [];

const getRPCFactoryInstance = async () => {
  if (rpcFactoryInstance) return rpcFactoryInstance;

  if (initializing) {
    return new Promise<void>((resolve) => waitingPromises.push(resolve)).then(
      () => rpcFactoryInstance,
    );
  }

  // Set a flag to block new requests.
  // This is necessary because due to the code "await initializeMetricContractAddresses()"
  // the "rpcFactoryInstance" may not have time to complete initialization
  // and there will be an attempt to create the second "rpcFactoryInstance" for the second API request
  initializing = true;

  try {
    const { metricContractAddresses, metricContractEventAddresses } =
      await initializeMetricContractAddresses();

    const allowedCallAddresses: Record<string, string[]> = Object.entries(
      metricContractAddresses,
    ).reduce(
      (acc, [chainId, addresses]) => {
        acc[chainId] = Object.keys(addresses);
        return acc;
      },
      {} as Record<string, string[]>,
    );

    const allowedLogsAddresses: Record<string, string[]> = Object.entries(
      metricContractEventAddresses,
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

    rpcFactoryInstance = rpcFactory({
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
  } finally {
    // Reset the flag after completion
    initializing = false;
    // Resolve all pending promises
    waitingPromises.forEach((resolve) => resolve());
    // Clear the queue
    waitingPromises.length = 0;
  }

  return rpcFactoryInstance;
};

export default async function initializeApiRpcEndpoint(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const _rpcFactoryInstance = await getRPCFactoryInstance();

  if (!_rpcFactoryInstance) {
    res.status(500).json({ error: 'Critical Error!' });
    return;
  }

  return wrapNextRequest([
    httpMethodGuard([HttpMethod.POST]),
    rateLimit,
    responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.RPC),
    requestAddressMetric(Metrics.request.ethCallToAddress),
    defaultErrorHandler,
  ])(_rpcFactoryInstance)(req, res);
}
