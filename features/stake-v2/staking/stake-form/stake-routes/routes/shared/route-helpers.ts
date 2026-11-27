import type { QueryKey } from '@tanstack/react-query';

import { QuoteMismatchError } from 'modules/web3';

import { errorTexts } from '../../../../../utils';
import type {
  StakeQuote,
  StakeRouteDeps,
  StakeRouteId,
  StakeRoutePair,
  StakeRouteQuoteDeps,
  StakeRouteSubmission,
} from '../../types';

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
  if (fresh.amountOut < quote.amountOut)
    throw new QuoteMismatchError(errorTexts.forms.general.quoteChanged());
  return fresh;
};
