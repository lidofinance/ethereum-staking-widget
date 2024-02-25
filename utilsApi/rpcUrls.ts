import { CHAINS } from 'utils/chains';

import { getConfig } from 'config';
const { rpcUrls_1, rpcUrls_5, rpcUrls_17000 } = getConfig();

export const rpcUrls: Record<CHAINS, [string, ...string[]]> = {
  [CHAINS.Mainnet]: rpcUrls_1,
  [CHAINS.Goerli]: rpcUrls_5,
  [CHAINS.Holesky]: rpcUrls_17000,
};
