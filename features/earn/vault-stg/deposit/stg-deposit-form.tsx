import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';
import {
  VaultTxInfo,
  VaultTxInfoRow,
} from 'features/earn/shared/vault-tx-info';

import { STGDepositFormProvider } from './form-context';
import { STGDepositInputGroup } from './stg-deposit-input-group';
import { STGAvailableDeposit } from './stg-available-deposit';
import { STGWillReceive } from './stg-deposit-will-receive';
import { STGDepositSubmitButton } from './stg-deposit-submit-button';
import { VaultWarning } from 'features/earn/shared/vault-warning';
import { STGDepositRequests } from './stg-deposit-requests';
import { STGDepositWarning } from './stg-deposit-warning';
import { useSTGAvailable } from '../hooks/use-stg-available';

export const STGDepositForm = () => {
  const { isVaultDeprecated } = useSTGAvailable();

  if (isVaultDeprecated) {
    return (
      <STGDepositFormProvider>
        <VaultFormSection>
          <STGDepositRequests />
        </VaultFormSection>
        <STGDepositWarning />
      </STGDepositFormProvider>
    );
  }

  return (
    <STGDepositFormProvider>
      <VaultForm data-testid="deposit-form">
        <STGDepositWarning />
        <VaultFormSection>
          <STGDepositRequests />
          <STGAvailableDeposit />
          <STGDepositInputGroup />
        </VaultFormSection>
        <VaultTxInfo>
          <STGWillReceive />
          <VaultTxInfoRow
            title="Waiting time"
            help={
              <>
                Deposits usually complete within 24 hours, often sooner. You can
                track progress in the Deposit section of the Lido stRATEGY UI.
              </>
            }
          >
            {'24 hours'}
          </VaultTxInfoRow>
        </VaultTxInfo>
        <VaultWarning variant="info">
          Withdrawals are only in wstETH, regardless of deposited asset(s).
        </VaultWarning>
        <STGDepositSubmitButton />
      </VaultForm>
    </STGDepositFormProvider>
  );
};
