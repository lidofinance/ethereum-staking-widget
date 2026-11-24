import { isRefreshQuery } from '../queries';

describe('isRefreshQuery', () => {
  it('is true for the positions and rewards reads of the portfolio', () => {
    expect(isRefreshQuery({ queryKey: ['portfolio', 'positions', {}] })).toBe(
      true,
    );
    expect(isRefreshQuery({ queryKey: ['portfolio', 'rewards', {}] })).toBe(
      true,
    );
  });

  it('is false for history, chain reads and other scopes', () => {
    expect(
      isRefreshQuery({ queryKey: ['portfolio', 'transactions', {}] }),
    ).toBe(false);
    expect(
      isRefreshQuery({ queryKey: ['portfolio', 'mainnet-balances', {}] }),
    ).toBe(false);
    expect(isRefreshQuery({ queryKey: ['rewards', 'positions'] })).toBe(false);
    expect(isRefreshQuery({ queryKey: [] })).toBe(false);
  });
});
