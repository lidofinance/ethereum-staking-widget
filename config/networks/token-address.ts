import type { Address } from 'viem';
import { LIDO_TOKENS, CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

import { CONTRACT_NAMES, getNetworkConfigMapByChain } from './networks-map';

const TOKENS_TO_CONTRACTS = {
  [LIDO_TOKENS.wsteth]: CONTRACT_NAMES.wsteth,
  [LIDO_TOKENS.steth]: CONTRACT_NAMES.lido,
  [LIDO_TOKENS.unsteth]: CONTRACT_NAMES.withdrawalQueue,
  ['wETH']: CONTRACT_NAMES.weth,
} as const;

export type TOKENS = (typeof LIDO_TOKENS)[keyof typeof LIDO_TOKENS] | 'wETH';

export const getTokenAddress = (
  chain: CHAINS,
  token: TOKENS,
): Address | undefined => {
  if (token === 'ETH') return '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

  return getNetworkConfigMapByChain(chain)?.contracts[
    TOKENS_TO_CONTRACTS[token]
  ];
};
