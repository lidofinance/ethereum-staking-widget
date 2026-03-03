import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';
import {
  VaultTxInfo,
  VaultTxInfoRow,
} from 'features/earn/shared/vault-tx-info';

import { UsdVaultDepositFormProvider } from './form-context';
import { UsdVaultDepositWillReceive } from './deposit-will-receive';
import { UsdVaultDepositInputGroup } from './deposit-input-group';
import { UsdVaultAvailableDeposit } from './available-deposit';
import { UsdVaultDepositSubmitButton } from './deposit-submit-button';
import { UsdVaultDepositRequests } from './deposit-requests';

// TODO: add Deposit Warning and ability to disable deposit via config

export const UsdVaultDepositForm = () => {
  return (
    <UsdVaultDepositFormProvider>
      <VaultForm data-testid="deposit-form-usd">
        <VaultFormSection>
          <UsdVaultDepositRequests />
          <UsdVaultAvailableDeposit />
          <UsdVaultDepositInputGroup />
        </VaultFormSection>
        <VaultTxInfo>
          <UsdVaultDepositWillReceive />
          <VaultTxInfoRow
            title="Waiting time"
            help={
              <>
                Deposits usually complete within 24 hours, often sooner. You can
                track progress in the Deposit section of the Lido USD Vault UI.
              </>
            }
          >
            {'24 hours'}
          </VaultTxInfoRow>
        </VaultTxInfo>
        <UsdVaultDepositSubmitButton />
      </VaultForm>
    </UsdVaultDepositFormProvider>
  );
};
