import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const HowLongToWithdraw: FC = () => {
  return (
    <AccordionTransparent
      summary="How long does it take to withdraw?"
      id="earneth-withdraw-time"
    >
      <p>
        Typically, it takes up to 3 days, though it may be faster. You can check
        progress in the Withdrawal section of the EarnETH UI.
      </p>
    </AccordionTransparent>
  );
};
