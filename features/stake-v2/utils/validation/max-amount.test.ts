import { getMaxAmount } from './max-amount';

describe('getMaxAmount', () => {
  it('the balance, capped by the limit', () => {
    expect(getMaxAmount({ balance: 10n, limit: 7n })).toBe(7n);
    expect(getMaxAmount({ balance: 5n, limit: 7n })).toBe(5n);
  });

  it('padded: keeps gas and padding, then the limit', () => {
    expect(
      getMaxAmount({ balance: 10n, isPadded: true, gasCost: 2n, padding: 1n }),
    ).toBe(7n);
    expect(
      getMaxAmount({
        balance: 10n,
        isPadded: true,
        gasCost: 2n,
        padding: 1n,
        limit: 3n,
      }),
    ).toBe(3n);
  });

  it('never below 0', () => {
    expect(
      getMaxAmount({ balance: 1n, isPadded: true, gasCost: 2n, padding: 1n }),
    ).toBe(0n);
  });
});
