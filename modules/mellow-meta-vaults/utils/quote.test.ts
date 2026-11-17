import type {
  AsyncDepositQueueWritableContract,
  SyncDepositQueueWritableContract,
} from '../types/contracts';
import { selectDepositQueue } from './deposit-route';
import { isQuoteWorse, type VaultQuote } from './quote';

describe('isQuoteWorse', () => {
  const shown = { amount: 100n, output: 90n };

  it('flags a quote that gives less for the same amount', () => {
    expect(isQuoteWorse({ amount: 100n, output: 89n }, shown)).toBe(true);
  });

  it('passes an equal or better quote', () => {
    expect(isQuoteWorse({ amount: 100n, output: 90n }, shown)).toBe(false);
    expect(isQuoteWorse({ amount: 100n, output: 91n }, shown)).toBe(false);
  });

  it('compares rates within the rounding when the displayed quote was for another amount', () => {
    const shownAt = { amount: 10n ** 18n, output: 9n * 10n ** 17n };
    // the fresh rate can be no higher than (output + 1) / amount, the shown
    // one no lower than (output - 1) / amount
    expect(
      isQuoteWorse(
        { amount: 2n * 10n ** 18n, output: 18n * 10n ** 17n - 2n },
        shownAt,
      ),
    ).toBe(false);
    expect(
      isQuoteWorse(
        { amount: 2n * 10n ** 18n, output: 18n * 10n ** 17n - 3n },
        shownAt,
      ),
    ).toBe(true);
  });

  it('passes anything when nothing was displayed', () => {
    expect(
      isQuoteWorse({ amount: 100n, output: 1n }, { amount: 0n, output: 0n }),
    ).toBe(false);
  });

  describe('against the Collector arithmetic', () => {
    // Collector: output = amount * priceD18 / 1e18 rounded down, less a fee
    // of output * feeD6 / 1e6 rounded down
    const quoteAt =
      (priceD18: bigint, feeD6 = 0n) =>
      (amount: bigint): VaultQuote => {
        const gross = (amount * priceD18) / 10n ** 18n;
        return { amount, output: gross - (gross * feeD6) / 10n ** 6n };
      };
    // a live EarnETH redemption price and one 1 ppm lower
    const PRICE = 819_445_932_074_367_174n;
    const LOWER_PRICE = PRICE - PRICE / 10n ** 6n;
    // amounts a preview and a send can disagree on: a debounced input, or a
    // stETH amount converted at a cached and at a fresh rate
    const amountPairs = Array.from({ length: 500 }, (_, i) => {
      const base = 10n ** 15n + BigInt(i) * 7_919_000_000_013n;
      return [base, base + 1n + BigInt(i) * 104_729n] as const;
    });

    it.each([
      ['without a fee', 0n],
      ['with a fee', 2_500n],
    ])('passes an unchanged rate at another amount %s', (_, feeD6) => {
      const quote = quoteAt(PRICE, feeD6);
      for (const [shownAmount, freshAmount] of amountPairs) {
        expect(isQuoteWorse(quote(freshAmount), quote(shownAmount))).toBe(
          false,
        );
        expect(isQuoteWorse(quote(shownAmount), quote(freshAmount))).toBe(
          false,
        );
      }
    });

    it('flags a lower rate at another amount', () => {
      for (const [shownAmount, freshAmount] of amountPairs) {
        expect(
          isQuoteWorse(
            quoteAt(LOWER_PRICE)(freshAmount),
            quoteAt(PRICE)(shownAmount),
          ),
        ).toBe(true);
      }
    });

    it('flags a lower rate at the same amount down to one unit of output', () => {
      const amount = 10n ** 18n;
      const shownQuote = quoteAt(PRICE)(amount);
      expect(
        isQuoteWorse({ amount, output: shownQuote.output - 1n }, shownQuote),
      ).toBe(true);
    });
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
