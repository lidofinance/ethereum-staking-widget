import { skipToken, useQuery } from '@tanstack/react-query';

import { routeContextQueryOptions } from './context';
import type { FormRoute, FormRouteSpec } from './types';

/**
 * A route's context for the UI, and its max amount. Reads nothing while
 * there is no route or no deps (e.g. no account).
 */
export const useRouteContext = <S extends FormRouteSpec>(
  route: FormRoute<S> | null,
  deps: (S['deps'] & S['pair']) | null,
) => {
  const options = route && deps ? routeContextQueryOptions(route, deps) : null;
  const context = useQuery({
    ...options,
    queryKey: options?.queryKey ?? ['form-route-context', null],
    queryFn: options?.queryFn ?? skipToken,
  });

  const maxAmount =
    route && deps && context.data !== undefined
      ? route.getMaxAmount(context.data, deps)
      : undefined;

  return { context, maxAmount };
};
