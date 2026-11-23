import type { PortfolioRow } from '../../types';
import { getPortfolioSummary } from '../get-portfolio-summary';

const row = (overrides: Partial<PortfolioRow> = {}): PortfolioRow => ({
  key: 'row',
  symbol: 'stETH',
  name: 'Lido Staked ETH',
  amount: 1n,
  decimals: 18,
  valueUsd: 100,
  apr: null,
  rewardsUsd: null,
  rewardsAmount: null,
  rewardsSymbol: null,
  chains: [],
  ...overrides,
});

describe('getPortfolioSummary', () => {
  it('sums Lido and other values into net worth', () => {
    const summary = getPortfolioSummary(
      [row({ valueUsd: 300 }), row({ valueUsd: null })],
      [row({ valueUsd: 100 })],
    );
    expect(summary).toMatchObject({
      netWorthUsd: 400,
      lidoUsd: 300,
      otherUsd: 100,
      lidoShare: 0.75,
      otherShare: 0.25,
    });
  });

  it('keeps shares within 0..1 when other holdings carry debt', () => {
    const summary = getPortfolioSummary(
      [row({ valueUsd: 100 })],
      [row({ valueUsd: 50 }), row({ valueUsd: -70 })],
    );
    expect(summary).toMatchObject({
      netWorthUsd: 80,
      otherUsd: -20,
      lidoShare: 1,
      otherShare: 0,
    });
  });

  it('gives Lido its share when debt outweighs everything', () => {
    const summary = getPortfolioSummary(
      [row({ valueUsd: 100 })],
      [row({ valueUsd: 300 }), row({ valueUsd: -500 })],
    );
    expect(summary.netWorthUsd).toBe(-100);
    expect(summary.lidoShare).toBe(1);
    expect(summary.otherShare).toBe(0);
  });

  it('returns null rewards when no row has rewards', () => {
    expect(getPortfolioSummary([row()], []).rewardsUsd).toBeNull();
  });

  it('sums known rewards only', () => {
    const summary = getPortfolioSummary(
      [
        row({ rewardsUsd: 10 }),
        row({ rewardsUsd: null }),
        row({ rewardsUsd: 5 }),
      ],
      [],
    );
    expect(summary.rewardsUsd).toBe(15);
  });

  it('has a zero Lido share for an empty portfolio', () => {
    expect(getPortfolioSummary([], [])).toMatchObject({
      lidoShare: 0,
      otherShare: 0,
    });
  });
});
