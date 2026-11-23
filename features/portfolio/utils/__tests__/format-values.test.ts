import {
  canRefresh,
  formatAprRange,
  formatLastUpdate,
  formatRewardsAmount,
} from '../format-values';

const MINUTE = 60 * 1000;

describe('formatRewardsAmount', () => {
  it('keeps up to six decimals and drops trailing zeros', () => {
    expect(formatRewardsAmount(0.0027504)).toBe('0.00275');
    expect(formatRewardsAmount(0.00000149)).toBe('0.000001');
    expect(formatRewardsAmount(1.5)).toBe('1.5');
    expect(formatRewardsAmount(0)).toBe('0');
  });

  it('groups thousands', () => {
    expect(formatRewardsAmount(1234.5)).toBe('1,234.5');
  });
});

describe('formatAprRange', () => {
  it('shows both ends of a range in the app percent format', () => {
    expect(formatAprRange({ min: 2.3, max: 2.7 })).toBe('2.3% - 2.7%');
    expect(formatAprRange({ min: 2, max: 10.04 })).toBe('2% - 10%');
  });

  it('shows one value when the ends are equal', () => {
    expect(formatAprRange({ min: 2.5, max: 2.5 })).toBe('2.5%');
  });

  it('shows one value when the ends only read the same', () => {
    expect(formatAprRange({ min: 2.61, max: 2.64 })).toBe('2.6%');
  });
});

describe('formatLastUpdate', () => {
  // Jul 9, 2025, 16:30 local time
  const NOW = new Date(2025, 6, 9, 16, 30).getTime();

  it('says "just now" within the first minute', () => {
    expect(formatLastUpdate(NOW, NOW)).toBe('just now');
    expect(formatLastUpdate(NOW - MINUTE + 1, NOW)).toBe('just now');
  });

  it('counts minutes up to an hour', () => {
    expect(formatLastUpdate(NOW - MINUTE, NOW)).toBe('1 min. ago');
    expect(formatLastUpdate(NOW - 60 * MINUTE, NOW)).toBe('60 min. ago');
  });

  it('gives the date of an answer older than an hour', () => {
    expect(formatLastUpdate(NOW - 61 * MINUTE, NOW)).toBe('Jul 9, 2025, 15:29');
    expect(formatLastUpdate(NOW - 3 * 24 * 60 * MINUTE, NOW)).toBe(
      'Jul 6, 2025, 16:30',
    );
  });

  it('treats a clock slightly behind the server as "just now"', () => {
    expect(formatLastUpdate(NOW + 5000, NOW)).toBe('just now');
  });
});

describe('canRefresh', () => {
  const TTL = 2 * MINUTE;
  const NOW = 10 * MINUTE;

  it('is false while the server still keeps the same answer', () => {
    expect(canRefresh(NOW, NOW, TTL)).toBe(false);
    expect(canRefresh(NOW - TTL + 1, NOW, TTL)).toBe(false);
  });

  it('is true once the answer is as old as the server cache', () => {
    expect(canRefresh(NOW - TTL, NOW, TTL)).toBe(true);
    expect(canRefresh(NOW - 5 * TTL, NOW, TTL)).toBe(true);
  });

  it('is true when there is no answer to tell the age of', () => {
    expect(canRefresh(undefined, NOW, TTL)).toBe(true);
  });
});
