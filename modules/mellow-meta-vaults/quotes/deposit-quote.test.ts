import { describe, expect, it } from 'vitest';

import {
  DEPOSIT_QUEUE_ABI,
  SYNC_DEPOSIT_QUEUE_ABI,
} from 'modules/mellow-meta-vaults/abi';
import type { DepositQueueContract } from '../types/contracts';
import { isDepositQuoteWorse, isSyncDepositQueue } from './deposit-quote';
import { isWithdrawQuoteWorse, type WithdrawQuote } from './withdraw-quote';

const asQueue = (abi: unknown) => ({ abi }) as unknown as DepositQueueContract;

describe('isSyncDepositQueue', () => {
  it('recognises the sync queue by its ABI', () => {
    expect(isSyncDepositQueue(asQueue(SYNC_DEPOSIT_QUEUE_ABI))).toBe(true);
  });

  it('treats the legacy async queue as penalty-free', () => {
    expect(isSyncDepositQueue(asQueue(DEPOSIT_QUEUE_ABI))).toBe(false);
  });
});

describe('quote comparison', () => {
  it('flags a deposit that mints fewer shares than displayed', () => {
    expect(
      isDepositQuoteWorse(
        { shares: 99n, penaltyD6: 1_000n },
        { shares: 100n, penaltyD6: 0n },
      ),
    ).toBe(true);
    expect(
      isDepositQuoteWorse(
        { shares: 100n, penaltyD6: 0n },
        { shares: 100n, penaltyD6: 0n },
      ),
    ).toBe(false);
  });

  it('flags a withdrawal that pays out fewer assets than displayed', () => {
    const base: WithdrawQuote = {
      assets: 100n,
      route: 'sync',
      penaltyD6: 0n,
      isInstantUnavailable: false,
    };
    expect(isWithdrawQuoteWorse({ ...base, assets: 99n }, base)).toBe(true);
    expect(isWithdrawQuoteWorse({ ...base, route: 'async' }, base)).toBe(false);
  });
});
