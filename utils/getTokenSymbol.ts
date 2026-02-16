import { TOKEN_SYMBOLS } from 'consts/tokens';

export const getTokenSymbol = (token: string) =>
  TOKEN_SYMBOLS[token.toLowerCase() as keyof typeof TOKEN_SYMBOLS] ?? token;
