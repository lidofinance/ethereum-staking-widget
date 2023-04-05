import React from 'react';
import { Block } from '@lidofinance/lido-ui';

import { Form } from './form';
import { Info } from './info';
import { BunkerInfo } from './bunker-info';
import { PausedInfo } from './paused-info';
import { useWithdrawalsStatus } from 'features/withdrawals/hooks';

export const RequestForm = () => {
  const { isBunkerMode, isPaused } = useWithdrawalsStatus();

  return (
    <Block>
      {isPaused && <PausedInfo />}
      {isBunkerMode && <BunkerInfo />}
      {!isPaused && !isBunkerMode && <Info />}
      <Form />
    </Block>
  );
};
