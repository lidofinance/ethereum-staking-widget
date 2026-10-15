vi.mock('modules/web3', () => ({ getPrettyChainName: () => 'Base' }));

import { TOKENS_TO_STAKE } from 'features/stake/shared/types';
import { L2StakeModule, type L2SlowStakeLimits } from 'modules/l2-staking';
import { validateSlowLaneAmount } from '../validation';

const P = 10n ** 18n;
const CHAIN_ID = 8453;
const limits: L2SlowStakeLimits = L2StakeModule.calcSlowStakeLimits(
  {
    tokens: 60n * P,
    lastUpdated: 0,
    isEnabled: true,
    capacity: 90n * P,
    rate: P / 10n, // 0.1 ETH per second
  },
  0n,
);

const validate = (amount: bigint, overrides?: L2SlowStakeLimits) =>
  validateSlowLaneAmount('amount', amount, TOKENS_TO_STAKE.ETH, {
    limits: overrides ?? limits,
    chainId: CHAIN_ID,
  });

describe('validateSlowLaneAmount', () => {
  it('passes what the bucket takes right now', () => {
    expect(() => validate(60n * P)).not.toThrow();
    expect(() => validate(1n)).not.toThrow();
  });

  it('rejects an amount above the capacity as a per-transaction limit', () => {
    expect(() => validate(90n * P + 1n)).toThrow(
      /per-transaction limit on Base of 90\.0 ETH/,
    );
  });

  it('rejects an amount above what has refilled with the wait', () => {
    // 15 ETH short at 0.1 ETH per second: 150 seconds
    expect(() => validate(75n * P)).toThrow(
      /used up.*Stake up to 60\.0 ETH now or try again in 3 minutes/,
    );
    expect(() => validate(60n * P + 1n)).toThrow(/in a minute/);
  });

  it('passes while the limits are unknown', () => {
    expect(() =>
      validateSlowLaneAmount('amount', 10n ** 30n, TOKENS_TO_STAKE.ETH, {
        limits: undefined,
        chainId: CHAIN_ID,
      }),
    ).not.toThrow();
  });

  it('passes everything while the limiter is off', () => {
    const off = L2StakeModule.calcSlowStakeLimits(
      { tokens: 0n, lastUpdated: 0, isEnabled: false, capacity: 0n, rate: 0n },
      0n,
    );
    expect(() => validate(10n ** 30n, off)).not.toThrow();
  });
});
