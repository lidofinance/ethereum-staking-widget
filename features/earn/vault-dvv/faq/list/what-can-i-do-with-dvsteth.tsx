import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const WhatCanIDoWithDVstETH: FC = () => {
  return (
    <Accordion summary="What can I do with DVstETH token?">
      <p>
        You can transfer it between wallets and also use it in DeFi, e.g.
        Gearbox and Balancer LP positions.
      </p>
    </Accordion>
  );
};
