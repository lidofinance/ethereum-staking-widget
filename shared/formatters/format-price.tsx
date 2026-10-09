import { Tooltip } from '@lidofinance/lido-ui';
import { DATA_UNAVAILABLE } from 'consts/text';

import { config } from 'config';
import type { FC, ComponentProps } from 'react';

export type FormatPriceComponentProps = ComponentProps<'span'> & {
  amount: number | null | undefined;
  smallNumberThreshold?: number;
  maximumFractionDigits?: number;
  currency?: string;
  fallback?: string;
};

export const FormatPrice: FC<FormatPriceComponentProps> = (props) => {
  const {
    amount,
    smallNumberThreshold = 0.01,
    maximumFractionDigits,
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
          maximumFractionDigits,
        });

  if (amount && amount < smallNumberThreshold) {
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
        <span {...rest}>{actual}..</span>
      </Tooltip>
    );
  }

  return <span {...rest}>{actual}</span>;
};
