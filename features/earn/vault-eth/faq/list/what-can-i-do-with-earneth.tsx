import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const WhatCanIDoWithEarnEth: FC = () => {
  return (
    <AccordionTransparent
      summary="What can I do with earnETH token?"
      id="earneth-token-use"
    >
      <p>
        You can transfer it between wallets. Over time, it may also become
        usable across DeFi.
      </p>
    </AccordionTransparent>
  );
};
