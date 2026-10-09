import { TOKEN_SYMBOLS } from 'consts/tokens';

export const TOKENS_TO_STAKE = {
  [TOKEN_SYMBOLS.eth]: TOKEN_SYMBOLS.eth,
  [TOKEN_SYMBOLS.weth]: TOKEN_SYMBOLS.weth,
} as const;

export type TOKENS_TO_STAKE = keyof typeof TOKENS_TO_STAKE;
