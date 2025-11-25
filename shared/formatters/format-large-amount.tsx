import { DATA_UNAVAILABLE } from 'consts/text';
import React from 'react';

import { getShortenedNumber } from './utils';

type FormatLargeAmountProps = {
  amount?: number | null;
  symbol?: string;
  fallback?: string;
};

export const FormatLargeAmount = ({
  amount,
  symbol = '$',
  fallback = DATA_UNAVAILABLE,
}: FormatLargeAmountProps): React.ReactNode => {
  if (!amount) return fallback;

  return `${symbol}${getShortenedNumber(amount, fallback)}`;
};
