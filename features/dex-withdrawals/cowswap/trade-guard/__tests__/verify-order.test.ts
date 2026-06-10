import { verifyOrderAmounts } from '../utils/verify-order';
import type { ValidatedTradeSnapshot } from '../utils/verify-order';
import type { OrderData } from '../../validate-tx';

const STETH = '0xae7ab96520de3a18e5e111b5eaab095312d7fe84' as `0x${string}`;
const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' as `0x${string}`;
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as `0x${string}`;
const UNKNOWN = '0x0000000000000000000000000000000000000001' as `0x${string}`;

const makeOrder = (overrides: Partial<OrderData> = {}): OrderData =>
  ({
    sellToken: STETH,
    buyToken: ETH,
    sellAmount: 100000000000000000n, // 0.1 stETH in wei
    buyAmount: 100000000000000000n,
    ...overrides,
  }) as OrderData;

const makeSnapshot = (
  overrides: Partial<ValidatedTradeSnapshot> = {},
): ValidatedTradeSnapshot => ({
  sellToken: STETH,
  buyToken: ETH,
  sellAmountUnits: '0.1',
  buyAmountMinUnits: '0.1',
  ...overrides,
});

// ---------------------------------------------------------------------------
// verifyOrderAmounts
// ---------------------------------------------------------------------------
describe('verifyOrderAmounts', () => {
  it('returns null when amounts match exactly', () => {
    expect(verifyOrderAmounts(makeOrder(), makeSnapshot())).toBeNull();
  });

  it('returns null when order sells less than validated', () => {
    const order = makeOrder({ sellAmount: 50000000000000000n }); // 0.05
    expect(verifyOrderAmounts(order, makeSnapshot())).toBeNull();
  });

  it('returns null when order buys more than validated minimum', () => {
    const order = makeOrder({ buyAmount: 200000000000000000n }); // 0.2
    expect(verifyOrderAmounts(order, makeSnapshot())).toBeNull();
  });

  it('rejects when order sells more than validated', () => {
    const order = makeOrder({ sellAmount: 200000000000000000n }); // 0.2
    expect(verifyOrderAmounts(order, makeSnapshot())).toContain(
      'sells more than validated',
    );
  });

  it('rejects when order buys less than validated minimum', () => {
    const order = makeOrder({ buyAmount: 50000000000000000n }); // 0.05
    expect(verifyOrderAmounts(order, makeSnapshot())).toContain(
      'minimum receive is less',
    );
  });

  it('rejects sell token mismatch', () => {
    const order = makeOrder({ sellToken: USDC });
    expect(verifyOrderAmounts(order, makeSnapshot())).toContain(
      'Sell token in order differs',
    );
  });

  it('rejects buy token mismatch', () => {
    const order = makeOrder({ buyToken: USDC });
    expect(verifyOrderAmounts(order, makeSnapshot())).toContain(
      'Buy token in order differs',
    );
  });

  it('rejects when token decimals unknown (fail-closed)', () => {
    const order = makeOrder({ sellToken: UNKNOWN, sellAmount: 999999n });
    const snapshot = makeSnapshot({ sellToken: UNKNOWN });
    expect(verifyOrderAmounts(order, snapshot)).toContain(
      'token decimals unknown',
    );
  });

  describe('USDC (6 decimals)', () => {
    const usdcOrder = makeOrder({
      sellToken: STETH,
      buyToken: USDC,
      sellAmount: 100000000000000000n, // 0.1 stETH
      buyAmount: 200000000n, // 200 USDC (6 decimals)
    });
    const usdcSnapshot = makeSnapshot({
      buyToken: USDC,
      buyAmountMinUnits: '200',
    });

    it('accepts exact USDC amount', () => {
      expect(verifyOrderAmounts(usdcOrder, usdcSnapshot)).toBeNull();
    });

    it('rejects USDC amount below minimum', () => {
      const order = { ...usdcOrder, buyAmount: 199000000n }; // 199 USDC
      expect(verifyOrderAmounts(order, usdcSnapshot)).toContain(
        'minimum receive is less',
      );
    });
  });
});
