import { useMemo } from 'react';

import {
  filterPositionByTokenList,
  type PositionTokenList,
} from './token-list';
import { useCrossChainBalances } from './use-cross-chain-balances';
import { usePositionChainIds } from './use-position-chain-ids';
import { usePositionConverters } from './use-position-converters';

type UsePositionSourceArgs = {
  tokenList: PositionTokenList;
};

/**
 * The ungated position of `tokenList` on the provider's chains, with the
 * converter statuses, so each consumer decides what to wait on.
 * Price queries run once here and feed the balance query's converters.
 */
export const usePositionSource = ({ tokenList }: UsePositionSourceArgs) => {
  const chainIds = usePositionChainIds();
  const { toEth, ethToUsd, status } = usePositionConverters();
  const balances = useCrossChainBalances({ toEth, ethToUsd, chainIds });

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

  return { chainIds, position, status, balances };
};
