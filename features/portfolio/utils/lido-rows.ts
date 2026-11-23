import { CHAINS } from 'consts/chains';
import { TOKENS, TOKEN_SYMBOLS, type Token } from 'consts/tokens';
import { getTokenAddress } from 'config/networks/token-address';
import { getTokenDecimals } from 'utils/token-decimals';
import type { PortfolioTokenRewards } from 'utilsApi/portfolio/types';

import type { PortfolioRow } from '../types';

export const TOKEN_NAMES: Partial<Record<Token, string>> = {
  [TOKENS.steth]: 'Lido Staked ETH',
  [TOKENS.wsteth]: 'Lido wrapped Staked ETH',
  [TOKENS.earneth]: 'Lido Earn ETH',
  [TOKENS.earnusd]: 'Lido Earn USD',
};

// lowercase, as the API gives addresses; empty when none is configured
export const getMainnetAddress = (token: Token): string =>
  getTokenAddress(CHAINS.Mainnet, token)?.toLowerCase() ?? '';

export type OnChainPosition = {
  token: Token;
  amount: bigint | undefined;
  valueUsd: number | undefined;
  apr: number | undefined;
};

// keyed by the lowercase token address
export type RewardsByAddress = Map<string, PortfolioTokenRewards>;

export const withRewards = (
  row: PortfolioRow,
  tokenRewards: PortfolioTokenRewards | undefined,
): PortfolioRow => ({
  ...row,
  rewardsUsd: tokenRewards?.rewardsUsd ?? null,
  rewardsAmount: tokenRewards?.rewardsAmount ?? null,
  rewardsSymbol: tokenRewards?.rewardsSymbol ?? null,
});

// a Lido position read from the contracts, as a table row on Ethereum
export const toOnChainRow = (
  { token, amount, valueUsd, apr }: OnChainPosition,
  rewardsByAddress: RewardsByAddress,
): PortfolioRow =>
  withRewards(
    {
      key: token,
      symbol: TOKEN_SYMBOLS[token],
      name: TOKEN_NAMES[token] ?? TOKEN_SYMBOLS[token],
      iconToken: token,
      amount: amount ?? null,
      decimals: getTokenDecimals(token),
      valueUsd: valueUsd ?? null,
      apr: apr ?? null,
      rewardsUsd: null,
      rewardsAmount: null,
      rewardsSymbol: null,
      chains: [
        {
          slug: 'ethereum',
          name: 'Ethereum',
          address: getMainnetAddress(token) || null,
          isNative: false,
          amount: amount ?? null,
          decimals: getTokenDecimals(token),
          amountFloat: null,
          valueUsd: valueUsd ?? null,
        },
      ],
    },
    rewardsByAddress.get(getMainnetAddress(token)),
  );
