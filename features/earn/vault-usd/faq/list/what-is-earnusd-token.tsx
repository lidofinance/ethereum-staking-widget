import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const WhatIsEarnUsdToken: FC = () => {
  return (
    <AccordionTransparent summary="What is earnUSD token?" id="earnusd-token">
      <p>
        The earnUSD token represents your share of the EarnUSD vault. Its value
        reflects the amount you deposited and the vault&apos;s performance.
      </p>
    </AccordionTransparent>
  );
};
