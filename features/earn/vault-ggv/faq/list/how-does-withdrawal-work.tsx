import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const HowDoesWithdrawalWork: FC = () => {
  return (
    <Accordion summary="How does the withdrawal work?">
      <p>
        You can withdraw your GG tokens back into wstETH in a single transaction
        (withdraw + claim). Once requested, your withdrawal will show as pending
        on Lido UI. Withdrawals are typically fulfilled within 3 days under
        normal conditions.
      </p>
    </Accordion>
  );
};
