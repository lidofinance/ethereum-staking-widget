import type { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';
import { fetchRPC } from '@lido-sdk/fetch';
import { CHAINS } from '@lido-sdk/constants';
import {
  DEFAULT_API_ERROR_MESSAGE,
  HEALTHY_RPC_SERVICES_ARE_OVER,
} from 'config';
import { rpcResponseTime, INFURA, ALCHEMY } from 'utilsApi/metrics';
import { serverLogger } from 'utilsApi';

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
const { infuraApiKey, alchemyApiKey } = serverRuntimeConfig;
const { defaultChain } = publicRuntimeConfig;

type Rpc = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

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

    const endMetric = rpcResponseTime.startTimer();

    const requested = await fetchRPC(chainId, options);

    if (requested.url.indexOf(INFURA) > -1) {
      serverLogger.log('[rpc] Get via infura');
      endMetric({ provider: INFURA, chainId: String(chainId) });
    }
    if (requested.url.indexOf(ALCHEMY) > -1) {
      serverLogger.log('[rpc] Get via alchemy');
      endMetric({ provider: ALCHEMY, chainId: String(chainId) });
    }

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
