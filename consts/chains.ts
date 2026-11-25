import {
  LIDO_L2_CONTRACT_ADDRESSES,
  SUPPORTED_CHAINS as SDK_SUPPORTED_CHAINS,
} from '@lidofinance/lido-ethereum-sdk/common';
import {
  base,
  linea,
  arbitrum,
  optimism,
  unichain,
  metis,
  bsc,
} from 'viem/chains';

import type { CHAIN_ID } from 'consts/chains';

// Rexporting for convenience
export { CHAINS, KNOWN_CHAIN_IDS, CHAIN_LIST } from 'config/chains';
export type { CHAIN_ID } from 'config/chains';

export enum LIDO_MULTICHAIN_CHAINS {
  Optimism = optimism.id,
  Arbitrum = arbitrum.id,
  Base = base.id,
  Linea = linea.id,
  'BNB Chain' = bsc.id,
  Unichain = unichain.id,
  Metis = metis.id,
}

export const isSupportedChain = (chainId?: number) => {
  return Boolean(chainId && SDK_SUPPORTED_CHAINS.includes(chainId));
};

export const isSupportedL2WrapChain = (chainId?: number) => {
  return Boolean(
    chainId &&
    chainId in LIDO_L2_CONTRACT_ADDRESSES &&
    !!LIDO_L2_CONTRACT_ADDRESSES[chainId as CHAIN_ID]?.steth,
  );
};

export const isSupportedL2StakingChain = (chainId?: number) => {
  return Boolean(
    chainId &&
    chainId in LIDO_L2_CONTRACT_ADDRESSES &&
    !!LIDO_L2_CONTRACT_ADDRESSES[chainId as CHAIN_ID]?.stakeReceiver,
  );
};

export const isSupportedL2Chain = (chainId?: number) => {
  return isSupportedL2WrapChain(chainId) || isSupportedL2StakingChain(chainId);
};

export const isSupportedL1Chain = (chainId?: number) => {
  return isSupportedChain(chainId) && !isSupportedL2Chain(chainId);
};
