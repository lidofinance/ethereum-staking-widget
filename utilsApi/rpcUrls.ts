import { CHAINS } from 'utils/chains';

import { getOneConfig } from 'config/one-config/utils';
const { rpcUrls_1, rpcUrls_5, rpcUrls_17000 } = getOneConfig();

export const rpcUrls: Record<CHAINS, [string, ...string[]]> = {
  [CHAINS.Mainnet]: rpcUrls_1,
  [CHAINS.Goerli]: rpcUrls_5,
  [CHAINS.Holesky]: rpcUrls_17000,
};
