import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const CanICancelMyWithdrawalRequest: FC = () => {
  return (
    <AccordionTransparent
      summary="Can I cancel my withdrawal request?"
      id="earnusd-cancel-withdrawal"
    >
      <p>
        No, once the withdrawal request was created, it can&apos;t be cancelled.
      </p>
    </AccordionTransparent>
  );
};
