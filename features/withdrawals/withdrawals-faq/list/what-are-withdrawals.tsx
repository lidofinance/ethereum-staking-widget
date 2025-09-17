import { Accordion } from '@lidofinance/lido-ui';

export const WhatAreWithdrawals: React.FC = () => {
  return (
    <Accordion summary="What are withdrawals?">
      <p>
        Users can unstake their stETH or wstETH through withdrawals. Upon
        unstaking stETH, they will receive ETH at a 1:1 ratio. When unstaking
        wstETH, the unwrapping process will take place seamlessly in the
        background.
      </p>
    </Accordion>
  );
};
