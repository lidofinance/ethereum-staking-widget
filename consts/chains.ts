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
} from 'wagmi/chains';

import { CHAINS } from 'config/chains';
import { LIDO_L2_STAKING_CHAIN_IDS } from 'modules/l2-staking';
export { CHAINS } from 'config/chains';

export enum LIDO_MULTICHAIN_CHAINS {
  Optimism = optimism.id,
  Arbitrum = arbitrum.id,
  Base = base.id,
  Linea = linea.id,
  'BNB Chain' = bsc.id,
  Unichain = unichain.id,
  Metis = metis.id,
}

export const isSupportedChain = (chainId?: CHAINS) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return Boolean(chainId && SDK_SUPPORTED_CHAINS.includes(chainId as number));
};

export const isSupportedL2WrapChain = (chainId?: CHAINS) => {
  return Boolean(chainId && chainId in LIDO_L2_CONTRACT_ADDRESSES);
};

export const isSupportedL2StakingChain = (chainId?: CHAINS) => {
  return Boolean(chainId && LIDO_L2_STAKING_CHAIN_IDS.includes(chainId));
};

export const isSupportedL2Chain = (chainId?: CHAINS) => {
  return isSupportedL2WrapChain(chainId) || isSupportedL2StakingChain(chainId);
};

export const isSupportedL1Chain = (chainId?: CHAINS) => {
  return isSupportedChain(chainId) && !isSupportedL2Chain(chainId);
};
