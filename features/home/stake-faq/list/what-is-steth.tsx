import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

const TITLE = 'What is stETH?';

export const WhatIsSteth: FC = () => {
  return (
    <Accordion summary={TITLE}>
      <p>
        stETH is a token that represents staked ether in Lido, combining the
        value of initial deposit + staking rewards. stETH tokens are minted upon
        deposit and burned when redeemed. stETH token balances are issued 1:1 to
        the ethers that are staked by Lido. stETH token’s balances are updated
        when the oracle reports change in total stake every day.
      </p>
      <p>
        stETH tokens can be used as one would use ether, allowing you to earn
        Beacon chain staking rewards whilst benefiting from e.g. rewards across
        decentralized finance products.
      </p>
    </Accordion>
  );
};
