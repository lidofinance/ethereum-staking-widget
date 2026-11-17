import type {
  AsyncDepositQueueWritableContract,
  SyncDepositQueueWritableContract,
} from '../types/contracts';
import { selectDepositQueue } from './deposit-route';
import { isQuoteWorse } from './quote';

describe('isQuoteWorse', () => {
  const shown = { amount: 100n, output: 90n };

  it('flags a quote that gives less for the same amount', () => {
    expect(isQuoteWorse({ amount: 100n, output: 89n }, shown)).toBe(true);
  });

  it('passes an equal or better quote', () => {
    expect(isQuoteWorse({ amount: 100n, output: 90n }, shown)).toBe(false);
    expect(isQuoteWorse({ amount: 100n, output: 91n }, shown)).toBe(false);
  });

  it('compares rates when the displayed quote was for another amount', () => {
    expect(isQuoteWorse({ amount: 200n, output: 180n }, shown)).toBe(false);
    expect(isQuoteWorse({ amount: 200n, output: 179n }, shown)).toBe(true);
  });

  it('passes anything when nothing was displayed', () => {
    expect(
      isQuoteWorse({ amount: 100n, output: 1n }, { amount: 0n, output: 0n }),
    ).toBe(false);
  });
});

describe('selectDepositQueue', () => {
  const asyncQueue = {
    address: '0x02',
  } as unknown as AsyncDepositQueueWritableContract;
  const syncQueueWithPenalty = (penaltyD6: bigint) =>
    ({
      address: '0x01',
      read: { syncDepositParams: async () => [penaltyD6, 3600] as const },
    }) as unknown as SyncDepositQueueWritableContract;

  it('takes the sync queue when it charges no penalty', async () => {
    const syncQueue = syncQueueWithPenalty(0n);
    await expect(
      selectDepositQueue({ syncQueue, asyncQueue }),
    ).resolves.toEqual({ depositQueue: syncQueue, isSyncQueue: true });
  });

  it('takes the async queue while the sync queue charges a penalty', async () => {
    await expect(
      selectDepositQueue({ syncQueue: syncQueueWithPenalty(1n), asyncQueue }),
    ).resolves.toEqual({ depositQueue: asyncQueue, isSyncQueue: false });
  });

  it('takes the async queue for a token without a sync queue', async () => {
    await expect(selectDepositQueue({ asyncQueue })).resolves.toEqual({
      depositQueue: asyncQueue,
      isSyncQueue: false,
    });
  });
});
