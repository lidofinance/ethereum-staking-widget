import { ethAddress, getAddress, type Address } from 'viem';

import { CONTRACT_NAMES, getNetworkConfigMapByChain } from './networks-map';
import { Token, TOKENS, type TokenSymbol } from 'consts/tokens';
import { asToken } from 'utils/as-token';
import { isSupportedL2Chain } from 'consts/chains';

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
  [TOKENS.usde]: CONTRACT_NAMES.usde,
  [TOKENS.gg]: CONTRACT_NAMES.ggvVault,
  [TOKENS.dvsteth]: CONTRACT_NAMES.dvvVault,
  [TOKENS.streth]: CONTRACT_NAMES.stgShareManagerSTRETH,
  [TOKENS.earneth]: CONTRACT_NAMES.ethShareManagerEARNETH,
  [TOKENS.earnusd]: CONTRACT_NAMES.usdShareManagerEARNUSD,
} as const;

export const getTokenAddress = (
  chain: number,
  _token: TokenSymbol | Token,
): Address | undefined => {
  const token = asToken(_token);
  // 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
  if (token === TOKENS.eth) return getAddress(ethAddress);

  let contractKey = TOKENS_TO_CONTRACTS[token];

  if (isSupportedL2Chain(chain)) {
    if (token === TOKENS.wsteth) {
      contractKey = CONTRACT_NAMES.L2wstETH;
    }
    if (token === TOKENS.steth) {
      contractKey = CONTRACT_NAMES.L2stETH;
    }
  }

  return contractKey
    ? getNetworkConfigMapByChain(chain)?.contracts[contractKey]
    : undefined;
};
