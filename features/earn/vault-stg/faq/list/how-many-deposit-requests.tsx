import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const HowManyDepositRequests: FC = () => {
  return (
    <Accordion summary="How many deposit requests can I have?">
      <p>
        You can have only one active request per depositable token. This means
        you can have a maximum of three deposit requests at the same time, one
        each for ETH, WETH, and wstETH. To create a new request for a given
        token, you’ll need to cancel the existing one first.
      </p>
    </Accordion>
  );
};
