import { TOKEN_SYMBOLS, TOKENS } from 'consts/tokens';

/** a token id (as in TOKENS) on a chain: the unit every cross-chain form picks */
export type TokenOnChain = { token: string; chainId: number };

export const isSameTokenOnChain = (a: TokenOnChain, b: TokenOnChain) =>
  a.token === b.token && a.chainId === b.chainId;

/**
 * `value` itself (same object) when `list` has it, otherwise the first of
 * `list`; an empty list has nothing better, so `value` stays. The identity
 * lets callers skip a no-op update with a plain `!==`.
 */
export const keepOrFirst = <T extends TokenOnChain>(
  value: T,
  list: readonly T[],
): T =>
  list.some((item) => isSameTokenOnChain(item, value))
    ? value
    : (list[0] ?? value);

/** display symbol of a token id, e.g. 'steth' -> 'stETH' */
export const tokenSymbol = (token: string) =>
  TOKEN_SYMBOLS[token as keyof typeof TOKEN_SYMBOLS] ?? token;

/** ETH and WETH: both spend 1:1 as ETH */
export const isEthLike = (token: string) =>
  token === TOKENS.eth || token === TOKENS.weth;

/** a type guard for one of `list`, e.g. the tokens a form accepts */
export const isOneOf =
  <T extends string>(list: readonly T[]) =>
  (value: string): value is T =>
    (list as readonly string[]).includes(value);
