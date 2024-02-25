import { Component } from 'types';

import { getConfig } from 'config';
const { LOCALE } = getConfig();

export type FormatPercentComponent = Component<
  'span',
  { amount: number | null }
>;

export const FormatPercent: FormatPercentComponent = (props) => {
  const { amount, ...rest } = props;
  const value =
    amount == null
      ? 'Unavailable'
      : amount.toLocaleString(LOCALE, {
          style: 'percent',
          maximumFractionDigits: 3,
        });

  return <span {...rest}>{value}</span>;
};
