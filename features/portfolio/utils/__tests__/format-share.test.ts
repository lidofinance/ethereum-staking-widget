import { formatShare } from '../format-share';

describe('formatShare', () => {
  it('shows two decimals', () => {
    expect(formatShare(0.2214)).toBe('22.14%');
    expect(formatShare(1)).toBe('100.00%');
  });

  it('shows 0% for an empty portfolio', () => {
    expect(formatShare(Number.NaN)).toBe('0.00%');
    expect(formatShare(Number.POSITIVE_INFINITY)).toBe('0.00%');
  });
});
