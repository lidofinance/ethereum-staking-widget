import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const HowManyDepositRequests: FC = () => {
  return (
    <AccordionTransparent
      summary="How many deposit requests can I have?"
      id="earneth-deposit-requests"
    >
      <p>
        You can have one active request per depositable token. This means you
        can have up to five deposit requests at the same time. To create a new
        request for a given token, you must cancel the existing request first.
      </p>
    </AccordionTransparent>
  );
};
