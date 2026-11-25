import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const WhatIsSteth: FC = () => {
  return (
    <Accordion summary="What are stETH and wstETH?">
      <p>
        stETH is a transferable rebasing utility token representing a share of
        the total ETH staked through the protocol, which consists of user
        deposits and staking rewards. Because stETH rebases daily, it
        communicates the position of the share daily.
      </p>
      <p>
        Wrapped stETH (wstETH) is a non-rebasing version of stETH. Unlike stETH,
        the balance of wstETH remains fixed; instead, the value per unit
        increases to reflect earned rewards. This wrapping process effectively
        locks the staking growth into the token’s price rather than its
        quantity, making wstETH ideal for protocols or scenarios where a
        constant token balance is required.
      </p>
    </Accordion>
  );
};
