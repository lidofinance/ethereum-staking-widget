import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const HowManyDepositRequests: FC = () => {
  return (
    <AccordionTransparent
      summary="How many deposit requests can I have?"
      id="earnusd-deposit-requests"
    >
      <p>
        You can have <strong>one active request per depositable token</strong>.
        This means you can have up to <strong>two</strong> deposit requests at
        the same time, one for USDC and one for USDT. To create a new request
        for a given token, you must cancel the existing request first.
      </p>
    </AccordionTransparent>
  );
};
