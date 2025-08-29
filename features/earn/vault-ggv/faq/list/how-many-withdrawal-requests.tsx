import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const HowManyWithdrawalRequests: FC = () => {
  return (
    <Accordion summary="How many withdrawal requests can I have?">
      <p>
        You can have only one active request. To start another, cancel the
        existing one first.
      </p>
    </Accordion>
  );
};
