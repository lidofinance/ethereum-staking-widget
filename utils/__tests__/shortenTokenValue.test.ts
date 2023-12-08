import { shortenTokenValue } from '../shortenTokenValue';

describe('shortenTokenValue', () => {
  it('should return the correct value for values less than 1000', () => {
    expect(shortenTokenValue(0)).toBe('0');
    expect(shortenTokenValue(100)).toBe('100');
    expect(shortenTokenValue(999)).toBe('999');
  });

  it('should return the correct value for values greater than or equal to 1000', () => {
    expect(shortenTokenValue(1000)).toBe('1K');
    expect(shortenTokenValue(1500)).toBe('1.5K');
    expect(shortenTokenValue(999999)).toBe('1000K');
    expect(shortenTokenValue(1000000)).toBe('1M');
    expect(shortenTokenValue(1000000000)).toBe('1B');
    expect(shortenTokenValue(1000000000000)).toBe('1T');
    expect(shortenTokenValue(1000000000000000)).toBe('1Q');
    expect(shortenTokenValue(1000000000000000000000)).toBe('1000000Q');
  });
});
