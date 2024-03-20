import { BigNumber } from '@ethersproject/bignumber';
import { Tooltip } from '@lidofinance/lido-ui';

import { DATA_UNAVAILABLE } from 'consts/text';
import { Component } from 'types';
import { FormatBalanceArgs, useFormattedBalance } from 'utils';

export type FormatTokenProps = FormatBalanceArgs & {
  symbol: string;
  amount?: BigNumber;
  approx?: boolean;
  showAmountTip?: boolean;
  fallback?: string;
};
export type FormatTokenComponent = Component<'span', FormatTokenProps>;

export const FormatToken: FormatTokenComponent = ({
  amount,
  symbol,
  approx,
  maxDecimalDigits = 4,
  maxTotalLength = 15,
  showAmountTip = true,
  trimEllipsis,
  fallback = DATA_UNAVAILABLE,
  adaptiveDecimals,
  ...rest
}) => {
  const { actual, isTrimmed, trimmed } = useFormattedBalance(amount, {
    maxDecimalDigits,
    maxTotalLength,
    trimEllipsis,
    adaptiveDecimals,
  });

  if (!amount) return <span {...rest}>{fallback}</span>;

  const showTooltip = showAmountTip && isTrimmed;

  // we show prefix for non zero amount and if we need to show Tooltip Amount
  // overridden by explicitly set approx
  const prefix = amount && !amount.isZero() && approx ? '≈ ' : '';

  const body = (
    <span {...rest}>
      {prefix}
      {trimmed}&nbsp;{symbol}
    </span>
  );

  if (showTooltip) {
    return (
      <Tooltip
        placement="topRight"
        title={
          <span>
            {actual}&nbsp;{symbol}
          </span>
        }
      >
        {body}
      </Tooltip>
    );
  }

  return body;
};
