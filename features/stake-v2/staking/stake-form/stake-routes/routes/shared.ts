import type { QueryKey } from '@tanstack/react-query';

import { QuoteMismatchError } from '../../../../utils';
import type {
  StakeQuote,
  StakeRouteDeps,
  StakeRouteId,
  StakeRoutePair,
  StakeRouteQuoteDeps,
  StakeRouteSubmission,
  StakeRouteValues,
} from '../types';

// what the stake routes share; generic pieces live in stake-v2/utils

export const isSameChain = ({ tokenIn, tokenOut }: StakeRoutePair) =>
  tokenIn.chainId === tokenOut.chainId;

/**
 * Under `['balance']`, so tx flows that refresh account reads
 * (ACCOUNT_READ_QUERY_KEYS) refresh route contexts too.
 */
export const routeQueryKey = (
  id: StakeRouteId,
  { tokenIn, tokenOut, account, isAA }: StakeRouteDeps,
): QueryKey => [
  'balance',
  'stake-v2-route',
  id,
  { tokenIn, tokenOut, account, isAA },
];

/**
 * A quote depends on the route, the chain and the amount, never the
 * account. The amount goes last: same-route keys differ only there
 */
export const quoteQueryKey = (
  id: StakeRouteId,
  { tokenIn }: StakeRouteQuoteDeps,
  amount: bigint,
): QueryKey => [
  'stake-v2-route-quote',
  id,
  { chainId: tokenIn.chainId, token: tokenIn.token },
  amount,
];

/**
 * Re-reads the quote right before sending and stops when it got worse than
 * the one the user saw: fewer tokens out for the same amount in. A better
 * quote passes; the fresh one is returned to sign with.
 */
export const verifyQuote = async <TContext>({
  quote,
  refreshQuote,
}: StakeRouteSubmission<TContext>): Promise<StakeQuote> => {
  const fresh = await refreshQuote();
  if (fresh.amountOut < quote.amountOut) throw new QuoteMismatchError();
  return fresh;
};

/** stand-in for the tx flow: shows which route got which arguments */
export const placeholderSubmit =
  (id: StakeRouteId, { shouldVerifyQuote = false } = {}) =>
  async <TContext>(
    values: StakeRouteValues,
    submission: StakeRouteSubmission<TContext>,
  ) => {
    const freshQuote = shouldVerifyQuote
      ? await verifyQuote(submission)
      : undefined;
    console.info(`[stake-v2] submit via route "${id}"`, {
      values,
      context: submission.context,
      quote: submission.quote,
      freshQuote,
    });
    return true;
  };
