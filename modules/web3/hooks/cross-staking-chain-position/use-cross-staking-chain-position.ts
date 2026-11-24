import { useMemo } from 'react';

import { getSortGate, sortPositionTokens, type PositionSort } from './sort';
import { useCrossChainBalances } from './use-cross-chain-balances';
import { usePositionConverters } from './use-position-converters';

type UseCrossStakingChainPositionArgs = {
  sort?: PositionSort;
};

/**
 * Cross-chain ETH/WETH/stETH/wstETH position of the connected account,
 * each token valued in ETH and USD, plus totals.
 * Price queries run once here and feed the balance query's converters.
 *
 * `sort` is a view over the cached balances. While a held token is missing
 * its sort value, `data` waits for the converter behind it, and the position
 * errors if that converter failed. Zero balances never need a rate, so a
 * converter used only by them is skipped. Values the sort does not read
 * stay best-effort: undefined until (or unless) their converter delivers.
 */
export const useCrossStakingChainPosition = ({
  sort = 'non-zero',
}: UseCrossStakingChainPositionArgs = {}) => {
  const { toEth, ethToUsd, status } = usePositionConverters();
  const balances = useCrossChainBalances({ toEth, ethToUsd });

  const gate = useMemo(
    () =>
      balances.data
        ? getSortGate(balances.data.tokens, sort, status)
        : { isLoading: false, error: null },
    [balances.data, sort, status],
  );
  const isGated = gate.isLoading || !!gate.error;

  const data = useMemo(
    () =>
      balances.data && !isGated
        ? {
            ...balances.data,
            tokens: sortPositionTokens(balances.data.tokens, sort),
          }
        : undefined,
    [balances.data, isGated, sort],
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
