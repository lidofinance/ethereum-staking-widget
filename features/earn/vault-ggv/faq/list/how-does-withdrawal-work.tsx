import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

type HowDoesWithdrawalWorkProps = {
  isBulkWithdraw?: boolean;
};

export const HowDoesWithdrawalWork: FC<HowDoesWithdrawalWorkProps> = ({
  isBulkWithdraw,
}) => {
  return (
    <Accordion summary="How does the withdrawal work?">
      {isBulkWithdraw ? (
        <p>
          You can withdraw your GG tokens into WETH instantly in a single
          transaction.
        </p>
      ) : (
        <p>
          You can withdraw your GG tokens back into wstETH in a single
          transaction (withdraw + claim). Once requested, your withdrawal will
          show as pending on Lido UI. Withdrawals are typically fulfilled within
          3 days under normal conditions.
        </p>
      )}
    </Accordion>
  );
};
