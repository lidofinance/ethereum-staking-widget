import { base, optimism, linea, arbitrum } from 'wagmi/chains';
import { CHAINS } from 'config/chains';

export const LIDO_L2_STAKING_QUERY_SCOPE = 'L2_STAKING_QUERY_SCOPE';

export const LIDO_L2_STAKING_CHAINS = [base, optimism, linea, arbitrum];

export const LIDO_L2_STAKING_CHAIN_IDS = LIDO_L2_STAKING_CHAINS.map(
  (chain) => chain.id,
) as CHAINS[];

export const LIDO_L2_STAKING_CONTRACT_MAP = {
  [CHAINS.Base]: {
    L2stakingReceiver: '0x328de900860816d29D1367F6903a24D8ed40C997',
    L2wstETH: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
  },
  [CHAINS.Optimism]: {
    L2stakingReceiver: '0x328de900860816d29D1367F6903a24D8ed40C997',
    L2wstETH: '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb',
  },
  [CHAINS.Linea]: {
    L2stakingReceiver: '0x328de900860816d29D1367F6903a24D8ed40C997',
    L2wstETH: '0xB5beDd42000b71FddE22D3eE8a79Bd49A568fC8F',
  },
  [CHAINS.Arbitrum]: {
    L2stakingReceiver: '0x72229141D4B016682d3618ECe47c046f30Da4AD1',
    L2wstETH: '0x5979D7b546E38E414F7E9822514be443A4800529',
  },
} as const;

export const isSupportedLidoL2StakingChain = (chainId: number) => {
  return LIDO_L2_STAKING_CHAIN_IDS.includes(chainId);
};
