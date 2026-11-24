import type { Token } from 'consts/tokens';
import type { PortfolioActivityType } from 'utilsApi/portfolio/types';

// one token on one chain, shown in the token drawer
export type PortfolioChainAmount = {
  // Lambda chain slug, e.g. ethereum, base
  slug: string;
  name: string;
  // lowercase token contract; null for native coins and tokenless positions
  address: string | null;
  // the chain's own coin, e.g. ETH
  isNative: boolean;
  amount: bigint | null;
  decimals: number;
  // fallback when the raw amount is unknown
  amountFloat: number | null;
  valueUsd: number | null;
};

export type PortfolioAprRange = { min: number; max: number };

export type PortfolioRow = {
  key: string;
  symbol: string;
  name: string;
  // known token for a local icon; others get a letter avatar
  iconToken?: Token;
  amount: bigint | null;
  decimals: number;
  valueUsd: number | null;
  // percent units, e.g. 2.4
  apr: number | null;
  rewardsUsd: number | null;
  rewardsAmount: number | null;
  rewardsSymbol: string | null;
  chains: PortfolioChainAmount[];
  // a row with no token of its own: its activity is found by operation type
  activityTypes?: PortfolioActivityType[];
  // what Lido products could earn on this asset, percent units
  potentialApr?: PortfolioAprRange | null;
};

export type PortfolioSummary = {
  netWorthUsd: number;
  lidoUsd: number;
  otherUsd: number;
  rewardsUsd: number | null;
  lidoShare: number;
  otherShare: number;
};
