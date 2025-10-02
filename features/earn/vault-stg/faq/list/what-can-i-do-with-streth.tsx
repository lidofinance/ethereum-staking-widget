import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const WhatCanIDoWithStreth: FC = () => {
  return (
    <Accordion summary="What can I do with strETH token?">
      <p>
        You can transfer it between wallets and also use it in DeFi, e.g. Pendle
        LP positions.
      </p>
    </Accordion>
  );
};
