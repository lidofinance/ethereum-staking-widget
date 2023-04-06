import { formatBalance } from 'utils';
import { BigNumber } from '@ethersproject/bignumber';
import { Component } from 'types';

export type FormatTokenProps = {
  symbol: string;
  amount?: BigNumber;
  approx?: boolean;
  maxDecimalDigits?: number;
};
export type FormatTokenComponent = Component<'span', FormatTokenProps>;

export const FormatToken: FormatTokenComponent = (props) => {
  const { amount, symbol, approx = false, maxDecimalDigits, ...rest } = props;
  const prefix = !approx || amount?.isZero() ? '' : '≈ ';

  return (
    <span {...rest}>
      {prefix}
      {formatBalance(amount, maxDecimalDigits)}&nbsp;{symbol}
    </span>
  );
};
