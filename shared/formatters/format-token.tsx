import { BigNumber } from '@ethersproject/bignumber';
import { Tooltip } from '@lidofinance/lido-ui';

import { DATA_UNAVAILABLE } from 'consts/text';
import { Component } from 'types';
import { FormatBalanceArgs, useFormattedBalance } from 'utils';

export type FormatTokenProps = FormatBalanceArgs & {
  symbol: string;
  // TODO: NEW_SDK (use only bigint)
  amount?: BigNumber | bigint;
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
  // TODO: NEW_SDK (remove: see typing)
  //  the Format Token is used on all pages and will be modified in the final iteration.
  const _amount =
    amount && typeof amount === 'bigint'
      ? BigNumber.from(amount)
      : (amount as BigNumber);

  const { actual, isTrimmed, trimmed } = useFormattedBalance(_amount, {
    maxDecimalDigits,
    maxTotalLength,
    trimEllipsis,
    adaptiveDecimals,
  });

  if (!_amount) return <span {...rest}>{fallback}</span>;

  const showTooltip = showAmountTip && isTrimmed;

  // we show prefix for non zero amount and if we need to show Tooltip Amount
  // overridden by explicitly set approx
  const prefix = _amount && !_amount.isZero() && approx ? '≈ ' : '';

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
