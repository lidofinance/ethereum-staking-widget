import getConfig from 'next/config';
import { CHAINS } from 'utils/chains';
import { SubgraphChains } from 'types';

const { serverRuntimeConfig } = getConfig();
export const SUBGRAPH_URL = {
  [CHAINS.Mainnet]: serverRuntimeConfig.subgraphMainnet,
  [CHAINS.Goerli]: serverRuntimeConfig.subgraphGoerli,
  [CHAINS.Holesky]: serverRuntimeConfig.subgraphHolesky,
} as const;

export const getSubgraphUrl = (chainId: SubgraphChains): string | undefined => {
  return SUBGRAPH_URL[chainId];
};
