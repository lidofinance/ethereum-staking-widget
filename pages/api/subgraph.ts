import type { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';
import { CHAINS } from '@lido-sdk/constants';
import { serverLogger } from 'utilsApi';

const { serverRuntimeConfig } = getConfig();
export const SUBGRAPH_URL = {
  [CHAINS.Mainnet]: serverRuntimeConfig.subgraphMainnet,
  [CHAINS.Ropsten]: serverRuntimeConfig.subgraphRopsten,
  [CHAINS.Rinkeby]: serverRuntimeConfig.subgraphRinkeby,
  [CHAINS.Goerli]: serverRuntimeConfig.subgraphGoerli,
  [CHAINS.Kovan]: serverRuntimeConfig.subgraphKovan,
  [CHAINS.Kintsugi]: serverRuntimeConfig.subgraphKintsugi,
} as const;

export default async function subgraph(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  serverLogger.debug('Request to subgraph');

  const parsedBody = req.body && JSON.parse(req.body);

  if (!parsedBody.query) {
    const status = 'Error: query is empry';
    serverLogger.error(status);
    res.status(400).json({ status });
    return;
  }

  const chainId = Number(req.query.chainId) as CHAINS;
  const url = SUBGRAPH_URL[chainId];

  if (!url) {
    const status = 'Error: subgraph chain is not supported';
    serverLogger.error(status);
    res.status(400).json({ status });
    return;
  }

  try {
    const requested = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: req.body,
    });

    if (!requested.ok) {
      const errorMessage = await requested.text();
      res.status(requested.status).send(errorMessage);
      return;
    }

    const responded = await requested.json();
    res.status(requested.status).json(responded);
  } catch (error) {
    serverLogger.error(
      error instanceof Error ? error.message : 'Something went wrong',
    );
    res.status(500).send({ error: 'Something went wrong!' });
  }
}
