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
import { ModePickerRequest } from './controls/mode-picker-request';
import { DexOptionWithErrorBoundary } from './options/dex-option';
import { LidoOption } from './options/lido-option';
import {
  SubmitButtonRequest,
  useRequestSubmitButtonProps,
} from './controls/submit-button-request';
import { TransactionInfo } from './transaction-info';
import { Hidden } from 'shared/components/hidden';
import { useConfig } from 'config';

export const RequestForm = () => {
  const { isBunker, isPaused } = useWithdrawals();

  // conditional render breaks useFormState, so it can't be inside SubmitButton
  const submitButtonProps = useRequestSubmitButtonProps();
  const modeForm = useWatch<RequestFormInputType, 'mode'>({ name: 'mode' });

  const isDexEnabled = useConfig().externalConfig.withdrawalDex.enabled;

  const mode = isDexEnabled ? modeForm : 'lido';

  return (
    <Block data-testid="requestForm">
      {isPaused && <PausedInfo />}
      {isBunker && <BunkerInfo />}
      <FormController>
        {isDexEnabled && <ModePickerRequest />}

        {/* Lido options is hidden visually to prevent mounting/unmounting of form controllers */}
        <Hidden show={mode === 'lido'}>
          <InputGroupRequest>
            <TokenSelectRequest />
            <TokenAmountInputRequest />
          </InputGroupRequest>
          <RequestsInfo />
          <LidoOption />
          <SubmitButtonRequest {...submitButtonProps} />
          <TransactionInfo />
        </Hidden>

        {isDexEnabled && mode === 'dex' && <DexOptionWithErrorBoundary />}
      </FormController>
    </Block>
  );
};
