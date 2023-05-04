import React from 'react';
import { Block } from '@lidofinance/lido-ui';

import { Form } from './form';
import { Info } from './info';
import { BunkerInfo } from './bunker-info';
import { PausedInfo } from './paused-info';
import { useWithdrawalsBaseData } from 'features/withdrawals/hooks';

export const RequestForm = () => {
  const wqBaseData = useWithdrawalsBaseData();
  const { isBunker, isPaused, isTurbo } = wqBaseData.data ?? {};

  return (
    <Block>
      {isPaused && <PausedInfo />}
      {isBunker && <BunkerInfo />}
      {isTurbo && <Info />}
      <Form />
    </Block>
  );
};
