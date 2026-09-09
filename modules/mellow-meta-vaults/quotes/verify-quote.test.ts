import { QueryClient, queryOptions } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import { QuoteMismatchError } from 'modules/web3/utils/quote-mismatch-error';
import { verifyQuote } from './verify-quote';

type Quote = { shares: bigint };

const isWorse = (fresh: Quote, displayed: Quote) =>
  fresh.shares < displayed.shares;

const setup = (fresh: Quote) => {
  // Mirrors the app's global strategy: cached data is considered fresh for 5 minutes
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: false } },
  });
  const queryFn = vi.fn(async () => fresh);
  const options = queryOptions({ queryKey: ['quote', '1'] as const, queryFn });
  return { queryClient, queryFn, options };
};

describe('verifyQuote', () => {
  it('re-fetches on-chain even when the cached quote is not stale', async () => {
    const { queryClient, queryFn, options } = setup({ shares: 100n });
    queryClient.setQueryData(options.queryKey, { shares: 100n });

    const result = await verifyQuote({ queryClient, options, isWorse });

    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ shares: 100n });
  });

  it('throws QuoteMismatchError when the fresh quote is worse than displayed', async () => {
    const { queryClient, options } = setup({ shares: 99n });
    queryClient.setQueryData(options.queryKey, { shares: 100n });

    await expect(
      verifyQuote({ queryClient, options, isWorse }),
    ).rejects.toBeInstanceOf(QuoteMismatchError);
  });

  it('updates the cache so the preview shows the fresh quote after a mismatch', async () => {
    const { queryClient, options } = setup({ shares: 99n });
    queryClient.setQueryData(options.queryKey, { shares: 100n });

    await verifyQuote({ queryClient, options, isWorse }).catch(() => {});

    expect(queryClient.getQueryData(options.queryKey)).toEqual({ shares: 99n });
  });

  it('proceeds when the fresh quote is better than displayed', async () => {
    const { queryClient, options } = setup({ shares: 101n });
    queryClient.setQueryData(options.queryKey, { shares: 100n });

    await expect(
      verifyQuote({ queryClient, options, isWorse }),
    ).resolves.toEqual({ shares: 101n });
  });

  it('skips the comparison when nothing was displayed for these inputs', async () => {
    const { queryClient, options } = setup({ shares: 1n });

    await expect(
      verifyQuote({ queryClient, options, isWorse }),
    ).resolves.toEqual({ shares: 1n });
  });

  it('propagates quote fetch errors', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const options = queryOptions({
      queryKey: ['quote', 'failing'] as const,
      queryFn: async (): Promise<Quote> => {
        throw new Error('rpc down');
      },
    });

    await expect(
      verifyQuote({ queryClient, options, isWorse }),
    ).rejects.toThrow('rpc down');
  });
});
