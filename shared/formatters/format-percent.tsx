import { Component } from 'types';

import { config } from 'config';

export type FormatPercentComponent = Component<
  'span',
  { amount: number | null }
>;

export const FormatPercent: FormatPercentComponent = (props) => {
  const { amount, ...rest } = props;
  const value =
    amount == null
      ? 'Unavailable'
      : amount.toLocaleString(config.LOCALE, {
          style: 'percent',
          maximumFractionDigits: 3,
        });

  return <span {...rest}>{value}</span>;
};
