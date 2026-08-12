import {
  LIDO_L2_CONTRACT_ADDRESSES,
  SUPPORTED_CHAINS as SDK_SUPPORTED_CHAINS,
} from '@lidofinance/lido-ethereum-sdk/common';

import type { CHAIN_ID } from 'consts/chains';

// Rexporting for convenience
export { CHAINS, KNOWN_CHAIN_IDS, CHAIN_LIST } from 'config/chains';
export type { CHAIN_ID } from 'config/chains';

export enum LIDO_MULTICHAIN_CHAINS {
  Optimism = 10,
  Arbitrum = 42161,
  Base = 8453,
  Linea = 59144,
  'BNB Chain' = 56,
  Unichain = 130,
  Metis = 1088,
}

// TODO: move to @lidofinance/lido-ethereum-sdk package

export const isSDKSupportedChain = (chainId?: number) => {
  return Boolean(chainId && SDK_SUPPORTED_CHAINS.includes(chainId));
};

export const isSDKSupportedL2Chain = (chainId?: number) => {
  return Boolean(chainId && LIDO_L2_CONTRACT_ADDRESSES[chainId as CHAIN_ID]);
};

export const isSDKSupportedChainAndChainIsL1 = (chainId?: number) => {
  return Boolean(
    chainId && isSDKSupportedChain(chainId) && !isSDKSupportedL2Chain(chainId),
  );
};
