import { API_ROUTES, getApiPath } from 'consts/api';
import { standardFetcher } from 'utils/standardFetcher';
import type {
  PortfolioPositionsResponse,
  PortfolioRewardsResponse,
  PortfolioTransactionsResponse,
} from 'utilsApi/portfolio/types';

const buildAddressUrl = (
  route: API_ROUTES,
  address: string,
  extraParams: Record<string, string> = {},
) => `${getApiPath(route)}?${new URLSearchParams({ address, ...extraParams })}`;

export const fetchPortfolioPositions = (address: string) =>
  standardFetcher<PortfolioPositionsResponse>(
    buildAddressUrl(API_ROUTES.PORTFOLIO_POSITIONS, address),
  );

export const fetchPortfolioRewards = (address: string) =>
  standardFetcher<PortfolioRewardsResponse>(
    buildAddressUrl(API_ROUTES.PORTFOLIO_REWARDS, address),
  );

export const fetchPortfolioTransactions = (
  address: string,
  cursor: string | null,
) =>
  standardFetcher<PortfolioTransactionsResponse>(
    buildAddressUrl(
      API_ROUTES.PORTFOLIO_TRANSACTIONS,
      address,
      cursor ? { cursor } : {},
    ),
  );
