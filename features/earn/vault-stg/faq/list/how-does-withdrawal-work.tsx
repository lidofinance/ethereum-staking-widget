import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const HowDoesWithdrawalWork: FC = () => {
  return (
    <Accordion summary="How does the withdrawal work?">
      <p>The withdrawal process has two steps:</p>
      <ul>
        <li>
          Request withdrawal by issuing a withdrawal request from strETH to
          wstETH tokens. Withdrawals are typically fulfilled within ~72 hours
          under normal conditions.
        </li>
        <li>
          Claim: Claim your wstETH after the withdrawal request has been
          processed.
        </li>
      </ul>
    </Accordion>
  );
};
