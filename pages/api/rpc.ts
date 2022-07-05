import type { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';
import {
  DEFAULT_API_ERROR_MESSAGE,
  HEALTHY_RPC_SERVICES_ARE_OVER,
} from 'config';
import { serverLogger } from 'utilsApi';
import { fetchRPCFactory } from 'backend-blocks/fetch';
import {
  rpcRequestCount,
  rpcResponseCount,
  rpcResponseTime,
} from '../../utilsApi/metrics';

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
const { infuraApiKey, alchemyApiKey } = serverRuntimeConfig;
const { defaultChain } = publicRuntimeConfig;

type Rpc = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

const fetchRPC = fetchRPCFactory({
  providers: {
    1: [
      `https://example.co`,
      `https://mainnet.infura.io/v3/1111`,
      `https://mainnet.infura.io/v3/${infuraApiKey}`,
      `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`,
    ],
    5: [
      `https://example.co`,
      `https://goerli.infura.io/v3/1111`,
      `https://goerli.infura.io/v3/${infuraApiKey}`,
      `https://eth-goerli.alchemyapi.io/v2/${alchemyApiKey}`,
    ],
  },
  metrics: {
    rpcResponseCount,
    rpcResponseTime,
    rpcRequestCount,
  },
});

// Proxy for third-party API.
const rpc: Rpc = async (req, res) => {
  try {
    const chainId = Number(req.query.chainId || defaultChain);

    const requested = await fetchRPC(chainId, { body: req.body });

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
