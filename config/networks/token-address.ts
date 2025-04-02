import type { Address } from 'viem';
import { LIDO_TOKENS, CHAINS } from '@lidofinance/lido-ethereum-sdk';

import { CONTRACT_NAMES, getNetworkConfigMapByChain } from './networks-map';

export type TOKENS =
  | Exclude<(typeof LIDO_TOKENS)[keyof typeof LIDO_TOKENS], 'unstETH'>
  | 'LDO';

export const getTokenAddress = (
  chain: CHAINS,
  token: TOKENS,
): Address | undefined => {
  if (token === 'ETH') return '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

  return getNetworkConfigMapByChain(chain)?.contracts?.[
    String(token).toLocaleLowerCase() as CONTRACT_NAMES
  ];
};
