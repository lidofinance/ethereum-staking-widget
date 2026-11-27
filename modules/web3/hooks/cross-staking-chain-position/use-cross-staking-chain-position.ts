import { useMemo } from 'react';

import { getSortGate, sortPositionTokens, type PositionSort } from './sort';
import type { PositionTokenList } from './token-list';
import { usePositionSource } from './use-position-source';

type UseCrossStakingChainPositionArgs = {
  sort?: PositionSort;
  tokenList?: PositionTokenList;
};

/**
 * Cross-chain ETH/WETH/stETH/wstETH position of the connected account,
 * each token valued in ETH and USD, plus totals. Covers the chains of the
 * nearest Support*Chains provider.
 *
 * `sort` is a view over the cached balances. While a held token is missing
 * its sort value, `data` waits for the converter behind it, and the position
 * errors if that converter failed. Zero balances never need a rate, so a
 * converter used only by them is skipped. Values the sort does not read
 * stay best-effort: undefined until (or unless) their converter delivers.
 *
 * `tokenList` narrows the position to a token group (see token-list.ts);
 * totals and the sort gate cover only those. Every list shares one
 * balances query.
 */
export const useCrossStakingChainPosition = ({
  sort = 'non-zero',
  tokenList = 'all',
}: UseCrossStakingChainPositionArgs = {}) => {
  const { position, status, balances } = usePositionSource({ tokenList });

  const gate = useMemo(
    () =>
      position
        ? getSortGate(position.tokens, sort, status)
        : { isLoading: false, error: null },
    [position, sort, status],
  );
  const isGated = gate.isLoading || !!gate.error;

  const data = useMemo(
    () =>
      position && !isGated
        ? {
            ...position,
            tokens: sortPositionTokens(position.tokens, sort),
          }
        : undefined,
    [position, isGated, sort],
  );

  const error = balances.error ?? gate.error;

  return {
    data,
    isLoading: balances.isLoading || gate.isLoading,
    isFetching: balances.isFetching,
    isError: !!error,
    error,
    refetchPosition: balances.refetchPosition,
  };
};
