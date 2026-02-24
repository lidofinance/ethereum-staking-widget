import { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';

export type LIDO_TOKENS_KEYS = keyof typeof LIDO_TOKENS;
export type LIDO_TOKENS_VALUES = (typeof LIDO_TOKENS)[keyof typeof LIDO_TOKENS];

// A list of all tokens used in the app
export const TOKENS_LIST = [
  // Lido tokens
  'eth',
  'steth',
  'wsteth',
  'unsteth',
  // Earn tokens
  'gg',
  'dvsteth',
  'streth',
  'earneth',
  'earnusd',
  // 3rd party tokens
  'weth',
  'usdc',
  'usdt',
] as const;

export type Token = (typeof TOKENS_LIST)[number];

// A record of tokens, where the key is the token in lowercase and the value is also the token in lowercase
export const TOKENS = TOKENS_LIST.reduce(
  (acc, token) => {
    const t = token.toLowerCase() as Lowercase<Token>;
    acc[t] = t;
    return acc;
  },
  {} as Record<Token, Lowercase<Token>>,
);

// `satisfies` keyword is not supported by Next.js SWC compiler, so we use a helper function
// to validate the type while preserving literal type inference from `as const`
const asTokenSymbols = <T extends Record<Token, string>>(symbols: T): T =>
  symbols;

// Token symbol defines the display name for the token, which will be used in the UI
export const TOKEN_SYMBOLS = asTokenSymbols({
  eth: LIDO_TOKENS.eth,
  steth: LIDO_TOKENS.steth,
  wsteth: LIDO_TOKENS.wsteth,
  unsteth: LIDO_TOKENS.unsteth,
  weth: 'wETH',
  gg: 'GG',
  dvsteth: 'DVstETH',
  streth: 'strETH',
  earneth: 'earnETH',
  earnusd: 'earnUSD',
  usdc: 'USDC',
  usdt: 'USDT',
} as const);

export type TokenSymbols = typeof TOKEN_SYMBOLS;
export type TokenSymbol = (typeof TOKEN_SYMBOLS)[Token];
