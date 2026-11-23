import { useQuery } from '@tanstack/react-query';

import { config } from 'config';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';

import { PORTFOLIO_QUERY_SCOPE } from '../consts';
import { fetchPortfolioRewards } from '../fetchers';
import { withBrowserSnapshot } from '../utils';

export const usePortfolioRewards = (address?: string) =>
  useQuery({
    queryKey: [PORTFOLIO_QUERY_SCOPE, 'rewards', { address }] as const,
    // IPFS builds have no /api routes
    enabled: !config.ipfsMode && !!address,
    ...STRATEGY_CONSTANT,
    // the server keeps rewards for hours; a poll would only cost upstream calls
    refetchInterval: false,
    retry: 1,
    queryFn: () =>
      withBrowserSnapshot('rewards', address as string, () =>
        fetchPortfolioRewards(address as string),
      ),
  });
