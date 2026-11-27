import { skipToken, useQueries, type QueryKey } from '@tanstack/react-query';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';

import { routeQuoteQueryOptions } from './context';
import type { FormRoute, FormRouteSpec } from './types';

type RouteQuoteEntry<S extends FormRouteSpec> = {
  route: FormRoute<S>;
  deps: S['quoteDeps'];
};

type UseRouteQuotesOptions = {
  /** typing settles first: a quote may be a contract read per amount */
  debounceMs?: number;
};

// the same route and chain, another amount: the last quote can stand in
// while the new one loads, instead of blinking empty on every keystroke
const isSameRouteKey = (a?: QueryKey, b?: QueryKey) =>
  !!a &&
  !!b &&
  a.length === b.length &&
  JSON.stringify(a.slice(0, -1), (_, value: unknown) =>
    typeof value === 'bigint' ? value.toString() : value,
  ) ===
    JSON.stringify(b.slice(0, -1), (_, value: unknown) =>
      typeof value === 'bigint' ? value.toString() : value,
    );

/**
 * Quotes of several routes for one amount, e.g. every option a picker
 * shows. Each route reads only its own quote; `quote` is undefined while
 * there is no amount or nothing loaded yet. While a new amount loads, the
 * previous quote of the same route is kept and `isUpdating` is true.
 */
export const useRouteQuotes = <S extends FormRouteSpec>(
  entries: readonly RouteQuoteEntry<S>[],
  amount: bigint | null,
  { debounceMs = 300 }: UseRouteQuotesOptions = {},
) => {
  const debounced = useDebouncedValue(amount, debounceMs);

  const results = useQueries({
    queries: entries.map(({ route, deps }) => {
      if (debounced === null || debounced <= 0n) {
        return {
          queryKey: ['form-route-quote', route.id, null],
          queryFn: skipToken,
        };
      }
      const options = routeQuoteQueryOptions(route, deps, debounced);
      return {
        ...options,
        placeholderData: (
          previous: S['quote'] | undefined,
          previousQuery?: { queryKey: QueryKey },
        ) =>
          isSameRouteKey(previousQuery?.queryKey, options.queryKey)
            ? previous
            : undefined,
      };
    }),
  });

  return entries.map(({ route }, index) => {
    const result = results[index];
    const hasAmount = amount !== null && amount > 0n;
    return {
      route,
      quote: hasAmount ? (result?.data as S['quote'] | undefined) : undefined,
      isLoading: hasAmount && !!result?.isLoading,
      /** the amount changed and its quote is not in yet */
      isUpdating:
        hasAmount && (debounced !== amount || !!result?.isPlaceholderData),
    };
  });
};
