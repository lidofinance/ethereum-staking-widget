import type { FC } from 'react';

import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';
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
      <VaultForm>
        <GGVDepositWarning />
        <VaultFormSection>
          <GGVAvailableDeposit />
          <GGVDepositInputGroup />
        </VaultFormSection>
        <VaultTxInfo>
          <GGVWillReceive />
        </VaultTxInfo>
        <GGVDepositSubmitButton />
      </VaultForm>
    </GGVDepositFormProvider>
  );
};
