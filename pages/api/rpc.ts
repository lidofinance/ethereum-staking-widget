import type { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';
import { fetchRPC } from '@lido-sdk/fetch';
import { CHAINS } from '@lido-sdk/constants';
import { DEFAULT_API_ERROR_MESSAGE } from 'config';
import { serverLogger } from 'utils/serverLogger';

const { serverRuntimeConfig } = getConfig();
const { infuraApiKey, alchemyApiKey } = serverRuntimeConfig;

type Rpc = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

// Proxy for third-party API.
const rpc: Rpc = async (req, res) => {
  try {
    const chainId = Number(req.query.chainId);

    if (!CHAINS[chainId]) {
      throw new Error(`Chain ${chainId} is not supported`);
    }

    const options = {
      body: JSON.stringify(req.body),
      providers: { alchemy: alchemyApiKey, infura: infuraApiKey },
    };
    const requested = await fetchRPC(chainId, options);

    const responded = await requested.json();
    res.status(requested.status).json(responded);
  } catch (error) {
    serverLogger.error(error);
    if (error instanceof Error) {
      res.status(500).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
    } else {
      res.status(500).json(DEFAULT_API_ERROR_MESSAGE);
    }
  }
};

export default rpc;
