import type { FormRoute, FormRouteSpec } from './types';

/** a form's routes, first match wins */
export const createRouteRegistry = <S extends FormRouteSpec>(
  routes: readonly FormRoute<S>[],
) => {
  const resolve = (pair: S['pair']): FormRoute<S> | null =>
    routes.find((route) => route.matches(pair)) ?? null;
  return {
    resolve,
    isRoutable: (pair: S['pair']) => resolve(pair) !== null,
  };
};
