import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const HowLongToDeposit: FC = () => {
  return (
    <AccordionTransparent
      summary="How long does it take to deposit?"
      id="earneth-deposit-time"
    >
      <p>
        Deposits are typically fulfilled within ~24 hours under normal
        conditions.
      </p>
    </AccordionTransparent>
  );
};
