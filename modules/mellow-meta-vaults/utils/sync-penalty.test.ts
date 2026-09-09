import { describe, expect, it } from 'vitest';

import { applySyncPenaltyD6 } from './sync-penalty';

describe('applySyncPenaltyD6', () => {
  it('returns the amount unchanged when the penalty is zero', () => {
    expect(applySyncPenaltyD6(1_000_000_000_000_000_000n, 0n)).toBe(
      1_000_000_000_000_000_000n,
    );
  });

  it('applies a 0.1% penalty', () => {
    expect(applySyncPenaltyD6(1_000_000_000_000_000_000n, 1_000n)).toBe(
      999_000_000_000_000_000n,
    );
  });

  it('applies the maximum on-chain penalty of 50%', () => {
    expect(applySyncPenaltyD6(1_000_000n, 500_000n)).toBe(500_000n);
  });

  it('rounds down like Math.mulDiv', () => {
    expect(applySyncPenaltyD6(3n, 1n)).toBe(2n);
  });

  it('rejects penalties outside the D6 range', () => {
    expect(() => applySyncPenaltyD6(1n, -1n)).toThrow();
    expect(() => applySyncPenaltyD6(1n, 1_000_001n)).toThrow();
  });
});
