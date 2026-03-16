import { getMonthRange } from '../apy-data/treasury-apy';

describe('getMonthRange', () => {
  it('returns a single month when from and to are in the same month', () => {
    const from = new Date('2026-03-05');
    const to = new Date('2026-03-25');
    expect(getMonthRange(from, to)).toEqual(['202603']);
  });

  it('returns two months for a 1M range within a single year', () => {
    // Feb 10 → Mar 10: spans Feb and Mar
    const from = new Date('2026-02-10');
    const to = new Date('2026-03-10');
    expect(getMonthRange(from, to)).toEqual(['202602', '202603']);
  });

  it('returns four months for a 3M range crossing the year boundary', () => {
    // Dec 5, 2025 → Mar 2, 2026
    const from = new Date('2025-12-05');
    const to = new Date('2026-03-02');
    expect(getMonthRange(from, to)).toEqual([
      '202512',
      '202601',
      '202602',
      '202603',
    ]);
  });

  it('returns months for a range entirely within one month', () => {
    const from = new Date('2026-01-01');
    const to = new Date('2026-01-31');
    expect(getMonthRange(from, to)).toEqual(['202601']);
  });

  it('returns months in ascending order', () => {
    const from = new Date('2025-11-01');
    const to = new Date('2026-02-01');
    const result = getMonthRange(from, to);
    expect(result).toEqual(['202511', '202512', '202601', '202602']);
    // Verify ascending order
    for (let i = 1; i < result.length; i++) {
      expect(result[i] > result[i - 1]).toBe(true);
    }
  });

  it('pads single-digit months with leading zero', () => {
    const from = new Date('2026-01-01');
    const to = new Date('2026-09-01');
    const result = getMonthRange(from, to);
    expect(result).toHaveLength(9);
    expect(result[0]).toBe('202601');
    expect(result[8]).toBe('202609');
  });

  it('returns exactly 1 month for a 1M view that stays within the current month', () => {
    // Mar 2 → Mar 2: 1-day range in same month
    const from = new Date('2026-03-02');
    const to = new Date('2026-03-02');
    expect(getMonthRange(from, to)).toEqual(['202603']);
  });
});
