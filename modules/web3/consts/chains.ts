import * as wagmiChains from 'wagmi/chains';
import { Chain } from 'wagmi/chains';

import { ReactComponent as OptimismLogo } from 'assets/icons/chain-toggler/optimism.svg';
import { ReactComponent as EthereumMainnetLogo } from 'assets/icons/chain-toggler/mainnet.svg';
import { ReactComponent as SoneiumLogo } from 'assets/icons/chain-toggler/soneium.svg';
import { ReactComponent as UnichainLogo } from 'assets/icons/chain-toggler/unichain.svg';

import { CHAINS } from 'consts/chains';

export const wagmiChainMap = Object.values(wagmiChains).reduce(
  (acc, chain) => {
    acc[chain.id] = chain;
    return acc;
  },
  {} as Record<number, Chain>,
);

export enum DAPP_CHAIN_TYPE {
  Ethereum = 'Ethereum',
  Optimism = 'Optimism',
  Soneium = 'Soneium',
  Unichain = 'Unichain',
}

export type SupportedChainLabels = {
  [key in DAPP_CHAIN_TYPE]: string;
};

export const ETHEREUM_CHAINS = new Set([
  CHAINS.Mainnet,
  CHAINS.Holesky,
  CHAINS.Hoodi,
  CHAINS.Sepolia,
]);

export const OPTIMISM_CHAINS = new Set([
  CHAINS.Optimism,
  CHAINS.OptimismSepolia,
]);

export const SONEIUM_CHAINS = new Set([CHAINS.Soneium, CHAINS.SoneiumMinato]);

export const UNICHAIN_CHAINS = new Set([
  CHAINS.Unichain,
  CHAINS.UnichainSepolia,
]);

export const CHAIN_ICONS_MAP = new Map([
  [CHAINS.Mainnet, EthereumMainnetLogo],
  [CHAINS.Holesky, EthereumMainnetLogo],
  [CHAINS.Hoodi, EthereumMainnetLogo],
  [CHAINS.Sepolia, EthereumMainnetLogo],
  [CHAINS.Optimism, OptimismLogo],
  [CHAINS.OptimismSepolia, OptimismLogo],
  [CHAINS.Soneium, SoneiumLogo],
  [CHAINS.SoneiumMinato, SoneiumLogo],
  [CHAINS.Unichain, UnichainLogo],
  [CHAINS.UnichainSepolia, UnichainLogo],
]);

export const CHAIN_MAP = new Map<number, DAPP_CHAIN_TYPE>([
  ...[...ETHEREUM_CHAINS].map((id) => [id, DAPP_CHAIN_TYPE.Ethereum] as const),
  ...[...OPTIMISM_CHAINS].map((id) => [id, DAPP_CHAIN_TYPE.Optimism] as const),
  ...[...SONEIUM_CHAINS].map((id) => [id, DAPP_CHAIN_TYPE.Soneium] as const),
  ...[...UNICHAIN_CHAINS].map((id) => [id, DAPP_CHAIN_TYPE.Unichain] as const),
]);

export const getChainTypeByChainId = (
  chainId?: number,
): DAPP_CHAIN_TYPE | null => (chainId ? CHAIN_MAP.get(chainId) ?? null : null);

// Ethereum example:
// - Ethereum
// - or
// - Ethereum(Hoodi)
// - or
// - Ethereum(Sepolia)
// - or
// - Ethereum(Holesky)
export const getPrettyChainName = (chainId: number): string => {
  const chainType = getChainTypeByChainId(chainId);
  const chain = wagmiChainMap[chainId];

  if (!chainType) return chain.name;

  return chain.testnet ? `${chainType}(${chain.name})` : chainType;
};
