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

// L2WETH is the receiver's WNATIVE. It is also read on-chain by the module, but
// the static address is needed so the RPC allowlist and metrics recognise it
export const LIDO_L2_STAKING_CONTRACT_MAP = {
  [CHAINS.Base]: {
    L2stakingReceiver: '0x328de900860816d29D1367F6903a24D8ed40C997',
    L2WETH: '0x4200000000000000000000000000000000000006',
    L2wstETH: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
    L2FastStakeOraclePool: '0xac143bF41BBA4a8014b4Ef5a5F46b39a36AE40A8',
    L2FastStakeOracleFeed: '0x301cBCDA894c932E9EDa3Cf8878f78304e69E367',
  },
  [CHAINS.Optimism]: {
    L2stakingReceiver: '0x328de900860816d29D1367F6903a24D8ed40C997',
    L2WETH: '0x4200000000000000000000000000000000000006',
    L2wstETH: '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb',
    L2FastStakeOraclePool: '0xac143bF41BBA4a8014b4Ef5a5F46b39a36AE40A8',
    L2FastStakeOracleFeed: '0x301cBCDA894c932E9EDa3Cf8878f78304e69E367',
  },
  [CHAINS.Linea]: {
    L2stakingReceiver: '0x328de900860816d29D1367F6903a24D8ed40C997',
    L2WETH: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
    L2wstETH: '0xB5beDd42000b71FddE22D3eE8a79Bd49A568fC8F',
    L2FastStakeOraclePool: '0xac143bF41BBA4a8014b4Ef5a5F46b39a36AE40A8',
    L2FastStakeOracleFeed: '0x301cBCDA894c932E9EDa3Cf8878f78304e69E367',
  },
  [CHAINS.Arbitrum]: {
    L2stakingReceiver: '0x72229141D4B016682d3618ECe47c046f30Da4AD1',
    L2WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    L2wstETH: '0x5979D7b546E38E414F7E9822514be443A4800529',
    L2FastStakeOraclePool: '0xac143bF41BBA4a8014b4Ef5a5F46b39a36AE40A8',
    L2FastStakeOracleFeed: '0x301cBCDA894c932E9EDa3Cf8878f78304e69E367',
  },
} as const;

export const isSupportedLidoL2StakingChain = (chainId: number) => {
  return LIDO_L2_STAKING_CHAIN_IDS.includes(chainId);
};
