import {
  verifyOrderFields,
  verifyOrderAmounts,
  parseOrderFromSignRequest,
} from '../utils/verify-order';
import type {
  OrderFields,
  ValidatedTradeSnapshot,
} from '../utils/verify-order';

const STETH = '0xae7ab96520de3a18e5e111b5eaab095312d7fe84';
const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const UNKNOWN = '0x0000000000000000000000000000000000000001';
const WALLET = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

const makeOrder = (overrides: Partial<OrderFields> = {}): OrderFields => ({
  sellToken: STETH,
  buyToken: ETH,
  receiver: WALLET,
  sellAmount: '100000000000000000', // 0.1 stETH in wei
  buyAmount: '100000000000000000',
  ...overrides,
});

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
// verifyOrderFields
// ---------------------------------------------------------------------------
describe('verifyOrderFields', () => {
  it('returns null for valid order', () => {
    expect(verifyOrderFields(makeOrder(), WALLET, false)).toBeNull();
  });

  it('rejects receiver mismatch', () => {
    const order = makeOrder({ receiver: '0xAttacker' });
    expect(verifyOrderFields(order, WALLET, false)).toContain(
      'receiver does not match',
    );
  });

  it('receiver check is case-insensitive', () => {
    const order = makeOrder({ receiver: WALLET.toUpperCase() });
    expect(verifyOrderFields(order, WALLET.toLowerCase(), false)).toBeNull();
  });

  it('rejects invalid sell token on mainnet', () => {
    const order = makeOrder({ sellToken: UNKNOWN });
    expect(verifyOrderFields(order, WALLET, false)).toContain(
      'Invalid sell token',
    );
  });

  it('rejects invalid buy token on mainnet', () => {
    const order = makeOrder({ buyToken: UNKNOWN });
    expect(verifyOrderFields(order, WALLET, false)).toContain(
      'Invalid buy token',
    );
  });

  it('skips token whitelist on testnet', () => {
    const order = makeOrder({ sellToken: UNKNOWN, buyToken: UNKNOWN });
    expect(verifyOrderFields(order, WALLET, true)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// verifyOrderAmounts
// ---------------------------------------------------------------------------
describe('verifyOrderAmounts', () => {
  it('returns null when amounts match exactly', () => {
    expect(verifyOrderAmounts(makeOrder(), makeSnapshot())).toBeNull();
  });

  it('returns null when order sells less than validated', () => {
    const order = makeOrder({ sellAmount: '50000000000000000' }); // 0.05
    expect(verifyOrderAmounts(order, makeSnapshot())).toBeNull();
  });

  it('returns null when order buys more than validated minimum', () => {
    const order = makeOrder({ buyAmount: '200000000000000000' }); // 0.2
    expect(verifyOrderAmounts(order, makeSnapshot())).toBeNull();
  });

  it('rejects when order sells more than validated', () => {
    const order = makeOrder({ sellAmount: '200000000000000000' }); // 0.2
    expect(verifyOrderAmounts(order, makeSnapshot())).toContain(
      'sells more than validated',
    );
  });

  it('rejects when order buys less than validated minimum', () => {
    const order = makeOrder({ buyAmount: '50000000000000000' }); // 0.05
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

  it('handles malformed sellAmount gracefully', () => {
    const order = makeOrder({ sellAmount: 'not-a-number' });
    expect(verifyOrderAmounts(order, makeSnapshot())).toContain(
      'Invalid order amount format',
    );
  });

  it('handles malformed buyAmount gracefully', () => {
    const order = makeOrder({ buyAmount: '1.5' });
    expect(verifyOrderAmounts(order, makeSnapshot())).toContain(
      'Invalid order amount format',
    );
  });

  it('skips amount check when token decimals unknown (unknown sell token)', () => {
    const order = makeOrder({ sellToken: UNKNOWN, sellAmount: '999999' });
    const snapshot = makeSnapshot({ sellToken: UNKNOWN });
    // unitsToRaw returns null for unknown token → check is skipped → null
    expect(verifyOrderAmounts(order, snapshot)).toBeNull();
  });

  describe('USDC (6 decimals)', () => {
    const usdcOrder = makeOrder({
      sellToken: STETH,
      buyToken: USDC,
      sellAmount: '100000000000000000', // 0.1 stETH
      buyAmount: '200000000', // 200 USDC (6 decimals)
    });
    const usdcSnapshot = makeSnapshot({
      buyToken: USDC,
      buyAmountMinUnits: '200',
    });

    it('accepts exact USDC amount', () => {
      expect(verifyOrderAmounts(usdcOrder, usdcSnapshot)).toBeNull();
    });

    it('rejects USDC amount below minimum', () => {
      const order = { ...usdcOrder, buyAmount: '199000000' }; // 199 USDC
      expect(verifyOrderAmounts(order, usdcSnapshot)).toContain(
        'minimum receive is less',
      );
    });
  });
});

// ---------------------------------------------------------------------------
// parseOrderFromSignRequest
// ---------------------------------------------------------------------------
describe('parseOrderFromSignRequest', () => {
  const validTypedData = {
    primaryType: 'Order',
    message: {
      sellToken: STETH,
      buyToken: ETH,
      receiver: WALLET,
      sellAmount: '100000000000000000',
      buyAmount: '100000000000000000',
    },
  };

  it('parses valid CowSwap order from object', () => {
    const result = parseOrderFromSignRequest([WALLET, validTypedData]);
    expect(result).toEqual(validTypedData.message);
  });

  it('parses valid CowSwap order from JSON string', () => {
    const result = parseOrderFromSignRequest([
      WALLET,
      JSON.stringify(validTypedData),
    ]);
    expect(result).toEqual(validTypedData.message);
  });

  it('returns null for non-Order primaryType', () => {
    const data = { ...validTypedData, primaryType: 'Permit' };
    expect(parseOrderFromSignRequest([WALLET, data])).toBeNull();
  });

  it('returns null for missing message fields', () => {
    const data = {
      primaryType: 'Order',
      message: { sellToken: STETH }, // incomplete
    };
    expect(parseOrderFromSignRequest([WALLET, data])).toBeNull();
  });

  it('returns null for malformed JSON string', () => {
    expect(parseOrderFromSignRequest([WALLET, 'not-json'])).toBeNull();
  });

  it('returns null for null input', () => {
    expect(parseOrderFromSignRequest(null)).toBeNull();
  });

  it('returns null for empty array', () => {
    expect(parseOrderFromSignRequest([])).toBeNull();
  });
});
