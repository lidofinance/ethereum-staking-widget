import { ReactComponent as OptimismLogo } from 'assets/icons/chain-toggler/optimism.svg';
import { ReactComponent as EthereumMainnetLogo } from 'assets/icons/chain-toggler/mainnet.svg';

import { CHAINS } from 'consts/chains';

export enum DAPP_CHAIN_TYPE {
  Ethereum = 'Ethereum',
  Optimism = 'Optimism',
}

export type SupportedChainLabels = {
  [key in DAPP_CHAIN_TYPE]: string;
};

export const ETHEREUM_CHAINS = new Set([
  CHAINS.Mainnet,
  CHAINS.Holesky,
  CHAINS.Sepolia,
]);

export const OPTIMISM_CHAINS = new Set([
  CHAINS.Optimism,
  CHAINS.OptimismSepolia,
]);

export const getChainTypeByChainId = (
  chainId: number,
): DAPP_CHAIN_TYPE | null => {
  if (ETHEREUM_CHAINS.has(chainId)) {
    return DAPP_CHAIN_TYPE.Ethereum;
  } else if (OPTIMISM_CHAINS.has(chainId)) {
    return DAPP_CHAIN_TYPE.Optimism;
  }
  return null;
};

export const CHAIN_ICONS_MAP = new Map([
  [CHAINS.Mainnet, EthereumMainnetLogo],
  [CHAINS.Holesky, EthereumMainnetLogo],
  [CHAINS.Sepolia, EthereumMainnetLogo],
  [CHAINS.Optimism, OptimismLogo],
  [CHAINS.OptimismSepolia, OptimismLogo],
]);
