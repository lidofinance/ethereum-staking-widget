import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const HowDoesLidoWork: FC = () => {
  return (
    <Accordion summary="How does Lido work?">
      <p>
        When staking with Lido, users receive stETH tokens which are issued 1:1
        to their initial stake. stETH balances can be used like regular ETH to
        earn and lending rewards, and are updated on a daily basis to reflect
        your ETH staking rewards. Note that there are no lock-ups or minimum
        deposits when staking with Lido.
      </p>
      <p>
        When using Lido, users receive staking rewards in real-time, and they
        also could use staked tokens across the DeFi ecosystem to compound
        rewards.
      </p>
    </Accordion>
  );
};
