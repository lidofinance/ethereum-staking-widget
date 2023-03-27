import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const HowLongToWithdraw: FC = () => {
  return (
    <Accordion summary="How long does it take to withdraw?">
      <p>
        Most often, the stETH/wstETH withdrawal period will be from 1-5 days.
        After that you can claim your ETH using the ‘Claim’ tab.
      </p>
    </Accordion>
  );
};
