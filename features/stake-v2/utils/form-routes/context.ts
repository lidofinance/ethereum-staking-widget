import type { QueryClient } from '@tanstack/react-query';

import { config } from 'config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';

import type { FormRoute, FormRouteSpec } from './types';

// fresh enough to validate every keystroke from cache; polled while shown
const ROUTE_CONTEXT_STALE_TIME = config.PROVIDER_POLLING_INTERVAL;
const ROUTE_CONTEXT_REFETCH_INTERVAL = config.PROVIDER_POLLING_INTERVAL * 2;

/** query options of a route's context, shared by useQuery and query() */
export const routeContextQueryOptions = <S extends FormRouteSpec, TContext>(
  route: FormRoute<S, TContext>,
  deps: S['deps'],
) => ({
  ...route.contextQuery(deps),
  staleTime: ROUTE_CONTEXT_STALE_TIME,
  refetchInterval: ROUTE_CONTEXT_REFETCH_INTERVAL,
});

/** query options of a route's quote for `amount`; rates move slowly */
export const routeQuoteQueryOptions = <S extends FormRouteSpec>(
  route: FormRoute<S>,
  deps: S['quoteDeps'],
  amount: bigint,
) => ({
  ...route.quoteQuery(deps, amount),
  ...STRATEGY_LAZY,
});

export type RouteRequester<S extends FormRouteSpec> = {
  /**
   * The context of `route` for `pair`: from cache while fresh, otherwise
   * read now. Only the asked route is read. Rejects when the read fails
   * or the deps cannot be built.
   */
  request<TContext>(
    route: FormRoute<S, TContext>,
    pair: S['pair'],
  ): Promise<TContext>;
  /**
   * The quote of `route` for exactly `amount`: what the UI shows (cached,
   * even if stale), or, with `fresh`, a new read that also updates the UI.
   */
  requestQuote(
    route: FormRoute<S>,
    pair: S['pair'],
    amount: bigint,
    options?: { fresh?: boolean },
  ): Promise<S['quote']>;
};

type CreateRouteRequesterArgs<S extends FormRouteSpec> = {
  queryClient: QueryClient;
  /** adds the environment (account...) to the pair; throws without it */
  getDeps: (pair: S['pair']) => S['deps'];
  /** adds the public environment to the pair */
  getQuoteDeps: (pair: S['pair']) => S['quoteDeps'];
};

/** the async data a resolver and submit await, route by route */
export const createRouteRequester = <S extends FormRouteSpec>({
  queryClient,
  getDeps,
  getQuoteDeps,
}: CreateRouteRequesterArgs<S>): RouteRequester<S> => ({
  request: async (route, pair) =>
    queryClient.query(routeContextQueryOptions(route, getDeps(pair))),
  requestQuote: async (route, pair, amount, { fresh = false } = {}) =>
    queryClient.query({
      ...routeQuoteQueryOptions(route, getQuoteDeps(pair), amount),
      // cached: the quote the user saw; fresh: re-read now
      staleTime: fresh ? 0 : 'static',
    }),
});
