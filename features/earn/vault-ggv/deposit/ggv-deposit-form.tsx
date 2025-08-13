import type { FC } from 'react';

import { FormController } from 'shared/hook-form/form-controller';
import { VaultTxInfo } from 'features/earn/shared/vault-tx-info';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';

import { GGVDepositFormProvider } from './form-context';
import { GGVDepositInputGroup } from './ggv-deposit-input-group';
import { GGVAvailableDeposit } from './ggv-avaliable-deposit';
import { GGVWillReceive } from './ggv-will-receive';

export const GGVDepositForm: FC = () => {
  return (
    <GGVDepositFormProvider>
      <FormController>
        <GGVAvailableDeposit />
        <GGVDepositInputGroup />
        <VaultTxInfo>
          <GGVWillReceive />
        </VaultTxInfo>
        <SubmitButtonHookForm>Deposit</SubmitButtonHookForm>
      </FormController>
    </GGVDepositFormProvider>
  );
};
