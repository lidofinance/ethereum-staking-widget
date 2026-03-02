import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const WhatIsEarnEthToken: FC = () => {
  return (
    <AccordionTransparent summary="What is earnETH token?" id="earneth-token">
      <p>
        The earnETH token represents your share of the EarnETH vault. Its value
        reflects the amount you deposited and the vault&apos;s performance.
      </p>
    </AccordionTransparent>
  );
};
