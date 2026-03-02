import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const HowManyWithdrawalRequests: FC = () => {
  return (
    <AccordionTransparent
      summary="How many withdrawal requests can I have?"
      id="earneth-withdrawal-requests"
    >
      <p>You can have multiple withdrawal requests.</p>
    </AccordionTransparent>
  );
};
