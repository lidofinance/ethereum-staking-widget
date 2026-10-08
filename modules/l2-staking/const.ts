import { base, optimism, linea, arbitrum } from 'wagmi/chains';
import { CHAINS } from 'config/chains';

export const LIDO_L2_STAKING_QUERY_SCOPE = 'L2_STAKING_QUERY_SCOPE';

export const LIDO_L2_STAKING_CHAINS = [base, optimism, linea, arbitrum];

export const LIDO_L2_STAKING_CHAIN_IDS = LIDO_L2_STAKING_CHAINS.map(
  (chain) => chain.id,
) as CHAINS[];

// Used only when estimation fails. Sized to the highest measured chain
// (Arbitrum, which includes L1 data cost) with ~10% headroom. Measured 2026-10:
// ETH stake 178k-251k, WETH stake 178k-255k, WETH approve 29k-59k
export const LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK = 275_000n;
export const LIDO_L2_FAST_STAKE_WETH_GAS_LIMIT_FALLBACK = 285_000n;
export const LIDO_L2_WETH_APPROVE_GAS_LIMIT_FALLBACK = 65_000n;

export const isSupportedLidoL2StakingChain = (chainId: number) => {
  return LIDO_L2_STAKING_CHAIN_IDS.includes(chainId);
};
