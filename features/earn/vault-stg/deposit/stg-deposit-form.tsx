import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';
import { VaultTxInfo } from 'features/earn/shared/vault-tx-info';

import { STGDepositFormProvider } from './form-context';
import { STGDepositInputGroup } from './stg-deposit-input-group';
import { STGAvailableDeposit } from './stg-available-deposit';
import { STGWillReceive } from './stg-deposit-will-receive';
import { STGDepositSubmitButton } from './stg-deposit-submit-button';
import { VaultWarning } from 'features/earn/shared/vault-warning';

export const STGDepositForm = () => {
  return (
    <STGDepositFormProvider>
      <VaultForm data-testid="deposit-form">
        <VaultFormSection>
          <STGAvailableDeposit />
          <STGDepositInputGroup />
        </VaultFormSection>
        <VaultTxInfo>
          <STGWillReceive />
        </VaultTxInfo>
        <VaultWarning variant="info">
          Withdrawing less than 3 days after deposit reduces rewards.
          Withdrawals are only in wstETH, regardless of deposited asset(s).
        </VaultWarning>
        <STGDepositSubmitButton />
      </VaultForm>
    </STGDepositFormProvider>
  );
};
