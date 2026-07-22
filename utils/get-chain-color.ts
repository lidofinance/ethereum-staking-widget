import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

export const CHAINS_COLORS: {
  [key in CHAINS]?: string;
} = {
  [CHAINS.Mainnet]: '#29b6af',
  [CHAINS.Holesky]: '#AA346A',
  [CHAINS.Hoodi]: '#AA346A',
  [CHAINS.Sepolia]: '#FFD700',
  [CHAINS.Optimism]: '#da3737',
  [CHAINS.OptimismSepolia]: '#da3737',
  [CHAINS.Unichain]: '#FC0FA4',
  [CHAINS.UnichainSepolia]: '#FC0FA4',
};

export const CHAIN_COLOR_FALLBACK = '#7a8aa0';

export const getChainColor = (chainId: number): string => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- rule false positive: number is not a valid index for the CHAINS-keyed map without the assertion
  return CHAINS_COLORS[chainId as CHAINS] || CHAIN_COLOR_FALLBACK;
};
