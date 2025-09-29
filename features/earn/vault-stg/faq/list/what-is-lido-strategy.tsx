import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const WhatIsLidoStrategy: FC = () => {
  return (
    <Accordion summary="What is Lido stRATEGY, and how does it work?">
      <p>
        stRATEGY amplifies staking rewards by allocating deposited tokens across
        highly liquid and diverse DeFi opportunities, while strengthening the
        stETH ecosystem. All curator actions follow a pre-defined but
        continuously evolving set of controls, enabling flexible asset
        management with a high degree of transparency and integrity.
      </p>
    </Accordion>
  );
};
