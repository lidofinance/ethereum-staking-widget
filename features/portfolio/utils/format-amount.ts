import { formatUnits } from 'viem';

import { config } from 'config';

import type { PortfolioChainAmount } from '../types';

const MAX_DECIMALS = 8;

// 12.39709341: full precision up to 8 decimals, as in the design
export const formatFullAmount = (
  amount: bigint | null,
  decimals: number,
  fallbackAmount: number | null = null,
): string => {
  if (amount == null) {
    return fallbackAmount == null
      ? '—'
      : fallbackAmount.toLocaleString(config.LOCALE, {
          maximumFractionDigits: MAX_DECIMALS,
        });
  }
  const [integerPart, fractionPart = ''] = formatUnits(amount, decimals).split(
    '.',
  );
  const trimmedFraction = fractionPart
    .slice(0, MAX_DECIMALS)
    .replace(/0+$/, '');
  // a non-zero amount below the shown precision is not a zero
  if (amount > 0n && integerPart === '0' && !trimmedFraction)
    return `<0.${'0'.repeat(MAX_DECIMALS - 1)}1`;
  const groupedInteger = BigInt(integerPart).toLocaleString(config.LOCALE);
  return trimmedFraction
    ? `${groupedInteger}.${trimmedFraction}`
    : groupedInteger;
};

export const formatChainAmount = (chain: PortfolioChainAmount): string =>
  formatFullAmount(chain.amount, chain.decimals, chain.amountFloat);
