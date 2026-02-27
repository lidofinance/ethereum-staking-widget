import type { Token } from 'consts/tokens';

const TOKEN_DECIMALS: Partial<Record<Token, number>> = {
  // Stablecoin tokens (6 decimals)
  usdc: 6,
  usdt: 6,
};

// Default to 18 decimals for tokens not listed in TOKEN_DECIMALS
const DEFAULT_DECIMALS = 18;

export const getTokenDecimals = (token?: string): number =>
  TOKEN_DECIMALS[token?.toLowerCase() as Token] ?? DEFAULT_DECIMALS;
