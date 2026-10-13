import { resolveLevel } from '../resolve-level';
import { analyzeParams } from '../analyze-params';
import type { OnTradeParamsPayload } from '../../types';

// stETH and ETH addresses for test fixtures
const STETH = '0xae7ab96520de3a18e5e111b5eaab095312d7fe84';
const WSTETH = '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0';
const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

const makePayload = (
  overrides: Partial<OnTradeParamsPayload> = {},
): OnTradeParamsPayload =>
  ({
    sellToken: { address: STETH, symbol: 'stETH' },
    buyToken: { address: ETH, symbol: 'ETH' },
    sellTokenAmount: { units: '10' },
    buyTokenAmount: { units: '10' },
    minimumReceiveBuyAmount: { units: '9.8' },
    recipient: undefined,
    ...overrides,
  }) as unknown as OnTradeParamsPayload;

// ---------------------------------------------------------------------------
// resolveLevel
// ---------------------------------------------------------------------------
describe('resolveLevel', () => {
  it('returns safe when null', () => {
    expect(resolveLevel(null)).toBe('safe');
  });

  it('returns blocked for oracle deviation >= 4%', () => {
    expect(resolveLevel(4)).toBe('blocked');
    expect(resolveLevel(4.9)).toBe('blocked');
    expect(resolveLevel(50)).toBe('blocked');
  });

  it('returns safe for oracle deviation below 4%', () => {
    expect(resolveLevel(3.9)).toBe('safe');
  });
});

// ---------------------------------------------------------------------------
// analyzeParams
// ---------------------------------------------------------------------------
describe('analyzeParams', () => {
  describe('minimum receive vs quote (STW-COW-QUOTE-01)', () => {
    it('blocks when min receive is far below the quoted buy amount', () => {
      const payload = makePayload({
        buyToken: { address: USDC, symbol: 'USDC' },
        buyTokenAmount: { units: '29910' },
        minimumReceiveBuyAmount: { units: '1' },
      } as Partial<OnTradeParamsPayload>);
      const result = analyzeParams(payload);
      expect(result.level).toBe('blocked');
      expect(result.isStructural).toBe(true);
    });

    it('blocks when min receive implies more than max slippage', () => {
      const payload = makePayload({
        minimumReceiveBuyAmount: { units: '9.69' }, // 3.1% below quote
      } as Partial<OnTradeParamsPayload>);
      expect(analyzeParams(payload).level).toBe('blocked');
    });

    it.each(['.5', '1.', '1.0000000000000000001', 'abc'])(
      'fails closed on an unparseable min receive %p',
      (units) => {
        const payload = makePayload({
          buyToken: { address: USDC, symbol: 'USDC' },
          buyTokenAmount: { units: '29910' },
          minimumReceiveBuyAmount: { units },
        } as Partial<OnTradeParamsPayload>);
        expect(analyzeParams(payload).level).toBe('blocked');
      },
    );

    it('fails closed when the quote itself is unparseable', () => {
      const payload = makePayload({
        buyTokenAmount: { units: 'abc' },
        minimumReceiveBuyAmount: { units: '1' },
      } as Partial<OnTradeParamsPayload>);
      expect(analyzeParams(payload).level).toBe('blocked');
    });

    it('skips the check when no quote is present (approval pre-check)', () => {
      const payload = makePayload({
        buyTokenAmount: undefined,
        minimumReceiveBuyAmount: undefined,
      });
      expect(analyzeParams(payload).level).toBe('safe');
    });

    it('allows min receive at exactly max slippage', () => {
      const payload = makePayload({
        minimumReceiveBuyAmount: { units: '9.7' }, // 3.0% below quote
      } as Partial<OnTradeParamsPayload>);
      expect(analyzeParams(payload).level).toBe('safe');
    });

    it('allows truncated atoms at max slippage (6-decimal token)', () => {
      const payload = makePayload({
        buyToken: { address: USDC, symbol: 'USDC' },
        buyTokenAmount: { units: '29910.123457' },
        minimumReceiveBuyAmount: { units: '29012.819753' }, // floor(x * 0.97)
      } as Partial<OnTradeParamsPayload>);
      expect(analyzeParams(payload).level).toBe('safe');
    });
  });

  describe('token presence', () => {
    it('returns blocked when sell token is missing', () => {
      const payload = makePayload({ sellToken: undefined });
      const result = analyzeParams(payload);
      expect(result.level).toBe('blocked');
      expect(result.isStructural).toBe(true);
    });

    it('returns blocked when buy token is missing', () => {
      const payload = makePayload({ buyToken: undefined });
      const result = analyzeParams(payload);
      expect(result.level).toBe('blocked');
      expect(result.isStructural).toBe(true);
    });

    it('accepts valid stETH → ETH pair', () => {
      const result = analyzeParams(makePayload());
      expect(result.level).toBe('safe');
      expect(result.isStructural).toBe(false);
    });

    it('accepts wstETH → USDC pair', () => {
      const payload = makePayload({
        sellToken: { address: WSTETH, symbol: 'wstETH' } as never,
        buyToken: { address: USDC, symbol: 'USDC' } as never,
      });
      const result = analyzeParams(payload);
      expect(result.level).toBe('safe');
    });
  });

  describe('max sell amount', () => {
    it('blocks sell amount > 5000', () => {
      const payload = makePayload({
        sellTokenAmount: { units: '5001' } as never,
      });
      const result = analyzeParams(payload);
      expect(result.level).toBe('blocked');
      expect(result.isStructural).toBe(true);
      expect(result.messages[0]).toContain('capped at');
    });

    it('allows sell amount = 5000', () => {
      const payload = makePayload({
        sellTokenAmount: { units: '5000' } as never,
      });
      const result = analyzeParams(payload);
      expect(result.level).toBe('safe');
    });
  });
});
