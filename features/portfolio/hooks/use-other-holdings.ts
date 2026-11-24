import { useMemo } from 'react';
import type { Address } from 'viem';

import { TOKENS, type Token } from 'consts/tokens';
import { useLidoApr } from 'shared/hooks/useLidoApr';
import { useEthVaultApy } from 'features/earn/vault-eth/hooks/use-vault-apy';
import { useUsdVaultApy } from 'features/earn/vault-usd/hooks/use-vault-apy';

import {
  isLidoApiToken,
  isLimitError,
  mergeRows,
  sortByValue,
  toAprRange,
  tokenToRow,
} from '../utils';
import { useMainnetMainTokens } from './use-mainnet-main-tokens';
import { usePortfolioPositions } from './use-portfolio-positions';

const ETH_LIKE_TOKENS: Token[] = [TOKENS.eth, TOKENS.weth];
const STABLECOIN_TOKENS: Token[] = [TOKENS.usdc, TOKENS.usdt, TOKENS.usde];

// what stake/Earn ETH and Earn USD pay on the asset; none for the rest
const usePotentialAprs = () => {
  const { apr: lidoApr } = useLidoApr();
  const { apy: earnEthApy } = useEthVaultApy();
  const { apy: earnUsdApy } = useUsdVaultApy();

  return useMemo(
    () => ({
      eth: toAprRange([lidoApr ? Number(lidoApr) : undefined, earnEthApy]),
      stable: toAprRange([earnUsdApy]),
    }),
    [lidoApr, earnEthApy, earnUsdApy],
  );
};

export const useOtherHoldings = (address?: Address) => {
  const positionsQuery = usePortfolioPositions(address);
  const potentialAprs = usePotentialAprs();
  // no answer and no snapshot: the main tokens are read on-chain instead
  // the error count outlives a retry, so the rows do not blink while it runs
  const isFallback =
    !positionsQuery.data && positionsQuery.errorUpdateCount > 0;
  const mainTokens = useMainnetMainTokens(address, isFallback);

  const rows = useMemo(() => {
    const tokens = isFallback
      ? mainTokens.tokens
      : (positionsQuery.data?.tokens ?? []);
    const mergedRows = mergeRows(
      tokens.filter((token) => !isLidoApiToken(token)).map(tokenToRow),
    );
    return sortByValue(
      mergedRows.map((row) => {
        if (row.iconToken && ETH_LIKE_TOKENS.includes(row.iconToken))
          return { ...row, potentialApr: potentialAprs.eth };
        if (row.iconToken && STABLECOIN_TOKENS.includes(row.iconToken))
          return { ...row, potentialApr: potentialAprs.stable };
        return row;
      }),
    );
  }, [positionsQuery.data, isFallback, mainTokens.tokens, potentialAprs]);

  return {
    rows,
    isLoading: isFallback ? mainTokens.isLoading : positionsQuery.isLoading,
    isError: positionsQuery.isError || isFallback,
    // the fallback found nothing to show
    isFallbackEmpty: isFallback && rows.length === 0,
    // the request limit of this client, not an outage
    isLimited: isLimitError(positionsQuery.error),
    isFallback,
    // an older answer is shown while the live one is unavailable
    isStale: !!positionsQuery.data?.stale,
    dataIncomplete: positionsQuery.data?.dataIncomplete ?? false,
    updatedAt: positionsQuery.data?.updatedAt,
  };
};
