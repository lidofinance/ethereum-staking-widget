import { parseEther } from 'viem';
import { formatBalance } from '../formatBalance';

describe('formatBalance', () => {
  it('should format balance with default maxDecimalDigits', () => {
    const balance = 1_000_000_000_000_000_000n;
    const expected = {
      actual: '1.0',
      trimmed: '1.0',
      isTrimmed: false,
    };
    const formattedBalance = formatBalance(balance);
    expect(formattedBalance).toEqual(expected);
  });

  it('should format balance with custom maxDecimalDigits', () => {
    const balance = 1_000_000_000_000_000_000n;
    const expected = {
      actual: '1.0',
      trimmed: '1.0',
      isTrimmed: false,
    };
    const formattedBalance = formatBalance(balance, { maxDecimalDigits: 2 });
    expect(formattedBalance).toEqual(expected);
  });

  it('should format balance with zero maxDecimalDigits', () => {
    const balance = 1_000_000_000_000_000_000n;
    const expected = {
      actual: '1.0',
      trimmed: '1',
      isTrimmed: false,
    };
    const formattedBalance = formatBalance(balance, { maxDecimalDigits: 0 });
    expect(formattedBalance).toEqual(expected);
  });

  it('should format balance with adaptiveDecimals', () => {
    const balance = BigInt(parseEther('0.000000111111'));
    const expected = {
      actual: '0.000000111111',
      trimmed: '0.0000001',
      isTrimmed: true,
    };
    const formattedBalance = formatBalance(balance, { adaptiveDecimals: true });
    expect(formattedBalance).toEqual(expected);
  });

  it('should format balance with adaptiveDecimals and trimEllipsis', () => {
    const balance = BigInt(parseEther('0.000000111111'));
    const expected = {
      actual: '0.000000111111',
      trimmed: '0.0000001...',
      isTrimmed: true,
    };
    const formattedBalance = formatBalance(balance, {
      adaptiveDecimals: true,
      trimEllipsis: true,
    });
    expect(formattedBalance).toEqual(expected);
  });

  it('should format balance with max decimal digits and max total length', () => {
    const balance =
      1_000_000_000_000_000_000_000_000_010_000_000_000_000_000_000_000_000n;
    const maxDecimalDigits = 4;
    const maxTotalLength = 30;
    const expected = {
      actual: '1000000000000000000000000010000000.0',
      trimmed: '100000000000000000000000001...',
      isTrimmed: true,
    };
    const result = formatBalance(balance, { maxDecimalDigits, maxTotalLength });
    expect(result).toEqual(expected);
  });

  it('should format balance with max decimal digits and without trimming', () => {
    const balance =
      1_000_000_000_000_000_000_000_000_010_000_000_000_000_000_000_000_000n;
    const maxDecimalDigits = 4;
    const maxTotalLength = 50;
    const expected = {
      actual: '1000000000000000000000000010000000.0',
      trimmed: '1000000000000000000000000010000000.0',
      isTrimmed: false,
    };
    const result = formatBalance(balance, { maxDecimalDigits, maxTotalLength });
    expect(result).toEqual(expected);
  });

  it('should format balance without decimal digits and without trimming', () => {
    const balance = 1_234_567_890_123_456_789n;
    const maxDecimalDigits = 0;
    const maxTotalLength = 50;
    const expected = {
      actual: '1.234567890123456789',
      trimmed: '1',
      isTrimmed: false,
    };
    const result = formatBalance(balance, { maxDecimalDigits, maxTotalLength });
    expect(result).toEqual(expected);
  });

  it('should format balance with decimal digits and with trimming', () => {
    const balance = 12_345_678_901_234_567_890_123_456_789n;
    const maxDecimalDigits = 4;
    const maxTotalLength = 10;
    const expected = {
      actual: '12345678901.234567890123456789',
      trimmed: '1234567...',
      isTrimmed: true,
    };
    const result = formatBalance(balance, { maxDecimalDigits, maxTotalLength });
    expect(result).toEqual(expected);
  });

  it('should format balance with default maxDecimalDigits and maxTotalLength', () => {
    const balance = 1_000_000_000_000_000_000n;
    const expected = {
      actual: '1.0',
      trimmed: '1.0',
      isTrimmed: false,
    };
    const result = formatBalance(balance);
    expect(result).toEqual(expected);
  });

  it('should format balance with custom maxDecimalDigits and maxTotalLength', () => {
    const balance = 1_000_000_000_000_000_000n;
    const maxDecimalDigits = 2;
    const maxTotalLength = 5;
    const expected = {
      actual: '1.0',
      trimmed: '1',
      isTrimmed: false,
    };
    const result = formatBalance(balance, { maxDecimalDigits, maxTotalLength });
    expect(result).toEqual(expected);
  });

  it('should format balance with zero maxDecimalDigits and maxTotalLength', () => {
    const balance = 1_000_000_000_000_000_000n;
    const maxDecimalDigits = 0;
    const maxTotalLength = 2;
    const expected = {
      actual: '1.0',
      trimmed: '...',
      isTrimmed: true,
    };
    const result = formatBalance(balance, { maxDecimalDigits, maxTotalLength });
    expect(result).toEqual(expected);
  });

  it('should format balance with maxTotalLength less than actual length', () => {
    const balance = 100_000_000_000_000_000_000_000n;
    const maxDecimalDigits = 2;
    const maxTotalLength = 3;
    const result = formatBalance(balance, { maxDecimalDigits, maxTotalLength });
    const expected = {
      actual: '100000.0',
      trimmed: '...',
      isTrimmed: true,
    };
    expect(result).toEqual(expected);
  });

  it('should format zero balance', () => {
    const balance = 0n;
    const formattedBalance = formatBalance(balance);
    expect(formattedBalance).toEqual({
      actual: '0.0',
      trimmed: '0.0',
      isTrimmed: false,
    });
  });
});
