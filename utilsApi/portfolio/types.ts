// Wire format of /api/portfolio/*; imported by the client as types only

export type PortfolioToken = {
  id: string;
  chainId: number | null;
  chainSlug: string;
  chainName: string;
  // lowercase; null for native coins and multi-token positions
  address: string | null;
  // a chain's own coin, e.g. ETH on Ethereum or Base
  isNative: boolean;
  symbol: string;
  name: string;
  decimals: number | null;
  // raw units, no decimals; empty for multi-token positions
  amountRaw: string;
  amount: number;
  priceUsd: number | null;
  valueUsd: number | null;
  isLido: boolean;
  // a row with no token of its own: its activity is found by operation type
  activityTypes?: PortfolioActivityType[];
};

export type PortfolioPositionsResponse = {
  tokens: PortfolioToken[];
  dataIncomplete: boolean;
  updatedAt: number;
  // an older answer served while the upstream is unavailable
  stale?: true;
};

export type PortfolioTokenRewards = {
  // lowercase token address on Ethereum
  address: string;
  rewardsUsd: number;
  // in the reward token; null when rewards come in several tokens
  rewardsAmount: number | null;
  rewardsSymbol: string | null;
};

export type PortfolioRewardsResponse = {
  rewards: PortfolioTokenRewards[];
  updatedAt: number;
  // an older answer served while the upstream is unavailable
  stale?: true;
};

export type PortfolioActivityType =
  | 'stake'
  | 'wrap'
  | 'unwrap'
  | 'swap'
  | 'send'
  | 'receive'
  | 'deposit'
  | 'withdraw'
  | 'withdrawalRequest'
  | 'withdrawalClaim'
  | 'mint'
  | 'burn';

export type PortfolioTransfer = {
  direction: 'in' | 'out';
  symbol: string;
  name: string;
  // lowercase; null for native coins
  tokenAddress: string | null;
  amount: number;
  valueUsd: number | null;
};

export type PortfolioTransaction = {
  id: string;
  hash: string;
  type: PortfolioActivityType;
  // milliseconds
  timestamp: number | null;
  chainId: number | null;
  chainSlug: string;
  chainName: string;
  // DeFi app the transaction went through, as named by the API
  product: string | null;
  // lowercase; the other side of the first transfer
  counterparty: string | null;
  transfers: PortfolioTransfer[];
};

export type PortfolioTransactionsResponse = {
  transactions: PortfolioTransaction[];
  nextCursor: string | null;
  updatedAt: number;
  // an older answer served while the upstream is unavailable
  stale?: true;
};
