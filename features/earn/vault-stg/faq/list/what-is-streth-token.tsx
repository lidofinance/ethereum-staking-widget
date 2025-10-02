import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const WhatIsStrethToken: FC = () => {
  return (
    <Accordion summary="What is strETH token?">
      <p>
        The strETH token represents your share of the stRATEGY vault. Its value
        reflects the amount you deposited and the vault’s performance.
      </p>
    </Accordion>
  );
};
