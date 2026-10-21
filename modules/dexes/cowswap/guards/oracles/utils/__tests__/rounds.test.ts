import { isValidRound, isInBounds } from '../rounds';
import type { RoundData } from '../rounds';
import {
  CHAINLINK_SCALE,
  PRICE_BOUNDS,
  WSTETH_RATE_MIN,
  WSTETH_RATE_MAX,
} from '../../feeds';

// ---------------------------------------------------------------------------
// isValidRound
// ---------------------------------------------------------------------------
describe('isValidRound', () => {
  const NOW = 1700000000n;
  const MAX_STALENESS = 3900; // 1h + 5min

  const makeRound = (
    overrides: Partial<
      Record<
        'roundId' | 'answer' | 'startedAt' | 'updatedAt' | 'answeredInRound',
        bigint
      >
    > = {},
  ): RoundData => [
    overrides.roundId ?? 100n,
    overrides.answer ?? 220000000000n, // $2200
    overrides.startedAt ?? NOW - 60n,
    overrides.updatedAt ?? NOW - 60n,
    overrides.answeredInRound ?? 100n,
  ];

  it('accepts a valid fresh round', () => {
    expect(isValidRound(makeRound(), MAX_STALENESS, NOW)).toBe(true);
  });

  it('rejects answer <= 0', () => {
    expect(isValidRound(makeRound({ answer: 0n }), MAX_STALENESS, NOW)).toBe(
      false,
    );
    expect(isValidRound(makeRound({ answer: -1n }), MAX_STALENESS, NOW)).toBe(
      false,
    );
  });

  it('rejects incomplete round (answeredInRound < roundId)', () => {
    expect(
      isValidRound(
        makeRound({ roundId: 100n, answeredInRound: 99n }),
        MAX_STALENESS,
        NOW,
      ),
    ).toBe(false);
  });

  it('rejects future timestamps beyond 60s tolerance', () => {
    expect(
      isValidRound(makeRound({ updatedAt: NOW + 61n }), MAX_STALENESS, NOW),
    ).toBe(false);
  });

  it('accepts timestamps within 60s future tolerance', () => {
    expect(
      isValidRound(makeRound({ updatedAt: NOW + 60n }), MAX_STALENESS, NOW),
    ).toBe(true);
  });

  it('rejects stale data beyond maxStaleness', () => {
    expect(
      isValidRound(
        makeRound({ updatedAt: NOW - BigInt(MAX_STALENESS) - 1n }),
        MAX_STALENESS,
        NOW,
      ),
    ).toBe(false);
  });

  it('accepts data at exactly maxStaleness', () => {
    expect(
      isValidRound(
        makeRound({ updatedAt: NOW - BigInt(MAX_STALENESS) }),
        MAX_STALENESS,
        NOW,
      ),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// PRICE_BOUNDS
// ---------------------------------------------------------------------------
describe('PRICE_BOUNDS', () => {
  it('has bounds for all expected feeds', () => {
    const expected = [
      'ETH_USD',
      'STETH_USD',
      'USDC_USD',
      'USDT_USD',
      'DAI_USD',
      'BTC_USD',
    ];
    for (const key of expected) {
      expect(PRICE_BOUNDS[key]).toBeDefined();
      expect(PRICE_BOUNDS[key].min).toBeLessThan(PRICE_BOUNDS[key].max);
    }
  });

  it('ETH bounds accept $2200', () => {
    const price = 2200n * CHAINLINK_SCALE;
    expect(price >= PRICE_BOUNDS['ETH_USD'].min).toBe(true);
    expect(price <= PRICE_BOUNDS['ETH_USD'].max).toBe(true);
  });

  it('USDC bounds accept $1.00', () => {
    const price = CHAINLINK_SCALE; // $1.00
    expect(price >= PRICE_BOUNDS['USDC_USD'].min).toBe(true);
    expect(price <= PRICE_BOUNDS['USDC_USD'].max).toBe(true);
  });

  it('ETH bounds reject $0', () => {
    expect(0n >= PRICE_BOUNDS['ETH_USD'].min).toBe(false);
  });

  it('ETH bounds reject $500 (below $1000 min)', () => {
    const price = 500n * CHAINLINK_SCALE;
    expect(price >= PRICE_BOUNDS['ETH_USD'].min).toBe(false);
  });

  it('USDC bounds reject $3', () => {
    const price = 3n * CHAINLINK_SCALE;
    expect(price <= PRICE_BOUNDS['USDC_USD'].max).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isInBounds
// ---------------------------------------------------------------------------
describe('isInBounds', () => {
  it('returns true for price within bounds', () => {
    expect(isInBounds(2200n * CHAINLINK_SCALE, 'ETH_USD')).toBe(true);
  });

  it('returns false for price below min', () => {
    expect(isInBounds(10n * CHAINLINK_SCALE, 'ETH_USD')).toBe(false);
  });

  it('returns false for price above max', () => {
    expect(isInBounds(30_000n * CHAINLINK_SCALE, 'ETH_USD')).toBe(false);
  });

  it('returns true at exact min boundary', () => {
    expect(isInBounds(PRICE_BOUNDS['ETH_USD'].min, 'ETH_USD')).toBe(true);
  });

  it('returns true at exact max boundary', () => {
    expect(isInBounds(PRICE_BOUNDS['ETH_USD'].max, 'ETH_USD')).toBe(true);
  });

  it('returns false (fail-closed) for unknown feed key', () => {
    expect(isInBounds(100n * CHAINLINK_SCALE, 'UNKNOWN_FEED')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// wstETH rate bounds
// ---------------------------------------------------------------------------
describe('wstETH rate bounds', () => {
  it('accepts current rate ~1.23', () => {
    const rate = 1231387616265532089n;
    expect(rate >= WSTETH_RATE_MIN).toBe(true);
    expect(rate <= WSTETH_RATE_MAX).toBe(true);
  });

  it('rejects rate below 1.0', () => {
    expect(999999999999999999n >= WSTETH_RATE_MIN).toBe(false);
  });

  it('rejects rate above 2.0', () => {
    expect(2000000000000000001n <= WSTETH_RATE_MAX).toBe(false);
  });
});
