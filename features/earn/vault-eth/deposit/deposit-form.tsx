import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';
import {
  VaultTxInfo,
  VaultTxInfoRow,
} from 'features/earn/shared/vault-tx-info';
import { VaultWarning } from 'features/earn/shared/vault-warning';

import { EthDepositFormProvider } from './form-context';
import { EthVaultDepositInputGroup } from './deposit-input-group';
import { EthVaultWillReceive } from './deposit-will-receive';
import { EthVaultDepositSubmitButton } from './deposit-submit-button';
import { EthVaultAvailableDeposit } from './available-deposit';
import { EthVaultDepositRequests } from './deposit-requests';

export const EthVaultDepositForm = () => {
  return (
    <EthDepositFormProvider>
      <VaultForm data-testid="deposit-form">
        <VaultFormSection>
          <EthVaultDepositRequests />
          <EthVaultAvailableDeposit />
          <EthVaultDepositInputGroup />
        </VaultFormSection>
        <VaultTxInfo>
          <EthVaultWillReceive />
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
        <EthVaultDepositSubmitButton />
      </VaultForm>
    </EthDepositFormProvider>
  );
};
