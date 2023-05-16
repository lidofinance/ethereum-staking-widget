import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const WhatIsSteth: FC = () => {
  return (
    <Accordion summary="What is stETH?">
      <p>
        stETH is a transferable rebasing utility token representing a share of
        the total ETH staked through the protocol, which consists of user
        deposits and staking rewards. Because stETH rebases daily, it
        communicates the position of the share daily.
      </p>
    </Accordion>
  );
};
