import { CHAINS } from 'consts/chains';
import { DISCONNECTED_CHAIN_ID } from 'utils/tracked-chain';

// Action-scope custom dimensions, ids as registered in the Matomo admin.
// Dimension 1 is reserved: the analytics package sets it from the meta-info cookie
export const MATOMO_DIMENSIONS = {
  chain: 2,
  token: 3,
} as const;

// "mainnet-1", "base-8453", "unknown-1337", "disconnected-0"
export const getMatomoChainSlug = (chainId: number) => {
  if (chainId === DISCONNECTED_CHAIN_ID) return `disconnected-${chainId}`;
  const chainName: string | undefined = CHAINS[chainId];
  return `${chainName ?? 'unknown'}-${chainId}`.toLowerCase();
};

export const getMatomoTokenSlug = (token: string) => token.toLowerCase();
