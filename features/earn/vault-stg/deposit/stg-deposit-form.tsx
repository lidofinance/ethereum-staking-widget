import type { FC } from 'react';

import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';
import { VaultTxInfo } from 'features/earn/shared/vault-tx-info';

import { STGDepositFormProvider } from './form-context';
import { STGDepositInputGroup } from './stg-deposit-input-group';
import { STGAvailableDeposit } from './stg-available-deposit';
import { STGWillReceive } from './stg-deposit-will-receive';
import { STGDepositSubmitButton } from './stg-deposit-submit-button';
import { STGDepositWarning } from './stg-deposit-warning';
import { VaultWarning } from 'features/earn/shared/vault-warning';

export const STGDepositForm: FC = () => {
  return (
    <STGDepositFormProvider>
      <VaultForm data-testid="deposit-form">
        <STGDepositWarning />
        <VaultFormSection>
          <STGAvailableDeposit />
          <STGDepositInputGroup />
        </VaultFormSection>
        <VaultTxInfo>
          <STGWillReceive />
        </VaultTxInfo>
        <VaultWarning variant="info">
          STG deposit is a placeholder.
        </VaultWarning>
        <STGDepositSubmitButton />
      </VaultForm>
    </STGDepositFormProvider>
  );
};
