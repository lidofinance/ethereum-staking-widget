import { Tooltip } from '@lidofinance/lido-ui';
import { DATA_UNAVAILABLE } from 'consts/text';

import { config } from 'config';
import { Component } from 'types';

export type FormatPriceComponent = Component<
  'span',
  { amount: number | null | undefined; currency?: string; fallback?: string }
>;

export const FormatPrice: FormatPriceComponent = (props) => {
  const {
    amount,
    currency = 'USD',
    fallback = DATA_UNAVAILABLE,
    ...rest
  } = props;
  const actual =
    amount == null
      ? fallback
      : amount.toLocaleString(config.LOCALE, {
          style: 'currency',
          currency,
        });

  if (amount && amount < 0.01) {
    return (
      <Tooltip
        placement="topRight"
        title={
          <span>
            {amount.toLocaleString(config.LOCALE, {
              style: 'currency',
              currency,
              maximumFractionDigits: 10,
            })}
          </span>
        }
      >
        <span {...rest}>{actual}</span>
      </Tooltip>
    );
  }

  return <span {...rest}>{actual}</span>;
};
