import { useMemo } from 'react';

import { getSortGate, sortPositionTokens, type PositionSort } from './sort';
import {
  filterPositionByTokenList,
  type PositionTokenList,
} from './token-list';
import { useCrossChainBalances } from './use-cross-chain-balances';
import { usePositionConverters } from './use-position-converters';

type UseCrossStakingChainPositionArgs = {
  sort?: PositionSort;
  tokenList?: PositionTokenList;
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
 *
 * `tokenList` narrows the position to stakable (ETH, WETH) or staked
 * (stETH, wstETH) tokens; totals and the sort gate cover only those.
 * Every list shares one balances query.
 */
export const useCrossStakingChainPosition = ({
  sort = 'non-zero',
  tokenList = 'all',
}: UseCrossStakingChainPositionArgs = {}) => {
  const { toEth, ethToUsd, status } = usePositionConverters();
  const balances = useCrossChainBalances({ toEth, ethToUsd });

  const position = useMemo(
    () =>
      balances.data
        ? filterPositionByTokenList({
            position: balances.data,
            tokenList,
            ethToUsd,
          })
        : undefined,
    [balances.data, tokenList, ethToUsd],
  );

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
