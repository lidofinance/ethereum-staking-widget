import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const HowLongToWithdraw: FC = () => {
  return (
    <Accordion summary="How long does it take to withdraw?">
      <p>
        Typically, it takes up to 3 days, though it may be faster. You can check
        progress in the Withdrawal section of the Lido stRATEGY UI.
      </p>
    </Accordion>
  );
};
