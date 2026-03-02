import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const WhatCanIDoWithEarnUsd: FC = () => {
  return (
    <AccordionTransparent
      summary="What can I do with earnUSD token?"
      id="earnusd-token-use"
    >
      <p>You can transfer it between wallets and also use it in DeFi.</p>
    </AccordionTransparent>
  );
};
