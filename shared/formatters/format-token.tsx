import { formatBalance } from 'utils';
import { BigNumber } from '@ethersproject/bignumber';
import { Component } from 'types';

export type FormatTokenComponent = Component<
  'span',
  {
    symbol: string;
    amount?: BigNumber;
    approx?: boolean;
  }
>;
export const FormatToken: FormatTokenComponent = (props) => {
  const { amount, symbol, approx = false, ...rest } = props;
  const prefix = !approx || amount?.isZero() ? '' : '≈ ';

  return (
    <span {...rest}>
      {prefix}
      {formatBalance(amount)}&nbsp;{symbol}
    </span>
  );
};
