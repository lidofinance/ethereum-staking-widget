import type { PortfolioChainAmount } from '../../types';
import { formatChainAmount, formatFullAmount } from '../format-amount';

describe('formatFullAmount', () => {
  it('shows up to 8 decimals without trailing zeros', () => {
    expect(formatFullAmount(12_397_093_410_000_000_000n, 18)).toBe(
      '12.39709341',
    );
    expect(formatFullAmount(5_000_000n, 6)).toBe('5');
  });

  it('does not show dust below the precision as zero', () => {
    expect(formatFullAmount(1n, 18)).toBe('<0.00000001');
    expect(formatFullAmount(9_999_999_999n, 18)).toBe('<0.00000001');
    expect(formatFullAmount(10_000_000_000n, 18)).toBe('0.00000001');
    expect(formatFullAmount(0n, 18)).toBe('0');
    expect(formatFullAmount(1n, 6)).toBe('0.000001');
  });

  it('groups thousands', () => {
    expect(formatFullAmount(10_000_000_000n, 6)).toBe('10,000');
  });

  it('falls back to the float amount or a dash', () => {
    expect(formatFullAmount(null, 18, 1.5)).toBe('1.5');
    expect(formatFullAmount(null, 18)).toBe('—');
  });
});

describe('formatChainAmount', () => {
  const chain = (
    overrides: Partial<PortfolioChainAmount>,
  ): PortfolioChainAmount => ({
    slug: 'ethereum',
    name: 'Ethereum',
    address: null,
    isNative: true,
    amount: null,
    decimals: 18,
    amountFloat: null,
    valueUsd: null,
    ...overrides,
  });

  it('formats the raw amount with the chain decimals', () => {
    expect(formatChainAmount(chain({ amount: 1_500_000n, decimals: 6 }))).toBe(
      '1.5',
    );
  });

  it('prefers the raw amount over the float one', () => {
    expect(
      formatChainAmount(
        chain({ amount: 2_000_000_000_000_000_000n, amountFloat: 9 }),
      ),
    ).toBe('2');
  });

  it('falls back to the float amount, then to a dash', () => {
    expect(formatChainAmount(chain({ amountFloat: 0.25 }))).toBe('0.25');
    expect(formatChainAmount(chain({}))).toBe('—');
  });
});
