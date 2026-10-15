import * as wagmiChains from 'wagmi/chains';
import { Chain } from 'wagmi/chains';

import { ReactComponent as OptimismLogo } from 'assets/icons/chain-toggler/optimism.svg';
import { ReactComponent as EthereumMainnetLogo } from 'assets/icons/chain-toggler/mainnet.svg';
import { ReactComponent as UnichainLogo } from 'assets/icons/chain-toggler/unichain.svg';
import { ReactComponent as BaseLogo } from 'assets/icons/chain-toggler/base.svg';
import { ReactComponent as ArbitrumLogo } from 'assets/icons/chain-toggler/arbitrum.svg';
import { ReactComponent as LineaLogo } from 'assets/icons/chain-toggler/linea.svg';

import { CHAINS } from 'consts/chains';

export const wagmiChainMap = Object.values(wagmiChains).reduce(
  (acc, chain) => {
    acc[chain.id] = chain;
    return acc;
  },
  {} as Record<number, Chain>,
);

export const CHAIN_SWITCH_TIMEOUT = 10_000; // 10 seconds

export enum DAPP_CHAIN_TYPE {
  Ethereum = 'Ethereum',
  Optimism = 'Optimism',
  Unichain = 'Unichain',
  Base = 'Base',
  Arbitrum = 'Arbitrum',
  Linea = 'Linea',
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

export const UNICHAIN_CHAINS = new Set([
  CHAINS.Unichain,
  CHAINS.UnichainSepolia,
]);

export const BASE_CHAINS = new Set([CHAINS.Base]);

export const ARBITRUM_CHAINS = new Set([CHAINS.Arbitrum]);

export const LINEA_CHAINS = new Set([CHAINS.Linea]);

export const CHAIN_ICONS_MAP = new Map([
  [CHAINS.Mainnet, EthereumMainnetLogo],
  [CHAINS.Holesky, EthereumMainnetLogo],
  [CHAINS.Hoodi, EthereumMainnetLogo],
  [CHAINS.Sepolia, EthereumMainnetLogo],
  [CHAINS.Optimism, OptimismLogo],
  [CHAINS.OptimismSepolia, OptimismLogo],
  [CHAINS.Unichain, UnichainLogo],
  [CHAINS.UnichainSepolia, UnichainLogo],
  [CHAINS.Base, BaseLogo],
  [CHAINS.Arbitrum, ArbitrumLogo],
  [CHAINS.Linea, LineaLogo],
]);

export const CHAIN_MAP = new Map<number, DAPP_CHAIN_TYPE>([
  ...[...ETHEREUM_CHAINS].map((id) => [id, DAPP_CHAIN_TYPE.Ethereum] as const),
  ...[...OPTIMISM_CHAINS].map((id) => [id, DAPP_CHAIN_TYPE.Optimism] as const),
  ...[...UNICHAIN_CHAINS].map((id) => [id, DAPP_CHAIN_TYPE.Unichain] as const),
  ...[...BASE_CHAINS].map((id) => [id, DAPP_CHAIN_TYPE.Base] as const),
  ...[...ARBITRUM_CHAINS].map((id) => [id, DAPP_CHAIN_TYPE.Arbitrum] as const),
  ...[...LINEA_CHAINS].map((id) => [id, DAPP_CHAIN_TYPE.Linea] as const),
]);

export const getChainTypeByChainId = (
  chainId?: number,
): DAPP_CHAIN_TYPE | null =>
  chainId ? (CHAIN_MAP.get(chainId) ?? null) : null;

export const CHAIN_NAME_OVERRIDE: Record<number, string> = {
  [CHAINS.Optimism]: 'Optimism',
  [CHAINS.Unichain]: 'Unichain',
  [CHAINS.Base]: 'Base',
  [CHAINS.Arbitrum]: 'Arbitrum',
  [CHAINS.Linea]: 'Linea',
};

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

  if (CHAIN_NAME_OVERRIDE[chainId]) return CHAIN_NAME_OVERRIDE[chainId];

  return chain.testnet ? `${chainType}(${chain.name})` : chainType;
};
