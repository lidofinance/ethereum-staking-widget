import { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';

// TOKENS_TO_WITHDRAWABLE
export const TOKENS_WITHDRAWABLE = {
  [LIDO_TOKENS.steth]: LIDO_TOKENS.steth,
  [LIDO_TOKENS.wsteth]: LIDO_TOKENS.wsteth,
} as const;

// TokensWithdrawable
export type TOKENS_WITHDRAWABLE = keyof typeof TOKENS_WITHDRAWABLE;
