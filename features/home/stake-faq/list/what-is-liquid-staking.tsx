import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const WhatIsLiquidStaking: FC = () => {
  return (
    <Accordion summary="What is liquid staking?">
      <p>
        Liquid staking protocols allow users to get staking rewards without
        locking tokens or maintaining staking infrastructure. Users can deposit
        tokens and receive tradable liquid tokens in return. The DAO-controlled
        smart contract stakes these tokens using elected staking providers. As
        users funds are controlled by the DAO, staking providers never have
        direct access to the users&apos; tokens.
      </p>
    </Accordion>
  );
};
