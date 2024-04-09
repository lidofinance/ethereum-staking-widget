import { secretConfig } from 'config';
import { CHAINS } from 'consts/chains';
import { SubgraphChains } from 'types';

export const SUBGRAPH_URL = {
  [CHAINS.Mainnet]: secretConfig.subgraphMainnet,
  [CHAINS.Goerli]: secretConfig.subgraphGoerli,
  [CHAINS.Holesky]: secretConfig.subgraphHolesky,
} as const;

export const getSubgraphUrl = (chainId: SubgraphChains): string | undefined => {
  return SUBGRAPH_URL[chainId];
};
