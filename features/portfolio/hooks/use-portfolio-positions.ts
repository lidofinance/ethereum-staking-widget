import { useQuery } from '@tanstack/react-query';

import { config } from 'config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';

import { PORTFOLIO_QUERY_SCOPE } from '../consts';
import { fetchPortfolioPositions } from '../fetchers';
import { withBrowserSnapshot } from '../utils';

const RECOVERY_INTERVAL_MS = 5 * 60 * 1000;

export const usePortfolioPositions = (address?: string) =>
  useQuery({
    queryKey: [PORTFOLIO_QUERY_SCOPE, 'positions', { address }] as const,
    // IPFS builds have no /api routes
    enabled: !config.ipfsMode && !!address,
    ...STRATEGY_LAZY,
    // a refetch may be an upstream call, so only an outage is polled
    refetchInterval: ({ state }) =>
      state.data?.stale || state.status === 'error'
        ? RECOVERY_INTERVAL_MS
        : false,
    retry: 1,
    queryFn: () =>
      withBrowserSnapshot('positions', address as string, () =>
        fetchPortfolioPositions(address as string),
      ),
  });
