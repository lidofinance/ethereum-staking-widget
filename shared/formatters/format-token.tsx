import { Tooltip } from '@lidofinance/lido-ui';

import { DATA_UNAVAILABLE } from 'consts/text';
import { Component } from 'types';
import { FormatBalanceArgs, useFormattedBalance } from 'utils';

export type FormatTokenProps = FormatBalanceArgs & {
  symbol: string;
  amount?: bigint | null;
  approx?: boolean;
  showAmountTip?: boolean;
  fallback?: string;
  decimals?: number;
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
  decimals,
  ...rest
}) => {
  const { actual, isTrimmed, trimmed } = useFormattedBalance(
    amount != null ? amount : undefined,
    {
      maxDecimalDigits,
      maxTotalLength,
      trimEllipsis,
      adaptiveDecimals,
      decimals,
    },
  );

  if (amount == null) return <span {...rest}>{fallback}</span>;

  const showTooltip = showAmountTip && isTrimmed;

  // we show prefix for non zero amount and if we need to show Tooltip Amount
  // overridden by explicitly set approx
  const prefix = amount !== 0n && approx ? '≈ ' : '';

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
