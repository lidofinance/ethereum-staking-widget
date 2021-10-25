import { LOCALE } from 'config';
import { Component } from 'types';

export type FormatPriceComponent = Component<'span', { amount: number | null }>;
export const FormatPrice: FormatPriceComponent = (props) => {
  const { amount, ...rest } = props;
  const value =
    amount == null
      ? 'Unavailable'
      : amount.toLocaleString(LOCALE, {
          style: 'currency',
          currency: 'USD',
        });

  return <span {...rest}>{value}</span>;
};
