import type { PortfolioRow } from '../../types';
import { mergeRows, getRowId, sortByValue } from '../merge-rows';

const row = (overrides: Partial<PortfolioRow> = {}): PortfolioRow => ({
  key: 'key',
  symbol: 'ETH',
  name: 'Ether',
  amount: 1n,
  decimals: 18,
  valueUsd: 100,
  apr: null,
  rewardsUsd: null,
  rewardsAmount: null,
  rewardsSymbol: null,
  chains: [
    {
      slug: 'ethereum',
      name: 'Ethereum',
      address: null,
      isNative: true,
      amount: 1n,
      decimals: 18,
      amountFloat: null,
      valueUsd: 100,
    },
  ],
  ...overrides,
});

describe('mergeRows', () => {
  it('joins a verified token from several chains into one row', () => {
    const [merged, ...rest] = mergeRows([
      row({ key: 'a', iconToken: 'eth' }),
      row({
        key: 'b',
        iconToken: 'eth',
        amount: 2n,
        valueUsd: 200,
        chains: [
          {
            slug: 'base',
            name: 'Base',
            address: null,
            isNative: true,
            amount: 2n,
            decimals: 18,
            amountFloat: null,
            valueUsd: 200,
          },
        ],
      }),
    ]);
    expect(rest).toEqual([]);
    expect(merged.key).toBe('a');
    expect(merged.amount).toBe(3n);
    expect(merged.valueUsd).toBe(300);
    expect(merged.chains.map((chain) => chain.slug)).toEqual([
      'ethereum',
      'base',
    ]);
  });

  it('keeps unknown tokens with the same symbol apart', () => {
    expect(mergeRows([row({ key: 'a' }), row({ key: 'b' })])).toHaveLength(2);
  });

  it('drops the amount when decimals differ', () => {
    const [merged] = mergeRows([
      row({ key: 'a', iconToken: 'usdc', decimals: 6 }),
      row({ key: 'b', iconToken: 'usdc', decimals: 18 }),
    ]);
    expect(merged.amount).toBeNull();
    expect(merged.valueUsd).toBe(200);
  });

  it('sums rewards of the same token', () => {
    const [merged] = mergeRows([
      row({
        key: 'a',
        iconToken: 'wsteth',
        rewardsUsd: 10,
        rewardsAmount: 1,
        rewardsSymbol: 'stETH',
      }),
      row({
        key: 'b',
        iconToken: 'wsteth',
        rewardsUsd: 5,
        rewardsAmount: 0.5,
        rewardsSymbol: 'stETH',
      }),
    ]);
    expect(merged.rewardsUsd).toBe(15);
    expect(merged.rewardsAmount).toBe(1.5);
  });
});

describe('sortByValue', () => {
  it('puts the largest value first', () => {
    const sorted = sortByValue([
      row({ key: 'a', valueUsd: 1 }),
      row({ key: 'b', valueUsd: null }),
      row({ key: 'c', valueUsd: 50 }),
    ]);
    expect(sorted.map((sortedRow) => sortedRow.key)).toEqual(['c', 'a', 'b']);
  });
});

describe('getRowId', () => {
  it('is the known token, so it survives a change of chains', () => {
    expect(getRowId(row({ key: 'api-id-1', iconToken: 'wsteth' }))).toBe(
      'wsteth',
    );
  });

  it('is the row key for a token with no known icon', () => {
    expect(getRowId(row({ key: 'api-id-2' }))).toBe('api-id-2');
  });
});
