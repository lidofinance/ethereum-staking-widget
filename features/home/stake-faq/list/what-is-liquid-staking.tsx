import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

const TITLE = 'What is liquid staking?';

export const WhatIsLiquidStaking: FC = () => {
  return (
    <Accordion summary={TITLE}>
      <p>
        Liquid staking protocols allow users to earn staking rewards without
        locking assets or maintaining staking infrastructure. Users can deposit
        tokens and receive tradable liquid tokens in return. The DAO-controlled
        smart contract stakes these tokens using elected staking providers. As
        users funds are controlled by the DAO, staking providers never have
        direct access to the users&apos; assets.
      </p>
    </Accordion>
  );
};
