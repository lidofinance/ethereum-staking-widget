import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const WithdrawalPeriodCircumstances: FC = () => {
  return (
    <Accordion
      summary="What does the withdrawal period duration depend on?"
      id="withdrawalsPeriod"
    >
      <ol>
        <li>Amount of stETH in the queue</li>
        <li>Amount of requests</li>
        <li>Performance of validators</li>
        <li>Incidents on the validator poolside</li>
      </ol>
    </Accordion>
  );
};
