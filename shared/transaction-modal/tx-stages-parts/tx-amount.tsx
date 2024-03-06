import { BigNumber } from 'ethers';
import { FormatToken } from 'shared/formatters';

type TxAmountProps = {
  amount: BigNumber;
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
