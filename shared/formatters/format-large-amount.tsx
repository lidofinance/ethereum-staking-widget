import { DATA_UNAVAILABLE } from 'consts/text';
import React from 'react';

type FormatLargeAmountProps = {
  amount?: number;
  symbol?: string;
  fallback?: string;
};

export const FormatLargeAmount = ({
  amount,
  symbol = '$',
  fallback = DATA_UNAVAILABLE,
}: FormatLargeAmountProps): React.ReactNode => {
  if (!amount) return fallback;

  if (amount >= 1_000_000_000) {
    return `${symbol}${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  } else if (amount >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  } else if (amount >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `${symbol}${amount.toFixed(0).replace(/\.0$/, '')}`;
};
