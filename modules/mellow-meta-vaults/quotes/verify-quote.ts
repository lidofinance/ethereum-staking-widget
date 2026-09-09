import type {
  FetchQueryOptions,
  QueryClient,
  QueryKey,
} from '@tanstack/react-query';
import { QuoteMismatchError } from 'modules/web3/utils/quote-mismatch-error';

/**
 * Pre-signing guard shared by every quote-driven tx flow.
 *
 * The form preview and the tx hook build the same query options, so the
 * React Query cache is the channel between "what the user saw" and "what we
 * are about to execute":
 *  1. `getQueryData` reads the quote currently rendered for exactly these
 *     inputs (same key). No entry means nothing was shown for these inputs.
 *  2. `fetchQuery` with `staleTime: 0` re-quotes on-chain, bypassing the
 *     global 5-minute strategy. The refetch also updates the rendered preview.
 *  3. If the fresh quote is worse for the user, throw so the tx modal shows
 *     ErrorMessage.QUOTE_CHANGED and a retry runs against the updated preview.
 */
export type VerifyQuoteArgs<TQuote, TKey extends QueryKey> = {
  queryClient: QueryClient;
  options: FetchQueryOptions<TQuote, Error, TQuote, TKey>;
  isWorse: (fresh: TQuote, displayed: TQuote) => boolean;
};

export const verifyQuote = async <TQuote, TKey extends QueryKey>({
  queryClient,
  options,
  isWorse,
}: VerifyQuoteArgs<TQuote, TKey>): Promise<TQuote> => {
  const displayed = queryClient.getQueryData<TQuote>(options.queryKey);
  const fresh = await queryClient.fetchQuery({ ...options, staleTime: 0 });

  if (displayed !== undefined && isWorse(fresh, displayed)) {
    throw new QuoteMismatchError();
  }

  return fresh;
};
