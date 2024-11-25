import { useMemo } from 'react';
import { formatEther } from 'viem';
// Tests failed if import import { ZERO } from 'modules/web3';
import { ZERO } from 'modules/web3/consts/units';

export type FormatBalanceArgs = {
  maxDecimalDigits?: number;
  adaptiveDecimals?: boolean;
  maxTotalLength?: number;
  trimEllipsis?: boolean;
};

export const formatBalance = (
  balance: bigint = ZERO,
  {
    maxDecimalDigits = 4,
    maxTotalLength,
    adaptiveDecimals,
    trimEllipsis,
  }: FormatBalanceArgs = {},
) => {
  let actual = formatEther(balance);
  // the 'formatEther' from 'viem' returns without '.0' - decimals part (if the number is greater than 0 and does not have a decimal part)
  if (!actual.includes('.')) {
    actual += '.0';
  }

  let trimmed = actual;

  let isTrimmed = false;

  if (actual.includes('.')) {
    const parts = actual.split('.');
    const integer = parts[0];
    let decimal = parts[1];

    if (maxDecimalDigits > 0) {
      if (adaptiveDecimals) {
        const nonZeroIdx = decimal.split('').findIndex((v) => v !== '0');
        const sliceAt = Math.max(maxDecimalDigits, nonZeroIdx + 1);
        decimal = decimal.slice(0, sliceAt);
      } else {
        decimal = decimal.slice(0, maxDecimalDigits);
      }

      trimmed = `${integer}.${decimal}`;
      if (decimal.length < parts[1].length) {
        isTrimmed = true;
        if (trimEllipsis) trimmed += '...';
      }
    } else {
      trimmed = integer;
    }
  }

  if (maxTotalLength && trimmed.length > maxTotalLength - 3) {
    if (trimmed[maxTotalLength - 4] === '.') {
      trimmed = trimmed.slice(0, maxTotalLength - 4);
    } else {
      isTrimmed = true;
      trimmed = trimmed.slice(0, maxTotalLength - 3) + '...';
    }
  }

  return {
    actual,
    trimmed,
    isTrimmed,
  };
};

export const useFormattedBalance: typeof formatBalance = (
  balance = ZERO,
  { maxDecimalDigits = 4, maxTotalLength, adaptiveDecimals, trimEllipsis } = {},
) => {
  return useMemo(
    () =>
      formatBalance(balance, {
        maxDecimalDigits,
        maxTotalLength,
        adaptiveDecimals,
        trimEllipsis,
      }),
    [adaptiveDecimals, balance, trimEllipsis, maxDecimalDigits, maxTotalLength],
  );
};
