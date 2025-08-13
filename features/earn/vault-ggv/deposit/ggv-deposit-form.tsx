import type { FC } from 'react';

import { FormController } from 'shared/hook-form/form-controller';
import { VaultTxInfo } from 'features/earn/shared/vault-tx-info';

import { GGVDepositFormProvider } from './form-context';
import { GGVDepositInputGroup } from './ggv-deposit-input-group';
import { GGVAvailableDeposit } from './ggv-avaliable-deposit';
import { GGVWillReceive } from './ggv-will-receive';
import { GGVDepositSubmitButton } from './ggv-deposit-submit-botton';
import { GGVDepositWarning } from './ggv-deposit-warning';

export const GGVDepositForm: FC = () => {
  return (
    <GGVDepositFormProvider>
      <FormController>
        <GGVDepositWarning />
        <GGVAvailableDeposit />
        <GGVDepositInputGroup />
        <VaultTxInfo>
          <GGVWillReceive />
        </VaultTxInfo>
        <GGVDepositSubmitButton />
      </FormController>
    </GGVDepositFormProvider>
  );
};
