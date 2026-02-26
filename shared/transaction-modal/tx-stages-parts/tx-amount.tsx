import { FormatToken } from 'shared/formatters';

type TxAmountProps = {
  amount: bigint;
  symbol: string;
  decimals?: number;
};

export const TxAmount = ({ amount, symbol, decimals }: TxAmountProps) => (
  <FormatToken
    amount={amount}
    symbol={symbol}
    maxTotalLength={Infinity}
    decimals={decimals}
    adaptiveDecimals
    trimEllipsis
  />
);
