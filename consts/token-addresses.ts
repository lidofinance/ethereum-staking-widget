import type { Address } from 'viem';
import { LIDO_TOKENS, CHAINS } from '@lidofinance/lido-ethereum-sdk';

import { CONTRACTS_MAP } from 'config';

export type TOKENS =
  | Exclude<(typeof LIDO_TOKENS)[keyof typeof LIDO_TOKENS], 'unstETH'>
  | 'LDO';

export const TOKENS_BY_NETWORK: {
  [key in CHAINS]?: { [key in TOKENS]?: Address };
} = {
  [CHAINS.Mainnet]: {
    [LIDO_TOKENS.steth]: CONTRACTS_MAP.mainnet.STETH,
    [LIDO_TOKENS.wsteth]: CONTRACTS_MAP.mainnet.WSTETH,
    LDO: CONTRACTS_MAP.mainnet.LDO,
  },
  [CHAINS.Holesky]: {
    [LIDO_TOKENS.steth]: CONTRACTS_MAP.holesky.STETH,
    [LIDO_TOKENS.wsteth]: CONTRACTS_MAP.holesky.WSTETH,
    LDO: CONTRACTS_MAP.holesky.LDO,
  },
  [CHAINS.Hoodi]: {
    [LIDO_TOKENS.steth]: CONTRACTS_MAP.hoodi.STETH,
    [LIDO_TOKENS.wsteth]: CONTRACTS_MAP.hoodi.WSTETH,
    LDO: CONTRACTS_MAP.hoodi.LDO,
  },
  [CHAINS.Sepolia]: {
    [LIDO_TOKENS.steth]: CONTRACTS_MAP.sepolia.STETH,
    [LIDO_TOKENS.wsteth]: CONTRACTS_MAP.sepolia.WSTETH,
    LDO: CONTRACTS_MAP.sepolia.LDO,
  },
};

export const getTokenAddress = (
  chainId: CHAINS,
  token: TOKENS,
): Address | undefined => {
  if (token === 'ETH') return '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  return TOKENS_BY_NETWORK?.[chainId]?.[token];
};
