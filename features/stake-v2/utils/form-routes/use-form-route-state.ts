import { useMemo } from 'react';

import type { FormRouting } from './routing';
import type { FormRouteSpec } from './types';
import { useRouteContext } from './use-route-context';
import { useRouteQuotes } from './use-route-quotes';

type UseFormRouteStateArgs<S extends FormRouteSpec> = {
  routing: FormRouting<S>;
  /** the picked pair; keep it memoized */
  pair: S['pair'];
  amount: bigint | null;
};

/**
 * What the form shows about its current values: the route, its context
 * (max amount), and the quote for the entered amount.
 */
export const useFormRouteState = <S extends FormRouteSpec>({
  routing,
  pair,
  amount,
}: UseFormRouteStateArgs<S>) => {
  const route = useMemo(() => routing.resolve(pair), [routing, pair]);
  const { context, maxAmount } = useRouteContext<S>(
    route,
    routing.getDeps(pair),
  );
  const [selected] = useRouteQuotes<S>(
    route ? [{ route, deps: routing.getQuoteDeps(pair) }] : [],
    amount,
  );

  const isContextLoading = context.isLoading;
  const quote = selected?.quote;
  const isQuoteUpdating = !!selected?.isUpdating;

  return useMemo(
    () => ({
      routing,
      route,
      isContextLoading,
      maxAmount,
      quote,
      isQuoteUpdating,
    }),
    [routing, route, isContextLoading, maxAmount, quote, isQuoteUpdating],
  );
};

export type FormRouteState<S extends FormRouteSpec> = ReturnType<
  typeof useFormRouteState<S>
>;
