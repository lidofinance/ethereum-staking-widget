import { BigNumber } from 'ethers';
import { formatBalanceWithTrimmed, formatBalance } from '../formatBalance';

describe('formatBalanceWithTrimmed', () => {
  it('should format balance with max decimal digits and max total length', () => {
    const balance = BigNumber.from(
      '1000000000000000000000000010000000000000000000000000',
    );
    const maxDecimalDigits = 4;
    const maxTotalLength = 30;
    const expected = {
      actual: '1000000000000000000000000010000000.0',
      trimmed: '100000000000000000000000001...',
      isTrimmed: true,
    };
    const result = formatBalanceWithTrimmed(
      balance,
      maxDecimalDigits,
      maxTotalLength,
    );
    expect(result).toEqual(expected);
  });

  it('should format balance with max decimal digits and without trimming', () => {
    const balance = BigNumber.from(
      '1000000000000000000000000010000000000000000000000000',
    );
    const maxDecimalDigits = 4;
    const maxTotalLength = 50;
    const expected = {
      actual: '1000000000000000000000000010000000.0',
      trimmed: '1000000000000000000000000010000000.0',
      isTrimmed: false,
    };
    const result = formatBalanceWithTrimmed(
      balance,
      maxDecimalDigits,
      maxTotalLength,
    );
    expect(result).toEqual(expected);
  });

  it('should format balance without decimal digits and without trimming', () => {
    const balance = BigNumber.from('1234567890123456789');
    const maxDecimalDigits = 0;
    const maxTotalLength = 50;
    const expected = {
      actual: '1.234567890123456789',
      trimmed: '1',
      isTrimmed: false,
    };
    const result = formatBalanceWithTrimmed(
      balance,
      maxDecimalDigits,
      maxTotalLength,
    );
    expect(result).toEqual(expected);
  });

  it('should format balance with decimal digits and with trimming', () => {
    const balance = BigNumber.from('12345678901234567890123456789');
    const maxDecimalDigits = 4;
    const maxTotalLength = 10;
    const expected = {
      actual: '12345678901.234567890123456789',
      trimmed: '1234567...',
      isTrimmed: true,
    };
    const result = formatBalanceWithTrimmed(
      balance,
      maxDecimalDigits,
      maxTotalLength,
    );
    expect(result).toEqual(expected);
  });

  it('should format balance with default maxDecimalDigits and maxTotalLength', () => {
    const balance = BigNumber.from('1000000000000000000');
    const expected = {
      actual: '1.0',
      trimmed: '1.0',
      isTrimmed: false,
    };
    const result = formatBalanceWithTrimmed(balance);
    expect(result).toEqual(expected);
  });

  it('should format balance with custom maxDecimalDigits and maxTotalLength', () => {
    const balance = BigNumber.from('1000000000000000000');
    const maxDecimalDigits = 2;
    const maxTotalLength = 5;
    const expected = {
      actual: '1.0',
      trimmed: '1',
      isTrimmed: false,
    };
    const result = formatBalanceWithTrimmed(
      balance,
      maxDecimalDigits,
      maxTotalLength,
    );
    expect(result).toEqual(expected);
  });

  it('should format balance with zero maxDecimalDigits and maxTotalLength', () => {
    const balance = BigNumber.from('1000000000000000000');
    const maxDecimalDigits = 0;
    const maxTotalLength = 2;
    const expected = {
      actual: '1.0',
      trimmed: '...',
      isTrimmed: true,
    };
    const result = formatBalanceWithTrimmed(
      balance,
      maxDecimalDigits,
      maxTotalLength,
    );
    expect(result).toEqual(expected);
  });

  it('should format balance with maxTotalLength less than actual length', () => {
    const balance = BigNumber.from('100000000000000000000000');
    const maxDecimalDigits = 2;
    const maxTotalLength = 3;
    const result = formatBalanceWithTrimmed(
      balance,
      maxDecimalDigits,
      maxTotalLength,
    );
    const expected = {
      actual: '100000.0',
      trimmed: '...',
      isTrimmed: true,
    };
    expect(result).toEqual(expected);
  });

  it('should format zero balance', () => {
    const balance = BigNumber.from('0');
    const formattedBalance = formatBalanceWithTrimmed(balance);
    expect(formattedBalance).toEqual({
      actual: '0.0',
      trimmed: '0.0',
      isTrimmed: false,
    });
  });
});

describe('formatBalance', () => {
  it('should format balance with default maxDecimalDigits', () => {
    const balance = BigNumber.from('1000000000000000000');
    const formattedBalance = formatBalance(balance);
    expect(formattedBalance).toEqual('1.0');
  });

  it('should format balance with custom maxDecimalDigits', () => {
    const balance = BigNumber.from('1000000000000000000');
    const formattedBalance = formatBalance(balance, 2);
    expect(formattedBalance).toEqual('1.0');
  });

  it('should format balance with zero maxDecimalDigits', () => {
    const balance = BigNumber.from('1000000000000000000');
    const formattedBalance = formatBalance(balance, 0);
    expect(formattedBalance).toEqual('1');
  });

  it('should format zero balance', () => {
    const balance = BigNumber.from('0');
    const formattedBalance = formatBalance(balance);
    expect(formattedBalance).toEqual('0.0');
  });
});
