import { DEPOSIT_QUEUE_ABI, SYNC_DEPOSIT_QUEUE_ABI } from '../abi';
import type {
  AsyncDepositQueueWritableContract,
  CollectorContract,
  DepositQueueContract,
  SyncDepositQueueWritableContract,
} from '../types/contracts';
import { getDepositRoute } from './deposit-route';
import {
  applySyncDepositPenalty,
  isQuoteWorse,
  readDepositQuote,
  type VaultQuote,
} from './quote';

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

describe('getDepositRoute', () => {
  const syncQueue = {
    address: '0x01',
  } as unknown as SyncDepositQueueWritableContract;
  const asyncQueue = {
    address: '0x02',
  } as unknown as AsyncDepositQueueWritableContract;

  it('takes the sync queue whenever the token has one', () => {
    expect(getDepositRoute({ syncQueue, asyncQueue })).toEqual({
      depositQueue: syncQueue,
      isSyncQueue: true,
    });
  });

  it('takes the async queue for a token without a sync queue', () => {
    expect(getDepositRoute({ asyncQueue })).toEqual({
      depositQueue: asyncQueue,
      isSyncQueue: false,
    });
  });

  it('refuses a token with neither queue', () => {
    expect(() => getDepositRoute({})).toThrow();
  });
});

describe('applySyncDepositPenalty', () => {
  it('leaves the amount whole without a penalty', () => {
    expect(applySyncDepositPenalty(10n ** 18n, 0n)).toBe(10n ** 18n);
  });

  it('takes the penalty share of the amount', () => {
    expect(applySyncDepositPenalty(10n ** 18n, 1_000n)).toBe(999n * 10n ** 15n);
    // the queue caps the penalty at 50%
    expect(applySyncDepositPenalty(10n ** 18n, 500_000n)).toBe(5n * 10n ** 17n);
  });

  // SyncDepositQueue.deposit: shares = assets * (priceD18 * (1e6 - penaltyD6) / 1e6) / 1e18;
  // the Collector for the penalised amount: (assets * (1e6 - penaltyD6) / 1e6) * priceD18 / 1e18
  it.each([
    [10n ** 18n, 979_123_456_789_012_345n, 1_000n],
    [123_456_789_012_345_678n, 1_023_456_789_000_000_001n, 250_000n],
    [7n * 10n ** 6n, 999_999_999_999_999_999n, 500_000n],
  ])(
    'matches the sync queue mint within rounding (%s at %s, penalty %s)',
    (assets, priceD18, penaltyD6) => {
      const minted =
        (assets * ((priceD18 * (1_000_000n - penaltyD6)) / 1_000_000n)) /
        10n ** 18n;
      const quoted =
        (applySyncDepositPenalty(assets, penaltyD6) * priceD18) / 10n ** 18n;
      const diff = minted > quoted ? minted - quoted : quoted - minted;
      expect(diff <= 2n).toBe(true);
    },
  );
});

describe('readDepositQuote', () => {
  const ACCOUNT = '0x0000000000000000000000000000000000000001';
  const collectorQuoting = () =>
    ({
      read: {
        getDepositParams: vi.fn(
          async ([, amount]: readonly [unknown, bigint]) => ({
            shares: amount * 2n,
          }),
        ),
      },
    }) as unknown as CollectorContract & {
      read: { getDepositParams: ReturnType<typeof vi.fn> };
    };

  it('quotes the sync queue for the amount its current penalty leaves', async () => {
    const collector = collectorQuoting();
    const depositQueue = {
      address: '0x01',
      abi: SYNC_DEPOSIT_QUEUE_ABI,
      read: { syncDepositParams: vi.fn(async () => [100_000n, 3600] as const) },
    } as unknown as DepositQueueContract;

    await expect(
      readDepositQuote({
        collector,
        depositQueue,
        amount: 1_000n,
        account: ACCOUNT,
      }),
    ).resolves.toEqual({ amount: 1_000n, output: 1_800n });
    expect(collector.read.getDepositParams.mock.calls[0][0][1]).toBe(900n);
  });

  it('quotes the async queue for the full amount, with no penalty read', async () => {
    const collector = collectorQuoting();
    const depositQueue = {
      address: '0x02',
      abi: DEPOSIT_QUEUE_ABI,
    } as unknown as DepositQueueContract;

    await expect(
      readDepositQuote({
        collector,
        depositQueue,
        amount: 1_000n,
        account: ACCOUNT,
      }),
    ).resolves.toEqual({ amount: 1_000n, output: 2_000n });
  });
});
