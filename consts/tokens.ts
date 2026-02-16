import { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';

export type LIDO_TOKENS_KEYS = keyof typeof LIDO_TOKENS;
export type LIDO_TOKENS_VALUES = (typeof LIDO_TOKENS)[keyof typeof LIDO_TOKENS];

// A list of all tokens used in the app
export const TOKENS = [
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

export type Token = (typeof TOKENS)[number];

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
  weth: 'WETH',
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
