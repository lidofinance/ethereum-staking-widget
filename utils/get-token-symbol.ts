import { type Token, type TokenSymbol, TOKEN_SYMBOLS } from 'consts/tokens';
import { asToken } from './as-token';

export type { TokenSymbol } from 'consts/tokens';

export const getTokenSymbol = (token: Token | TokenSymbol) =>
  TOKEN_SYMBOLS[asToken(token)] ?? token;
