import { TOKENS } from '@lido-sdk/constants';

export const ETH = 'ETH';
export const TOKENS_TO_WRAP = {
  ETH,
  [TOKENS.STETH]: TOKENS.STETH,
  // L2
  [TOKENS.WSTETH]: TOKENS.WSTETH,
} as const;

export type TokensWrappable = keyof typeof TOKENS_TO_WRAP;
