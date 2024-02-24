import { CHAINS } from 'utils/chains';
import { SubgraphChains } from 'types';

import { getOneConfig } from 'config/one-config/utils';
const { subgraphMainnet, subgraphGoerli, subgraphHolesky } = getOneConfig();

export const SUBGRAPH_URL = {
  [CHAINS.Mainnet]: subgraphMainnet,
  [CHAINS.Goerli]: subgraphGoerli,
  [CHAINS.Holesky]: subgraphHolesky,
} as const;

export const getSubgraphUrl = (chainId: SubgraphChains): string | undefined => {
  return SUBGRAPH_URL[chainId];
};
