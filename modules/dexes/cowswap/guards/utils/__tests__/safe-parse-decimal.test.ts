import { safeParseDecimal } from '../safe-parse-decimal';

// ---------------------------------------------------------------------------
// safeParseDecimal
// ---------------------------------------------------------------------------
describe('safeParseDecimal', () => {
  it('parses valid integers', () => {
    expect(safeParseDecimal('42')).toBe(42);
    expect(safeParseDecimal('0')).toBe(0);
  });

  it('parses valid decimals', () => {
    expect(safeParseDecimal('1.5')).toBe(1.5);
    expect(safeParseDecimal('0.001')).toBe(0.001);
  });

  it('returns null for null/undefined/empty', () => {
    expect(safeParseDecimal(null)).toBeNull();
    expect(safeParseDecimal(undefined)).toBeNull();
    expect(safeParseDecimal('')).toBeNull();
  });

  it('rejects scientific notation', () => {
    expect(safeParseDecimal('1e18')).toBeNull();
    expect(safeParseDecimal('1E10')).toBeNull();
    expect(safeParseDecimal('1e+5')).toBeNull();
  });

  it('rejects partial parses', () => {
    expect(safeParseDecimal('1000abc')).toBeNull();
    expect(safeParseDecimal('abc')).toBeNull();
    expect(safeParseDecimal('12.34.56')).toBeNull();
  });

  it('rejects negative numbers', () => {
    expect(safeParseDecimal('-1')).toBeNull();
    expect(safeParseDecimal('-0.5')).toBeNull();
  });

  it('handles large valid numbers', () => {
    expect(safeParseDecimal('99999999999999999999')).toBe(1e20);
  });

  it('rejects numbers exceeding 20 integer digits', () => {
    expect(safeParseDecimal('123456789012345678901')).toBeNull();
  });
});
