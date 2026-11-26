import type { TokenListItem } from 'modules/web3';

export type TokenSelectorValue = Pick<TokenListItem, 'token' | 'chainId'>;

export const isSameToken = (a: TokenSelectorValue, b: TokenSelectorValue) =>
  a.token === b.token && a.chainId === b.chainId;
