import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const WhatIsGGToken: FC = () => {
  return (
    <Accordion summary="What is GG token?">
      <p>
        The GG token represents your share of the GGV vault. Its value reflects
        the amount you deposited and the vault’s performance. Please note that
        for the first 24 hours after a deposit, the token cannot be transferred.
      </p>
    </Accordion>
  );
};
