import React from 'react';
import { Block } from '@lidofinance/lido-ui';

import { BunkerInfo } from './bunker-info';
import { PausedInfo } from './paused-info';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { useWatch } from 'react-hook-form';
import { RequestFormInputType } from 'features/withdrawals/request/request-form-context';

import { FormController } from 'shared/hook-form/form-controller';
import { TokenSelectRequest } from './controls/token-select-request';
import { TokenAmountInputRequest } from './controls/token-amount-input-request';
import { InputGroupRequest } from './controls/input-group-request';
import { RequestsInfo } from './requests-info';
// import { ModePickerRequest } from './controls/mode-picker-request';
import { DexOptions } from './options/dex-options';
import { LidoOption } from './options/lido-option';
import {
  SubmitButtonRequest,
  useRequestSubmitButtonProps,
} from './controls/submit-button-request';
import { TransactionInfo } from './transaction-info';

export const RequestForm = () => {
  const { isBunker, isPaused } = useWithdrawals();
  // conditional render breaks useFormState, so it can't be inside SubmitButton
  const submitButtonProps = useRequestSubmitButtonProps();
  const mode = useWatch<RequestFormInputType, 'mode'>({ name: 'mode' });

  return (
    <Block data-testid="requestForm">
      {isPaused && <PausedInfo />}
      {isBunker && <BunkerInfo />}
      <FormController>
        <InputGroupRequest>
          <TokenSelectRequest />
          <TokenAmountInputRequest />
        </InputGroupRequest>
        {mode === 'lido' && <RequestsInfo />}
        {/* TODO: many renders */}
        {/*<ModePickerRequest />*/}
        {mode === 'lido' && (
          <>
            <LidoOption />
            <SubmitButtonRequest {...submitButtonProps} />
            <TransactionInfo />
          </>
        )}
        {mode === 'dex' && <DexOptions />}
      </FormController>
    </Block>
  );
};
