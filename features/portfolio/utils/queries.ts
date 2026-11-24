import { PORTFOLIO_QUERY_SCOPE } from '../consts';

const REFRESH_QUERIES = new Set<unknown>(['positions', 'rewards']);

// the slow API reads the Refresh button spins for; not chain polling or history
export const isRefreshQuery = ({
  queryKey,
}: {
  queryKey: readonly unknown[];
}): boolean =>
  queryKey[0] === PORTFOLIO_QUERY_SCOPE && REFRESH_QUERIES.has(queryKey[1]);
