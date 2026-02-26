import type { Address } from 'viem';
import { LIDO_TOKENS, CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

import { CONTRACT_NAMES, getNetworkConfigMapByChain } from './networks-map';
import { TOKEN_SYMBOLS } from 'consts/tokens';

const TOKENS_TO_CONTRACTS = {
  [LIDO_TOKENS.wsteth]: CONTRACT_NAMES.wsteth,
  [LIDO_TOKENS.steth]: CONTRACT_NAMES.lido,
  [LIDO_TOKENS.unsteth]: CONTRACT_NAMES.withdrawalQueue,
  ['wETH']: CONTRACT_NAMES.weth,
  [TOKEN_SYMBOLS.usdc]: CONTRACT_NAMES.usdc,
  [TOKEN_SYMBOLS.usdt]: CONTRACT_NAMES.usdt,
} as const;

export type TOKENS = keyof typeof TOKENS_TO_CONTRACTS | 'ETH';

export const getTokenAddress = (
  chain: CHAINS,
  token: TOKENS,
): Address | undefined => {
  if (token === 'ETH') return '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

  return getNetworkConfigMapByChain(chain)?.contracts[
    TOKENS_TO_CONTRACTS[token]
  ];
};
