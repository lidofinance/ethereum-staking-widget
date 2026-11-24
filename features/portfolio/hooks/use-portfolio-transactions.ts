import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { config } from 'config';
import type { PortfolioTransactionsResponse } from 'utilsApi/portfolio/types';

import { PORTFOLIO_QUERY_SCOPE } from '../consts';
import { fetchPortfolioTransactions } from '../fetchers';
import { isLimitError, withBrowserSnapshot } from '../utils';

// pages of history, loaded on demand: the first one may take 5-20 s
export const usePortfolioTransactions = (address?: string, enabled = true) => {
  const transactionsQuery = useInfiniteQuery({
    queryKey: [PORTFOLIO_QUERY_SCOPE, 'transactions', { address }] as const,
    // IPFS builds have no /api routes
    enabled: enabled && !config.ipfsMode && !!address,
    // never refetched on its own: that would re-buy every loaded portion
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: PortfolioTransactionsResponse) =>
      lastPage.nextCursor ?? undefined,
    queryFn: ({ pageParam }) => {
      const loadPage = () =>
        fetchPortfolioTransactions(address as string, pageParam);
      // only the first page is kept in the browser
      return pageParam === null
        ? withBrowserSnapshot('transactions', address as string, loadPage)
        : loadPage();
    },
  });

  const transactions = useMemo(
    () =>
      transactionsQuery.data?.pages.flatMap((page) => page.transactions) ?? [],
    [transactionsQuery.data],
  );

  const firstPage = transactionsQuery.data?.pages[0];

  return {
    transactions,
    // false until a view asks for the history
    isLoaded: transactionsQuery.data !== undefined,
    isLoading: transactionsQuery.isLoading,
    isError: transactionsQuery.isError,
    // the request limit of this client, not an outage
    isLimited: isLimitError(transactionsQuery.error),
    // an older answer is shown while the live one is unavailable
    isStale: !!firstPage?.stale,
    updatedAt: firstPage?.updatedAt,
    hasNextPage: transactionsQuery.hasNextPage,
    isFetchingNextPage: transactionsQuery.isFetchingNextPage,
    // the first portion is being read again, e.g. after Refresh
    isRefetching:
      transactionsQuery.isFetching && !transactionsQuery.isFetchingNextPage,
    fetchNextPage: transactionsQuery.fetchNextPage,
  };
};
