import { FormatToken } from 'shared/formatters';

type TxAmountProps = {
  amount: bigint;
  symbol: string;
};

export const TxAmount = ({ amount, symbol }: TxAmountProps) => (
  <FormatToken
    amount={amount}
    symbol={symbol}
    maxTotalLength={Infinity}
    adaptiveDecimals
    trimEllipsis
  />
);
