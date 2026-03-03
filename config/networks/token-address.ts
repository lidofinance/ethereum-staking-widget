import type { Address } from 'viem';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

import { CONTRACT_NAMES, getNetworkConfigMapByChain } from './networks-map';
import { Token, TOKENS, type TokenSymbol } from 'consts/tokens';
import { asToken } from 'utils/as-token';

const TOKENS_TO_CONTRACTS: Record<
  Token,
  keyof typeof CONTRACT_NAMES | undefined
> = {
  [TOKENS.eth]: undefined, // ETH does not have a contract address
  [TOKENS.wsteth]: CONTRACT_NAMES.wsteth,
  [TOKENS.steth]: CONTRACT_NAMES.lido,
  [TOKENS.unsteth]: CONTRACT_NAMES.withdrawalQueue,
  [TOKENS.weth]: CONTRACT_NAMES.weth,
  [TOKENS.usdc]: CONTRACT_NAMES.usdc,
  [TOKENS.usdt]: CONTRACT_NAMES.usdt,
  [TOKENS.gg]: CONTRACT_NAMES.ggvVault,
  [TOKENS.dvsteth]: CONTRACT_NAMES.dvvVault,
  [TOKENS.streth]: CONTRACT_NAMES.stgShareManagerSTRETH,
  [TOKENS.earneth]: CONTRACT_NAMES.ethShareManagerEARNETH,
  [TOKENS.earnusd]: CONTRACT_NAMES.usdShareManagerEARNUSD,
} as const;

export const getTokenAddress = (
  chain: CHAINS,
  _token: TokenSymbol | Token,
): Address | undefined => {
  const token = asToken(_token);

  if (token === TOKENS.eth) return '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

  return TOKENS_TO_CONTRACTS[token]
    ? getNetworkConfigMapByChain(chain)?.contracts[TOKENS_TO_CONTRACTS[token]]
    : undefined;
};
