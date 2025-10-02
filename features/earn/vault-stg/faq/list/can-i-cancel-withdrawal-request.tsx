import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const CanICancelMyWithdrawalRequest: FC = () => {
  return (
    <Accordion summary="Can I cancel my withdrawal request?">
      <p>No, once the withdrawal request was created, it can’t be cancelled.</p>
    </Accordion>
  );
};
