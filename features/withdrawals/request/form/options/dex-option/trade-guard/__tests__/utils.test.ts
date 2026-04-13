import { safeParseDecimal } from '../utils/safe-parce-decimal';
import { resolveLevel } from '../utils/resolve-level';
import { analyzeParams } from '../utils/analyze-params';
import {
  isValidRound,
  isInBounds,
  CHAINLINK_SCALE,
  PRICE_BOUNDS,
  WSTETH_RATE_MIN,
  WSTETH_RATE_MAX,
} from '../oracle-utils';
import type { RoundData } from '../oracle-utils';
import type { OnTradeParamsPayload } from '../types';

// stETH and ETH addresses for test fixtures
const STETH = '0xae7ab96520de3a18e5e111b5eaab095312d7fe84';
const WSTETH = '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0';
const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const UNKNOWN = '0x0000000000000000000000000000000000000001';

const WALLET = '0xUserWalletAddress';

const makePayload = (
  overrides: Partial<OnTradeParamsPayload> = {},
): OnTradeParamsPayload =>
  ({
    sellToken: { address: STETH, symbol: 'stETH' },
    buyToken: { address: ETH, symbol: 'ETH' },
    sellTokenAmount: { units: '10' },
    buyTokenAmount: { units: '10' },
    minimumReceiveBuyAmount: { units: '9.8' },
    sellTokenFiatAmount: '22000',
    buyTokenFiatAmount: '21800',
    recipient: undefined,
    ...overrides,
  }) as unknown as OnTradeParamsPayload;

// ---------------------------------------------------------------------------
// safeParseDecimal
// ---------------------------------------------------------------------------
describe('safeParseDecimal', () => {
  it('parses valid integers', () => {
    expect(safeParseDecimal('42')).toBe(42);
    expect(safeParseDecimal('0')).toBe(0);
  });

  it('parses valid decimals', () => {
    expect(safeParseDecimal('1.5')).toBe(1.5);
    expect(safeParseDecimal('0.001')).toBe(0.001);
  });

  it('returns null for null/undefined/empty', () => {
    expect(safeParseDecimal(null)).toBeNull();
    expect(safeParseDecimal(undefined)).toBeNull();
    expect(safeParseDecimal('')).toBeNull();
  });

  it('rejects scientific notation', () => {
    expect(safeParseDecimal('1e18')).toBeNull();
    expect(safeParseDecimal('1E10')).toBeNull();
    expect(safeParseDecimal('1e+5')).toBeNull();
  });

  it('rejects partial parses', () => {
    expect(safeParseDecimal('1000abc')).toBeNull();
    expect(safeParseDecimal('abc')).toBeNull();
    expect(safeParseDecimal('12.34.56')).toBeNull();
  });

  it('rejects negative numbers', () => {
    expect(safeParseDecimal('-1')).toBeNull();
    expect(safeParseDecimal('-0.5')).toBeNull();
  });

  it('handles large valid numbers', () => {
    expect(safeParseDecimal('99999999999999999999')).toBe(1e20);
  });

  it('rejects numbers exceeding 20 integer digits', () => {
    expect(safeParseDecimal('123456789012345678901')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// resolveLevel
// ---------------------------------------------------------------------------
describe('resolveLevel', () => {
  it('returns safe when both null', () => {
    expect(resolveLevel(null, null)).toBe('safe');
  });

  it('returns warning for fiat deviation >= 2%', () => {
    expect(resolveLevel(2, null)).toBe('warning');
    expect(resolveLevel(4.9, null)).toBe('warning');
  });

  it('returns danger for fiat deviation >= 5%', () => {
    expect(resolveLevel(5, null)).toBe('danger');
    expect(resolveLevel(9.9, null)).toBe('danger');
  });

  it('returns blocked for fiat deviation >= 10%', () => {
    expect(resolveLevel(10, null)).toBe('blocked');
    expect(resolveLevel(50, null)).toBe('blocked');
  });

  it('returns danger for oracle deviation >= 3%', () => {
    expect(resolveLevel(null, 3)).toBe('danger');
    expect(resolveLevel(null, 4.9)).toBe('danger');
  });

  it('returns blocked for oracle deviation >= 5%', () => {
    expect(resolveLevel(null, 5)).toBe('blocked');
  });

  it('oracle takes precedence over fiat when higher', () => {
    // fiat = warning (2%), oracle = blocked (5%)
    expect(resolveLevel(2, 5)).toBe('blocked');
  });

  it('fiat takes precedence when oracle is below threshold', () => {
    // fiat = danger (5%), oracle = safe (1%)
    expect(resolveLevel(5, 1)).toBe('danger');
  });

  it('returns blocked when fiat exceeds block even if oracle is at danger', () => {
    // fiat = blocked (11%), oracle = danger (4%) → must return blocked
    expect(resolveLevel(11, 4)).toBe('blocked');
  });
});

// ---------------------------------------------------------------------------
// analyzeParams
// ---------------------------------------------------------------------------
describe('analyzeParams', () => {
  describe('token validation', () => {
    it('returns warning when sell token is missing', () => {
      const payload = makePayload({ sellToken: undefined });
      const result = analyzeParams(payload, WALLET, false);
      expect(result.level).toBe('warning');
      expect(result.messages[0]).toContain('Token information unavailable');
    });

    it('blocks invalid sell token on mainnet', () => {
      const payload = makePayload({
        sellToken: { address: UNKNOWN, symbol: 'X' } as never,
      });
      const result = analyzeParams(payload, WALLET, false);
      expect(result.level).toBe('blocked');
      expect(result.messages[0]).toContain('Invalid sell token');
    });

    it('blocks invalid buy token on mainnet', () => {
      const payload = makePayload({
        buyToken: { address: UNKNOWN, symbol: 'X' } as never,
      });
      const result = analyzeParams(payload, WALLET, false);
      expect(result.level).toBe('blocked');
      expect(result.messages[0]).toContain('Invalid buy token');
    });

    it('skips token whitelist on testnet', () => {
      const payload = makePayload({
        sellToken: { address: UNKNOWN, symbol: 'X' } as never,
        buyToken: { address: UNKNOWN, symbol: 'Y' } as never,
      });
      const result = analyzeParams(payload, WALLET, true);
      expect(result.level).not.toBe('blocked');
    });

    it('accepts valid stETH → ETH pair', () => {
      const result = analyzeParams(makePayload(), WALLET, false);
      expect(result.level).toBe('safe');
    });

    it('accepts wstETH → USDC pair', () => {
      const payload = makePayload({
        sellToken: { address: WSTETH, symbol: 'wstETH' } as never,
        buyToken: { address: USDC, symbol: 'USDC' } as never,
      });
      const result = analyzeParams(payload, WALLET, false);
      expect(result.level).toBe('safe');
    });
  });

  describe('recipient validation', () => {
    it('blocks when recipient mismatches wallet', () => {
      const payload = makePayload({ recipient: '0xAttacker' });
      const result = analyzeParams(payload, WALLET, false);
      expect(result.level).toBe('blocked');
      expect(result.messages[0]).toContain('recipient does not match');
    });

    it('passes when recipient matches wallet (case-insensitive)', () => {
      const payload = makePayload({
        recipient: WALLET.toUpperCase(),
      });
      const result = analyzeParams(payload, WALLET, false);
      expect(result.level).not.toBe('blocked');
    });

    it('passes when recipient is undefined', () => {
      const payload = makePayload({ recipient: undefined });
      const result = analyzeParams(payload, WALLET, false);
      expect(result.level).toBe('safe');
    });

    it('skips recipient check when wallet is undefined (banner mode)', () => {
      const payload = makePayload({ recipient: '0xAnyone' });
      const result = analyzeParams(payload, undefined, false);
      expect(result.level).not.toBe('blocked');
    });
  });

  describe('max sell amount', () => {
    it('blocks sell amount > 5000', () => {
      const payload = makePayload({
        sellTokenAmount: { units: '5001' } as never,
      });
      const result = analyzeParams(payload, WALLET, false);
      expect(result.level).toBe('blocked');
      expect(result.messages[0]).toContain('exceeds maximum');
    });

    it('allows sell amount = 5000', () => {
      const payload = makePayload({
        sellTokenAmount: { units: '5000' } as never,
      });
      const result = analyzeParams(payload, WALLET, false);
      expect(result.level).not.toBe('blocked');
    });
  });

  describe('slippage detection', () => {
    it('warns on high slippage (ratio below MAX_SLIPPAGE + fee threshold)', () => {
      const payload = makePayload({
        buyTokenAmount: { units: '10' } as never,
        minimumReceiveBuyAmount: { units: '9.5' } as never, // 95% < 96.7%
      });
      const result = analyzeParams(payload, WALLET, false);
      expect(result.level).toBe('warning');
      expect(result.messages[0]).toContain('slippage');
    });

    it('no warning when slippage ratio is within MAX_SLIPPAGE + fee limit', () => {
      const payload = makePayload({
        buyTokenAmount: { units: '10' } as never,
        minimumReceiveBuyAmount: { units: '9.8' } as never, // 98% > 96.7%
      });
      const result = analyzeParams(payload, WALLET, false);
      expect(
        result.messages.find((m) => m.includes('slippage')),
      ).toBeUndefined();
    });

    it('skips slippage check for small trades (sellFiat < $50)', () => {
      const payload = makePayload({
        sellTokenFiatAmount: '4.09',
        buyTokenFiatAmount: '4.09',
        buyTokenAmount: { units: '0.001872' } as never,
        // 93.6% ratio — would trigger on large trade, but skipped here
        minimumReceiveBuyAmount: { units: '0.001752' } as never,
      });
      const result = analyzeParams(payload, WALLET, false);
      expect(
        result.messages.find((m) => m.includes('slippage')),
      ).toBeUndefined();
    });

    it('runs slippage check when sellFiat >= $50', () => {
      const payload = makePayload({
        sellTokenFiatAmount: '50',
        buyTokenFiatAmount: '50',
        buyTokenAmount: { units: '10' } as never,
        minimumReceiveBuyAmount: { units: '9.3' } as never, // 93% < 96.7%
      });
      const result = analyzeParams(payload, WALLET, false);
      expect(result.messages[0]).toContain('slippage');
    });

    it('runs slippage check when sellFiat is unavailable', () => {
      const payload = makePayload({
        sellTokenFiatAmount: undefined,
        buyTokenFiatAmount: undefined,
        buyTokenAmount: { units: '10' } as never,
        minimumReceiveBuyAmount: { units: '9.3' } as never, // 93% < 96.7%
      });
      const result = analyzeParams(payload, WALLET, false);
      expect(result.messages[0]).toContain('slippage');
    });
  });

  describe('fiat deviation', () => {
    // NOTE: fiat deviation subtracts partner fee (0.3%), so raw deviation
    // of 1% becomes 0.7%, raw 3% becomes 2.7%, etc.

    it('returns safe for small deviation (< 2% after partner fee)', () => {
      const payload = makePayload({
        sellTokenFiatAmount: '1000',
        buyTokenFiatAmount: '990', // raw 1% → 0.7% after fee
      });
      const result = analyzeParams(payload, WALLET, false);
      expect(result.level).toBe('safe');
      expect(result.fiatDeviation).toBeCloseTo(0.7);
    });

    it('returns warning for deviation >= 2% after partner fee', () => {
      const payload = makePayload({
        sellTokenFiatAmount: '1000',
        buyTokenFiatAmount: '970', // raw 3% → 2.7% after fee
      });
      const result = analyzeParams(payload, WALLET, false);
      expect(result.level).toBe('warning');
      expect(result.fiatDeviation).toBeCloseTo(2.7);
    });

    it('returns danger for deviation >= 5% after partner fee', () => {
      const payload = makePayload({
        sellTokenFiatAmount: '1000',
        buyTokenFiatAmount: '940', // raw 6% → 5.7% after fee
      });
      const result = analyzeParams(payload, WALLET, false);
      expect(result.level).toBe('danger');
      expect(result.fiatDeviation).toBeCloseTo(5.7);
    });

    it('returns blocked for deviation >= 10% after partner fee', () => {
      const payload = makePayload({
        sellTokenFiatAmount: '1000',
        buyTokenFiatAmount: '850', // raw 15% → 14.7% after fee
      });
      const result = analyzeParams(payload, WALLET, false);
      expect(result.level).toBe('blocked');
      expect(result.fiatDeviation).toBeCloseTo(14.7);
    });

    it('flags implausible gain (buyFiat > sellFiat * 1.05)', () => {
      const payload = makePayload({
        sellTokenFiatAmount: '1000',
        buyTokenFiatAmount: '1100',
      });
      const result = analyzeParams(payload, WALLET, false);
      expect(result.messages[0]).toContain('Fiat values appear invalid');
      expect(result.fiatDeviation).toBeNull();
    });

    it('handles missing fiat values gracefully', () => {
      const payload = makePayload({
        sellTokenFiatAmount: undefined,
        buyTokenFiatAmount: undefined,
      });
      const result = analyzeParams(payload, WALLET, false);
      expect(result.level).toBe('safe');
      expect(result.fiatDeviation).toBeNull();
    });
  });
});

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
