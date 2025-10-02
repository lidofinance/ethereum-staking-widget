import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const HowManyWithdrawalRequests: FC = () => {
  return (
    <Accordion summary="How many withdrawal requests can I have?">
      <p>You can have multiple withdrawal requests.</p>
    </Accordion>
  );
};
