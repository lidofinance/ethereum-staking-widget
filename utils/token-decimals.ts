import { Token } from 'consts/tokens';

const TOKEN_DECIMALS: { [key in Token]?: number } = {
  // Stablecoin tokens (6 decimals)
  usdc: 6,
  usdt: 6,
};

export const getTokenDecimals = (token: string): number => {
  return TOKEN_DECIMALS[token.toLowerCase() as Token] ?? 18; // Default to 18 decimals for tokens not listed
};
