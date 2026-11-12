import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

type HowLongToWithdrawProps = {
  isBulkWithdraw?: boolean;
};

export const HowLongToWithdraw: FC<HowLongToWithdrawProps> = ({
  isBulkWithdraw,
}) => {
  return (
    <Accordion summary="How long does it take to withdraw?">
      {isBulkWithdraw ? (
        <p>
          Withdrawals are instant. You receive WETH in the same transaction.
        </p>
      ) : (
        <p>
          Typically, it takes up to 3 days, though it may be faster. You can
          check progress in your wallet or in the Withdrawal section of the Lido
          GGV UI.
        </p>
      )}
    </Accordion>
  );
};
