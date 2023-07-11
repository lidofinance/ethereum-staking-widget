import React from 'react';
import { Block } from '@lidofinance/lido-ui';

import { BunkerInfo } from './bunker-info';
import { PausedInfo } from './paused-info';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { useWatch } from 'react-hook-form';
import {
  RequestFormInputType,
  useRequestFormData,
} from 'features/withdrawals/request/request-form-context';

import { TokenInput } from './inputs/token-input';
import { AmountInput } from './inputs/amount-input';
import { ErrorMessageInputGroup } from './inputs/input-group';
import { RequestsInfo } from './requests-info';
import { ModeInput } from './inputs/mode-input';
import { DexOptions } from './options/dex-options';
import { LidoOption } from './options/lido-option';
import { SubmitButton } from './submit-button';
import { TransactionInfo } from './transaction-info';

export const RequestForm = () => {
  const { isBunker, isPaused } = useWithdrawals();
  const { onSubmit } = useRequestFormData();
  const mode = useWatch<RequestFormInputType, 'mode'>({ name: 'mode' });

  return (
    <Block>
      {isPaused && <PausedInfo />}
      {isBunker && <BunkerInfo />}
      <form onSubmit={onSubmit}>
        <ErrorMessageInputGroup>
          <TokenInput />
          <AmountInput />
        </ErrorMessageInputGroup>
        {mode === 'lido' && <RequestsInfo />}
        <ModeInput />
        {mode === 'lido' && (
          <>
            <LidoOption />
            <SubmitButton />
            <TransactionInfo />
          </>
        )}
        {mode === 'dex' && <DexOptions />}
      </form>
    </Block>
  );
};
