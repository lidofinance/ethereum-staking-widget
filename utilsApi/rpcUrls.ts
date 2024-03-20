import { CHAINS } from 'consts/chains';
import { secretConfig } from 'config';

export const rpcUrls: Record<CHAINS, [string, ...string[]]> = {
  [CHAINS.Mainnet]: secretConfig.rpcUrls_1,
  [CHAINS.Goerli]: secretConfig.rpcUrls_5,
  [CHAINS.Holesky]: secretConfig.rpcUrls_17000,
};
