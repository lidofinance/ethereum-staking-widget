import type { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';
import {
  DEFAULT_API_ERROR_MESSAGE,
  HEALTHY_RPC_SERVICES_ARE_OVER,
} from 'config';
import { serverLogger } from 'utilsApi';
import { fetchRPC } from 'utilsApi/fetchRPC';

const { publicRuntimeConfig } = getConfig();
const { defaultChain } = publicRuntimeConfig;

type Rpc = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

// TODO: move rpc endpoint to backend-blocks
// Proxy for third-party API.
const rpc: Rpc = async (req, res) => {
  try {
    // TODO: forbid GET, HEAD, ... request types
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
