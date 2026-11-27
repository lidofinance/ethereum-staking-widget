import type { QueryKey } from '@tanstack/react-query';
import type { z } from 'zod';

/**
 * What a form's routes are about. A form with several flows behind one UI
 * (stake: Lido submit, wrap ETH, L2 fast stake) declares one spec and
 * implements one FormRoute per flow.
 */
export type FormRouteSpec = {
  id: string;
  /** what the user picked; the route is chosen by it alone */
  pair: object;
  /** validated values submit gets */
  values: object;
  /** what a route reads its context with: the pair plus the environment */
  deps: object;
  /** what a route reads its quote data with: public, no account needed */
  quoteDeps: object;
  /** what a route promises for an amount, e.g. `{ amountOut }` */
  quote: object;
  /** hook-backed tools the form hands to submit: routes cannot call hooks */
  tools: object;
  /** route-specific UI texts */
  ui: object;
};

export type RouteQuery<TData> = {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
};

/** what submit gets besides the values */
export type RouteSubmission<S extends FormRouteSpec, TContext> = {
  context: TContext;
  /** the quote the user saw, for exactly the submitted amount */
  quote: S['quote'];
  /** re-reads the quote, bypassing the cache, for the same amount */
  refreshQuote: () => Promise<S['quote']>;
  /** submits the form again, through its validation (e.g. a modal's Try again) */
  retry: () => void;
};

/** how a route's submit ended */
export type RouteSubmitResult<S extends FormRouteSpec> = {
  /** the action happened: the form resets */
  isSuccess: boolean;
  /**
   * values the form switches to: a failed flow that already moved the
   * funds (e.g. WETH unwrapped to ETH) points the form at where they are,
   * so they do not look lost and a retry continues from there
   */
  nextValues?: Partial<S['values']>;
};

/**
 * One flow of a form: the data it reads, validation, max amount, quote,
 * submit and UI texts.
 *
 * Two reads, both plain query options so the UI (useQuery) and the
 * resolver/submit (queryClient.query) share one cache, and only the
 * picked route is read:
 * - context: account data (balances, gas, limits), needs a wallet;
 * - quote: what the user receives for an amount, public, so it shows
 *   before connecting too. Keyed by the amount: a route can ask the
 *   contract's own conversion for the exact amount, rounding included.
 *
 * Method syntax on purpose: it lets a route of any context type sit in a
 * registry as FormRoute<S> (context unknown) while staying typed inside.
 */
export type FormRoute<S extends FormRouteSpec, TContext = unknown> = {
  id: S['id'];
  ui: S['ui'];
  matches(pair: S['pair']): boolean;
  contextQuery(deps: S['deps']): RouteQuery<TContext>;
  quoteQuery(deps: S['quoteDeps'], amount: bigint): RouteQuery<S['quote']>;
  /** what Max fills in */
  getMaxAmount(context: TContext, pair: S['pair']): bigint;
  /** the route's checks on the values; the first issue is reported */
  getSchema(context: TContext, pair: S['pair']): z.ZodType;
  submit(
    values: S['values'],
    submission: RouteSubmission<S, TContext>,
    tools: S['tools'],
  ): Promise<RouteSubmitResult<S>>;
};
