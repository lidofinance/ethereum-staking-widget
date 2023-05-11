import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const HowDoesLidoWork: FC = () => {
  return (
    <Accordion summary="How does Lido work?">
      <p>
        While each network works differently, generally, the Lido protocols
        batch user tokens to stake with validators and route the staking
        packages to network staking contracts. Users mint amounts of stTokens
        which correspond to the amount of tokens sent as stake and they receive
        staking rewards. When they unstake, they burn the stToken to initiate
        the network-specific withdrawal process to withdraw the balance of stake
        and rewards.
      </p>
    </Accordion>
  );
};
