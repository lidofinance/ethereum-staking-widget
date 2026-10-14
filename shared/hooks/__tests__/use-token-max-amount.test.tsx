import { renderHook } from 'features/stake/shared/__tests__/stake-test-utils';

const state = vi.hoisted(() => ({
  maxGasPrice: undefined as bigint | undefined,
}));

vi.mock('modules/web3', () => ({
  useMaxGasPrice: () => ({ maxGasPrice: state.maxGasPrice }),
}));

import { useTokenMaxAmount } from '../use-token-max-amount';

const P = 10n ** 18n;
const BALANCE = 10n * P;
const PADDING = P / 100n;
const GAS_LIMIT = 100_000n;
const GAS_PRICE = 50n * 10n ** 9n;
const GAS_COST = 3n * 10n ** 15n;

const maxAmount = (args: Parameters<typeof useTokenMaxAmount>[0]) =>
  renderHook(() => useTokenMaxAmount(args));

beforeEach(() => {
  state.maxGasPrice = GAS_PRICE;
});

describe('useTokenMaxAmount', () => {
  it('offers the whole balance when no padding is asked for', () => {
    expect(maxAmount({ balance: BALANCE })).toBe(BALANCE);
  });

  it('caps the balance at the limit', () => {
    expect(maxAmount({ balance: BALANCE, limit: P })).toBe(P);
  });

  it('withholds the amount while loading or without a balance', () => {
    expect(maxAmount({ balance: BALANCE, isLoading: true })).toBeUndefined();
    expect(maxAmount({})).toBeUndefined();
    expect(maxAmount({ balance: 0n })).toBeUndefined();
  });

  describe('padded', () => {
    it('reserves the padding and the gas priced at the chain-wide max', () => {
      expect(
        maxAmount({
          balance: BALANCE,
          isPadded: true,
          padding: PADDING,
          gasLimit: GAS_LIMIT,
        }),
      ).toBe(BALANCE - PADDING - GAS_LIMIT * GAS_PRICE);
    });

    it('prefers a quoted cost over the gas limit at the chain-wide price', () => {
      expect(
        maxAmount({
          balance: BALANCE,
          isPadded: true,
          padding: PADDING,
          gasLimit: GAS_LIMIT,
          gasCost: GAS_COST,
        }),
      ).toBe(BALANCE - PADDING - GAS_COST);
    });

    it('treats a zero quoted cost as a cost, not as missing data', () => {
      expect(
        maxAmount({
          balance: BALANCE,
          isPadded: true,
          padding: PADDING,
          gasLimit: GAS_LIMIT,
          gasCost: 0n,
        }),
      ).toBe(BALANCE - PADDING);
    });

    it('withholds the amount until a cost is known', () => {
      state.maxGasPrice = undefined;
      expect(
        maxAmount({ balance: BALANCE, isPadded: true, gasLimit: GAS_LIMIT }),
      ).toBeUndefined();
      expect(maxAmount({ balance: BALANCE, isPadded: true })).toBeUndefined();
    });

    it('floors at zero when the reserve exceeds the balance', () => {
      expect(
        maxAmount({
          balance: GAS_COST / 2n,
          isPadded: true,
          gasCost: GAS_COST,
        }),
      ).toBe(0n);
    });

    it('applies the limit after the reserve', () => {
      expect(
        maxAmount({
          balance: BALANCE,
          isPadded: true,
          gasCost: GAS_COST,
          limit: P,
        }),
      ).toBe(P);
    });
  });
});
