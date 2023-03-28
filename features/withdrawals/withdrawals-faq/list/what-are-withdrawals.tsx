import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const WhatAreWithdrawals: FC = () => {
  return (
    <Accordion defaultExpanded summary="What are withdrawals?">
      <p>
        Withdrawals allow Lido users to unstake their stETH and, in return,
        receive ETH at a 1:1 ratio.
      </p>
    </Accordion>
  );
};
