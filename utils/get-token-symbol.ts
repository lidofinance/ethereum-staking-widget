import { type Token, TOKEN_SYMBOLS } from 'consts/tokens';
import { asToken } from './as-token';

// TODO: consider replacing with direct TOKEN_SYMBOLS[token] usage and remove this helper,
// as it may cause confusion about when to use the helper vs direct access to TOKEN_SYMBOLS.
export const getTokenSymbol = (token: Token) =>
  TOKEN_SYMBOLS[asToken(token)] ?? token;
