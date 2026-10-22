import { arbitrum, base, linea, mainnet, sepolia } from 'viem/chains';

import mainnetNetwork from 'networks/mainnet.json';
import sepoliaNetwork from 'networks/sepolia.json';
import arbitrumNetwork from 'networks/l2/arbitrum.json';
import baseNetwork from 'networks/l2/base.json';
import lineaNetwork from 'networks/l2/linea.json';

import type {
  CowswapNetwork,
  DexTokenContractKey,
} from './guards/tx/utils/types';

const TOKEN_KEYS: readonly DexTokenContractKey[] = [
  'lido',
  'wsteth',
  'ldo',
  'weth',
  'usdc',
  'usdt',
  'usde',
  'dai',
  'usds',
  'pyusd',
  'wbtc',
  'cbbtc',
  'link',
  'uni',
  'aave',
  'rlusd',
  'usdg',
  'ausd',
  'eurc',
  'gho',
  'paxg',
  'tbtc',
  'lbtc',
  'cbeth',
  'susde',
  'reth',
  'weeth',
  'meth',
  'ezeth',
  'ethx',
];

type NetworkContracts = Record<string, string | undefined>;

// undefined when the network config has no CoW contracts
const toCowswapNetwork = (
  contracts: NetworkContracts,
): CowswapNetwork | undefined => {
  const { cowSettlement, cowVaultRelayer, cowEthFlow, weth } = contracts;
  if (!cowSettlement || !cowVaultRelayer || !weth) return undefined;

  const network: CowswapNetwork = {
    cowSettlement,
    cowVaultRelayer,
    cowEthFlow,
    weth,
    partnerFeeRecipient: contracts.cowPartnerFeeRecipient,
  };
  for (const key of TOKEN_KEYS) {
    const address = contracts[key];
    if (address) network[key] = address;
  }
  // L2 configs name the bridged wstETH L2wstETH
  network.wsteth ??= contracts.L2wstETH;

  return network;
};

const NETWORK_CONTRACTS: Record<number, NetworkContracts> = {
  [mainnet.id]: mainnetNetwork.contracts,
  [sepolia.id]: sepoliaNetwork.contracts,
  [arbitrum.id]: arbitrumNetwork.contracts,
  [base.id]: baseNetwork.contracts,
  [linea.id]: lineaNetwork.contracts,
};

// Networks with CoW contracts in config; swap also needs partnerFeeRecipient
export const COWSWAP_NETWORKS: Record<number, CowswapNetwork> =
  Object.fromEntries(
    Object.entries(NETWORK_CONTRACTS).flatMap(([chainId, contracts]) => {
      const network = toCowswapNetwork(contracts);
      return network ? [[Number(chainId), network]] : [];
    }),
  );
