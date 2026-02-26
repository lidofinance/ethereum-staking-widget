import invariant from 'tiny-invariant';
import type { Token } from 'consts/tokens';

const TOKEN_DECIMALS: { [key in Token]?: number } = {
  // Stablecoin tokens (6 decimals)
  usdc: 6,
  usdt: 6,
};

export const getTokenDecimals = (token: string): number => {
  invariant(token, 'Token is required to get decimals');
  return TOKEN_DECIMALS[token.toLowerCase() as Token] ?? 18; // Default to 18 decimals for tokens not listed
};
