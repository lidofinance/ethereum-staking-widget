import { useMemo } from 'react';

import { POSITION_TOKEN_DECIMALS } from './conversion';
import { getSortGate, sortTokenList } from './sort';
import {
  getPositionSlots,
  isInTokenList,
  type PositionSlot,
  type PositionTokenList,
} from './token-list';
import { usePositionSource } from './use-position-source';

export type TokenListItem = PositionSlot & {
  // set once the connected account's position has loaded
  balance?: bigint;
  decimals?: number;
  usdValue?: number;
};

type UseTokenListArgs = {
  tokenList?: PositionTokenList;
  /** only the tokens on this chain; every provider chain when omitted */
  chainId?: number;
};

/**
 * Tokens of `tokenList` on the chains of the nearest Support*Chains
 * provider, or only on `chainId` when given. The list itself needs no reads, so it is always there: chain
 * order, then ETH -> WETH -> stETH -> wstETH.
 *
 * With a connected wallet each token also gets its balance, decimals and
 * USD value once the position loads (`isLoading` until then, USD price
 * included, so the order does not jump), and the list is re-sorted: held
 * tokens by chain then USD value, then empty ones by chain. A failed price
 * leaves `usdValue` undefined and the default order; a token whose balance
 * read failed stays, without a balance.
 */
export const useTokenList = ({
  tokenList = 'all',
  chainId,
}: UseTokenListArgs = {}) => {
  const { chainIds, position, status, balances } = usePositionSource({
    tokenList,
  });

  // waits on the USD price while it loads, never fails on it
  const usdGate = useMemo(
    () =>
      position
        ? getSortGate(position.tokens, 'usd', status)
        : { isLoading: false, error: null },
    [position, status],
  );
  const isLoading = balances.isLoading || usdGate.isLoading;

  const slots = useMemo(
    () =>
      getPositionSlots(chainIds).filter(
        (slot) =>
          isInTokenList(tokenList, slot) &&
          (chainId === undefined || slot.chainId === chainId),
      ),
    [chainIds, tokenList, chainId],
  );

  const tokens = useMemo((): TokenListItem[] => {
    if (!position || usdGate.isLoading) return slots;

    const items = slots.map((slot): TokenListItem => {
      const held = position.tokens.find(
        ({ token, chainId }) =>
          token === slot.token && chainId === slot.chainId,
      );
      return held
        ? {
            ...slot,
            balance: held.balance,
            decimals: POSITION_TOKEN_DECIMALS,
            usdValue: held.usdValue,
          }
        : slot;
    });
    // no USD price to sort by: keep the default order
    return usdGate.error ? items : sortTokenList(items, chainIds);
  }, [slots, position, usdGate, chainIds]);

  return { tokens, isLoading };
};
