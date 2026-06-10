import type { Token } from 'consts/tokens';
import {
  USDC_DECIMALS,
  USDE_DECIMALS,
  USDT_DECIMALS,
} from 'features/earn/vault-usd/consts';

const TOKEN_DECIMALS: Partial<Record<Token, number>> = {
  usdc: USDC_DECIMALS,
  usdt: USDT_DECIMALS,
  usde: USDE_DECIMALS,
};

// Default to 18 decimals for tokens not listed in TOKEN_DECIMALS
const DEFAULT_DECIMALS = 18;

export const getTokenDecimals = (token?: string): number =>
  TOKEN_DECIMALS[token?.toLowerCase() as Token] ?? DEFAULT_DECIMALS;
