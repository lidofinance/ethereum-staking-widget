import { Accordion } from '@lidofinance/lido-ui';

export const WhatAreWithdrawals: React.FC = () => {
  return (
    <Accordion defaultExpanded summary="What are withdrawals?">
      <p>
        Withdrawals allow users to unstake their stETH/wstETH and, in return,
        receive ETH at a 1:1 ratio.
      </p>
    </Accordion>
  );
};
