import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';
import { VaultTxInfo } from 'features/earn/shared/vault-tx-info';
import { BlockSidePanel } from 'features/earn/shared/v2/block-side-panel/block-side-panel';
import { VaultDepositWarning } from 'features/earn/shared/v2/vault-warning/vault-deposit-warning';

import { EthDepositFormProvider } from './form-context';
import { EthVaultDepositInputGroup } from './deposit-input-group';
import { EthVaultDepositWillReceive } from './deposit-will-receive';
import { EthVaultDepositSubmitButton } from './deposit-submit-button';
import { EthVaultAvailableDeposit } from './available-deposit';
import { EthVaultDepositRequests } from './deposit-requests';
import { ActionSwitch } from '../components/action-switch';
import { UpgradeAssetsBlock } from '../upgrade-assets/upgrade-assets';
import { useEthVaultAvailable } from '../hooks/use-vault-available';

export const EthVaultDepositForm = () => {
  const { isEthVaultAvailable, isDepositEnabled, depositPauseReasonText } =
    useEthVaultAvailable();

  return (
    <EthDepositFormProvider>
      <UpgradeAssetsBlock />
      <BlockSidePanel>
        <ActionSwitch />
        <VaultForm data-testid="deposit-form">
          <VaultDepositWarning
            isDepositEnabled={isDepositEnabled}
            isVaultAvailable={isEthVaultAvailable}
            depositPauseReasonText={depositPauseReasonText}
          />
          <VaultFormSection>
            <EthVaultDepositRequests />
            <EthVaultAvailableDeposit />
            <EthVaultDepositInputGroup />
          </VaultFormSection>
          <VaultTxInfo>
            <EthVaultDepositWillReceive />
          </VaultTxInfo>
          <EthVaultDepositSubmitButton />
        </VaultForm>
      </BlockSidePanel>
    </EthDepositFormProvider>
  );
};
