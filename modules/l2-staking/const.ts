import { base, optimism, linea, arbitrum } from 'wagmi/chains';
import { CHAINS } from 'config/chains';

export const LIDO_L2_STAKING_QUERY_SCOPE = 'L2_STAKING_QUERY_SCOPE';

export const LIDO_L2_STAKING_CHAINS = [base, optimism, linea, arbitrum];

export const LIDO_L2_STAKING_CHAIN_IDS = LIDO_L2_STAKING_CHAINS.map(
  (chain) => chain.id,
) as CHAINS[];

export const LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK = 145_000n;

export const isSupportedLidoL2StakingChain = (chainId: number) => {
  return LIDO_L2_STAKING_CHAIN_IDS.includes(chainId);
};
