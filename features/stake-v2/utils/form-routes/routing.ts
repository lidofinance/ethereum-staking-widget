import { useMemo } from 'react';
import {
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { useConfig, type Config } from 'wagmi';

import { createRouteRequester, type RouteRequester } from './context';
import type { FormRoute, FormRouteSpec } from './types';

/** what every route reads with, wallet or not: chain-explicit clients */
export type RoutePublicEnvironment = {
  queryClient: QueryClient;
  wagmiConfig: Config;
};

/**
 * How a form's routes are wired: one constant per form, next to its
 * routes. The hooks run inside useFormRouting; keep their results memoized.
 */
export type FormRoutingConfig<S extends FormRouteSpec, TEnvironment> = {
  /** the route of a pair; none for a pair no flow covers */
  resolve: (pair: S['pair']) => FormRoute<S> | null;
  /** the pair of the submitted values */
  toPair: (values: S['values']) => S['pair'];
  /** the amount of the submitted values, for the pinned quote */
  getAmount: (values: S['values']) => bigint;
  /** hook: what route contexts need beyond the pair, null without it (e.g. no account) */
  useEnvironment: () => TEnvironment | null;
  /** hook: what submit needs to send (tx flow, SDK...), null without it */
  useSubmitTools: () => S['tools'] | null;
  toDeps: (
    pair: S['pair'],
    environment: RoutePublicEnvironment & TEnvironment,
  ) => S['deps'];
  toQuoteDeps: (
    pair: S['pair'],
    environment: RoutePublicEnvironment,
  ) => S['quoteDeps'];
  /** refreshed after a successful submit; default: account reads */
  refetchAfterSubmit?: readonly QueryKey[];
};

/** a form's routing, ready to use: what the resolver, UI and submit share */
export type FormRouting<S extends FormRouteSpec> = {
  resolve: (pair: S['pair']) => FormRoute<S> | null;
  toPair: (values: S['values']) => S['pair'];
  /** null while the environment is missing (e.g. no account) */
  getDeps: (pair: S['pair']) => S['deps'] | null;
  getQuoteDeps: (pair: S['pair']) => S['quoteDeps'];
  requester: RouteRequester<S>;
  /**
   * runs the route of the values: its context, the quote the user saw for
   * exactly this amount (plus a fresh re-read to compare with), the tools
   */
  submit: (values: S['values']) => Promise<boolean>;
};

const DEFAULT_REFETCH_AFTER_SUBMIT: readonly QueryKey[] = [['balance']];

export const useFormRouting = <S extends FormRouteSpec, TEnvironment>(
  config: FormRoutingConfig<S, TEnvironment>,
): FormRouting<S> => {
  const queryClient = useQueryClient();
  const wagmiConfig = useConfig();
  const environment = config.useEnvironment();
  const tools = config.useSubmitTools();

  return useMemo(() => {
    const publicEnvironment = { queryClient, wagmiConfig };
    const getDeps = (pair: S['pair']) =>
      environment
        ? config.toDeps(pair, { ...publicEnvironment, ...environment })
        : null;
    const getQuoteDeps = (pair: S['pair']) =>
      config.toQuoteDeps(pair, publicEnvironment);

    const requester = createRouteRequester<S>({
      queryClient,
      getDeps: (pair) => {
        const deps = getDeps(pair);
        invariant(deps, 'a route context needs its environment');
        return deps;
      },
      getQuoteDeps,
    });

    const submit = async (values: S['values']) => {
      const pair = config.toPair(values);
      const route = config.resolve(pair);
      invariant(route, 'validated values must have a route');
      invariant(tools, 'submit needs its tools');
      const amount = config.getAmount(values);

      const [context, quote] = await Promise.all([
        requester.request(route, pair),
        // the cached quote: what the UI showed for this amount
        requester.requestQuote(route, pair, amount),
      ]);
      const isSuccess = await route.submit(
        values,
        {
          context,
          quote,
          refreshQuote: () =>
            requester.requestQuote(route, pair, amount, { fresh: true }),
        },
        tools,
      );

      if (isSuccess) {
        for (const queryKey of config.refetchAfterSubmit ??
          DEFAULT_REFETCH_AFTER_SUBMIT) {
          void queryClient.invalidateQueries({ queryKey });
        }
      }
      return isSuccess;
    };

    return {
      resolve: config.resolve,
      toPair: config.toPair,
      getDeps,
      getQuoteDeps,
      requester,
      submit,
    };
  }, [config, queryClient, wagmiConfig, environment, tools]);
};
