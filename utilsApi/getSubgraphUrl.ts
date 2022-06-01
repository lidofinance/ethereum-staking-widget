import getConfig from 'next/config';
import { CHAINS } from '@lido-sdk/constants';
import { SubgraphChains } from 'types';

const { serverRuntimeConfig } = getConfig();
export const SUBGRAPH_URL = {
  [CHAINS.Mainnet]: serverRuntimeConfig.subgraphMainnet,
  [CHAINS.Ropsten]: serverRuntimeConfig.subgraphRopsten,
  [CHAINS.Rinkeby]: serverRuntimeConfig.subgraphRinkeby,
  [CHAINS.Goerli]: serverRuntimeConfig.subgraphGoerli,
  [CHAINS.Kovan]: serverRuntimeConfig.subgraphKovan,
  [CHAINS.Kintsugi]: serverRuntimeConfig.subgraphKintsugi,
} as const;

export const getSubgraphUrl = (chainId: SubgraphChains): string | undefined => {
  return SUBGRAPH_URL[chainId];
};
