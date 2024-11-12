import { Tooltip } from '@lidofinance/lido-ui';

import { DATA_UNAVAILABLE } from 'consts/text';
import { Component } from 'types';
import { FormatBalanceArgs, useFormattedBalance } from 'utils';
import { isNonNegativeBigInt } from 'utils/is-non-negative-bigint';

export type FormatTokenProps = FormatBalanceArgs & {
  symbol: string;
  amount?: bigint;
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

  if (!isNonNegativeBigInt(amount)) return <span {...rest}>{fallback}</span>;

  const showTooltip = showAmountTip && isTrimmed;

  // we show prefix for non zero amount and if we need to show Tooltip Amount
  // overridden by explicitly set approx
  const prefix = amount && amount !== BigInt(0) && approx ? '≈ ' : '';

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
