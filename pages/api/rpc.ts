import type { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';
import { fetchRPC } from '@lido-sdk/fetch';
import { CHAINS } from '@lido-sdk/constants';
import {
  DEFAULT_API_ERROR_MESSAGE,
  HEALTHY_RPC_SERVICES_ARE_OVER,
} from 'config';
import {
  ALCHEMY,
  INFURA,
  rpcRequestCount,
  rpcResponseCount,
  rpcResponseTime,
} from 'utilsApi/metrics';
import { serverLogger } from 'utilsApi';
import { FetchRPC } from '@lido-sdk/fetch';

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
const { infuraApiKey, alchemyApiKey } = serverRuntimeConfig;
const { defaultChain } = publicRuntimeConfig;

type Rpc = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

const getProviderLabel = (
  url: string,
): typeof INFURA | typeof ALCHEMY | 'other' => {
  switch (true) {
    case url.indexOf(INFURA) > -1:
      return INFURA;
    case url.indexOf(ALCHEMY) > -1:
      return ALCHEMY;
    default:
      return 'other';
  }
};

// getStatusLabel(200) => '2xx'
// getStatusLabel(404) => '4xx'
// getStatusLabel(undefined) => 'xxx'
const getStatusLabel = (status: number | undefined) => {
  if (status == null || status < 100 || status > 600) {
    return 'xxx';
  }
  const majorStatus = Math.trunc(status / 100);
  return `${majorStatus}xx`;
};

const getRPCMethodLabel = (method: string) => {
  switch (method) {
    case 'eth_gasPrice':
    case 'eth_call':
      return method;
    default:
      return 'other';
  }
};

const fetchRPCWithMetrics: FetchRPC = async (chainId, options) => {
  // Metrics before
  const rpcMethod = getRPCMethodLabel((options as any).body);
  rpcRequestCount.labels({ chainId, rpcMethod }).inc();
  const endMetric = rpcResponseTime.startTimer();

  // Request
  const requested = await fetchRPC(chainId, options);

  // Metrics after
  const provider = getProviderLabel(requested.url);
  const status = getStatusLabel(requested.status);
  endMetric({ provider, chainId });
  rpcResponseCount.labels({ provider, chainId, status }).inc();

  serverLogger.debug(`[rpc] Get via ${provider} with [${status}] status`);

  return requested;
};

// Proxy for third-party API.
const rpc: Rpc = async (req, res) => {
  try {
    const chainId = Number(req.query.chainId || defaultChain);

    if (!CHAINS[chainId]) {
      throw new Error(`Chain ${chainId} is not supported`);
    }

    const options = {
      body: JSON.stringify(req.body),
      providers: { infura: infuraApiKey, alchemy: alchemyApiKey },
    };

    const requested = await fetchRPCWithMetrics(chainId, options);

    res.setHeader(
      'Content-Type',
      requested.headers.get('Content-Type') ?? 'application/json',
    );
    res.status(requested.status).send(requested.body);
  } catch (error) {
    if (error instanceof Error) {
      serverLogger.error(error.message ?? DEFAULT_API_ERROR_MESSAGE);
      res.status(500).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
    } else {
      res.status(500).json(HEALTHY_RPC_SERVICES_ARE_OVER);
    }
  }
};

export default rpc;
