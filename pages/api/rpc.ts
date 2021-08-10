import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchRPC } from '@lido-sdk/fetch';
import { CHAINS } from '@lido-sdk/constants';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();
const { infuraApiKey, alchemyApiKey } = serverRuntimeConfig;

type Rpc = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

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
    res.status(500).json({ error: error.message });
  }
};

export default rpc;
