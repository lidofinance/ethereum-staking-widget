import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';
import { VaultTxInfo } from 'features/earn/shared/vault-tx-info';
import { VaultDepositWarning } from 'features/earn/shared/v2/vault-warning/vault-deposit-warning';

import { UsdVaultDepositFormProvider } from './form-context';
import { UsdVaultDepositWillReceive } from './deposit-will-receive';
import { UsdVaultDepositInputGroup } from './deposit-input-group';
import { UsdVaultAvailableDeposit } from './available-deposit';
import { UsdVaultDepositSubmitButton } from './deposit-submit-button';
import { UsdVaultDepositRequests } from './deposit-requests';
import { useUsdVaultAvailable } from '../hooks/use-vault-available';

export const UsdVaultDepositForm = () => {
  const { isUsdVaultAvailable, isDepositEnabled, depositPauseReasonText } =
    useUsdVaultAvailable();

  return (
    <UsdVaultDepositFormProvider>
      <VaultForm data-testid="deposit-form-usd">
        <VaultDepositWarning
          isDepositEnabled={isDepositEnabled}
          isVaultAvailable={isUsdVaultAvailable}
          depositPauseReasonText={depositPauseReasonText}
        />
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
