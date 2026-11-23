import { FormatPercent, formatPercent } from '../format-percent';

describe('formatPercent', () => {
  it.each([
    [2.4, '2.4%'],
    [2.46, '2.5%'],
    [3, '3%'],
    [10.04, '10%'],
    [0, '0%'],
  ])('percent units: %s -> %s', (value, text) => {
    expect(formatPercent(value, 'percent')).toBe(text);
  });

  it('scales a unit fraction', () => {
    expect(formatPercent(0.0261, 'unit')).toBe('2.6%');
  });
});

describe('FormatPercent', () => {
  it('renders the same text as formatPercent', () => {
    expect(FormatPercent({ value: 2.46, decimals: 'percent' })).toBe('2.5%');
  });

  it('renders the fallback for a missing or infinite value', () => {
    expect(FormatPercent({ value: null, decimals: 'percent' })).toBe('N/A');
    expect(
      FormatPercent({ value: Infinity, decimals: 'percent', fallback: '—' }),
    ).toBe('—');
  });
});
