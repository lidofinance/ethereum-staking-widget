import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

export const CHAINS_COLORS: {
  [key in CHAINS]?: string;
} = {
  [CHAINS.Mainnet]: '#29b6af',
  [CHAINS.Goerli]: '#3099f2',
  [CHAINS.Holesky]: '#AA346A',
  [CHAINS.Sepolia]: '#FFD700',
  [CHAINS.Optimism]: '#da3737',
  [CHAINS.OptimismSepolia]: '#da3737',
};

export const CHAIN_COLOR_FALLBACK = '#7a8aa0';

export const getChainColor = (chainId: number): string => {
  return CHAINS_COLORS[chainId as CHAINS] || CHAIN_COLOR_FALLBACK;
};
