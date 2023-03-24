import React from 'react';
import { Block } from '@lidofinance/lido-ui';

import { Form } from './form';
import { Info } from './info';
import { BunkerInfo } from './bunker-info';
import { useWithdrawalsStatus } from 'features/withdrawals/hooks';

export const RequestForm = () => {
  const { isBunkerMode } = useWithdrawalsStatus();

  return (
    <Block>
      {isBunkerMode ? <BunkerInfo /> : <Info />}
      <Form />
    </Block>
  );
};
