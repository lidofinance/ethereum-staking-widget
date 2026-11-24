import { config } from 'config';
import { formatPercent } from 'shared/formatters';

import type { PortfolioAprRange } from '../types';
import { formatActivityTime } from './activity';

const MINUTE_MS = 60 * 1000;
const MAX_RELATIVE_MINUTES = 60;
const REWARDS_DECIMALS = 6;

// reward amounts are small, so they keep more decimals than balances
export const formatRewardsAmount = (amount: number): string =>
  amount.toLocaleString(config.LOCALE, {
    maximumFractionDigits: REWARDS_DECIMALS,
  });

// 2.3% - 2.7% in the app's percent format; one value when both ends read the same
export const formatAprRange = ({ min, max }: PortfolioAprRange): string => {
  const minText = formatPercent(min, 'percent');
  const maxText = formatPercent(max, 'percent');
  return minText === maxText ? minText : `${minText} - ${maxText}`;
};

// Refresh brings nothing new while the server still keeps the same answer
export const canRefresh = (
  updatedAt: number | undefined,
  now: number,
  ttlMs: number,
): boolean => updatedAt == null || now - updatedAt >= ttlMs;

// an older answer, shown during an outage, gets its date instead
export const formatLastUpdate = (updatedAt: number, now: number): string => {
  const minutesSinceUpdate = Math.floor((now - updatedAt) / MINUTE_MS);
  if (minutesSinceUpdate < 1) return 'just now';
  if (minutesSinceUpdate > MAX_RELATIVE_MINUTES)
    return formatActivityTime(updatedAt);
  return `${minutesSinceUpdate} min. ago`;
};
