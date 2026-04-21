import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';
import { VaultTxInfo } from 'features/earn/shared/vault-tx-info';

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
        </VaultTxInfo>
        <UsdVaultDepositSubmitButton />
      </VaultForm>
    </UsdVaultDepositFormProvider>
  );
};
