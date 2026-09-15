import { describe, expect, it } from 'vitest';

import { formatActiveFees, formatFeeD6 } from './format-fee-d6';

describe('formatFeeD6', () => {
  it('formats the current EarnETH fees', () => {
    expect(formatFeeD6(2000)).toBe('0.2');
    expect(formatFeeD6(150000)).toBe('15');
  });

  it('formats zero without decimals', () => {
    expect(formatFeeD6(0)).toBe('0');
  });

  it('formats the contract caps', () => {
    expect(formatFeeD6(5000)).toBe('0.5');
    expect(formatFeeD6(200000)).toBe('20');
  });

  it('formats 100%', () => {
    expect(formatFeeD6(1_000_000)).toBe('100');
  });

  it('keeps sub-basis-point precision', () => {
    expect(formatFeeD6(1)).toBe('0.0001');
    expect(formatFeeD6(1234)).toBe('0.1234');
  });

  it('trims trailing zeros', () => {
    expect(formatFeeD6(100000)).toBe('10');
    expect(formatFeeD6(10500)).toBe('1.05');
  });
});

describe('formatActiveFees', () => {
  it('joins both fees into the display string', () => {
    expect(
      formatActiveFees({ protocolFeeD6: 2000, performanceFeeD6: 150000 }),
    ).toBe('0.2% AUM + 15% performance');
  });

  it('renders zero fees literally', () => {
    expect(formatActiveFees({ protocolFeeD6: 0, performanceFeeD6: 0 })).toBe(
      '0% AUM + 0% performance',
    );
  });
});
