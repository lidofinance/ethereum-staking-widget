import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const HowToWithdraw: FC = () => {
  return (
    <Accordion summary="How do I withdraw?">
      <p>
        Press the Request tab, choose the amount of stETH to withdraw and press
        confirm. Confirm the transaction using your wallet and press Claim once
        ready.
      </p>
    </Accordion>
  );
};
