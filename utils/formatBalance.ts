import { BigNumber } from '@ethersproject/bignumber';
import { formatEther } from '@ethersproject/units';
import { Zero } from '@ethersproject/constants';
import { useMemo } from 'react';

type FormatBalance = (
  balance?: BigNumber,
  maxDecimalDigits?: number,
  params?: {
    adaptive?: boolean;
    elipsis?: boolean;
  },
) => string;

export const formatBalance: FormatBalance = (
  balance = Zero,
  maxDecimalDigits = 4,
  { adaptive, elipsis } = {},
) => {
  const balanceString = formatEther(balance);

  if (balanceString.includes('.')) {
    const parts = balanceString.split('.');
    if (maxDecimalDigits === 0) return parts[0];
    let decimal = parts[1];
    if (adaptive) {
      const nonZeroIdx = decimal.split('').findIndex((v) => v !== '0');
      const sliceAt = Math.max(maxDecimalDigits, nonZeroIdx + 1);
      decimal = decimal.slice(0, sliceAt);
    } else {
      decimal = decimal.slice(0, maxDecimalDigits);
    }
    const elipsisText =
      elipsis && decimal.length < parts[1].length ? '...' : '';
    return `${parts[0]}.${decimal}${elipsisText}`;
  }

  return balanceString;
};

export const formatBalanceWithTrimmed = (
  balance = Zero,
  maxDecimalDigits = 4,
  maxTotalLength = 30,
) => {
  const balanceString = formatEther(balance);
  let trimmed = balanceString;
  let isTrimmed = false;
  if (balanceString.includes('.')) {
    const parts = balanceString.split('.');
    trimmed = parts[0];
    if (maxDecimalDigits > 0) {
      trimmed += `.${parts[1].slice(0, maxDecimalDigits)}`;
      if (maxDecimalDigits < parts[1].length) isTrimmed = true;
    }
  }

  if (trimmed.length > maxTotalLength - 3) {
    if (trimmed[maxTotalLength - 4] === '.') {
      trimmed = trimmed.slice(0, maxTotalLength - 4);
    } else {
      isTrimmed = true;
      trimmed = trimmed.slice(0, maxTotalLength - 3) + '...';
    }
  }

  return {
    actual: balanceString,
    trimmed,
    isTrimmed,
  };
};

export const useFormattedBalance = (
  balance = Zero,
  maxDecimalDigits = 4,
  maxTotalLength = 30,
) => {
  return useMemo(
    () => formatBalanceWithTrimmed(balance, maxDecimalDigits, maxTotalLength),
    [balance, maxDecimalDigits, maxTotalLength],
  );
};
