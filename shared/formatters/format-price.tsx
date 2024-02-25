import { Tooltip } from '@lidofinance/lido-ui';
import { DATA_UNAVAILABLE } from 'consts/text';

import { getConfig } from 'config';
const { LOCALE } = getConfig();

import { Component } from 'types';

export type FormatPriceComponent = Component<
  'span',
  { amount: number | null | undefined; currency?: string }
>;

export const FormatPrice: FormatPriceComponent = (props) => {
  const { amount, currency = 'USD', ...rest } = props;
  const actual =
    amount == null
      ? DATA_UNAVAILABLE
      : amount.toLocaleString(LOCALE, {
          style: 'currency',
          currency,
        });

  if (amount && amount < 0.01) {
    return (
      <Tooltip
        placement="topRight"
        title={
          <span>
            {amount.toLocaleString(LOCALE, {
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
