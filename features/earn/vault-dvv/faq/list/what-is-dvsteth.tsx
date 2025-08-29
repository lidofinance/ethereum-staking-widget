import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const WhatIsDVstETH: FC = () => {
  return (
    <Accordion summary="What is DVstETH token?">
      <p>
        DVstETH is a wrapped Liquid Staking Token powered by the Lido protocol’s
        wstETH, allowing vault depositors to reuse their staking receipts across
        the DeFi ecosystem.
      </p>
    </Accordion>
  );
};
