import { Block } from '@lidofinance/lido-ui';

import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';
import {
  VaultTxInfo,
  VaultTxInfoRow,
} from 'features/earn/shared/vault-tx-info';

import { EthDepositFormProvider } from './form-context';
import { EthVaultDepositInputGroup } from './deposit-input-group';
import { EthVaultDepositWillReceive } from './deposit-will-receive';
import { EthVaultDepositSubmitButton } from './deposit-submit-button';
import { EthVaultAvailableDeposit } from './available-deposit';
import { EthVaultDepositRequests } from './deposit-requests';
import { ActionSwitch } from '../components/action-switch';
import { UpgradeAssetsBlock } from '../upgrade-assets/upgrade-assets';

export const EthVaultDepositForm = () => {
  return (
    <EthDepositFormProvider>
      <UpgradeAssetsBlock />
      <Block>
        <ActionSwitch />
        <VaultForm data-testid="deposit-form">
          <VaultFormSection>
            <EthVaultDepositRequests />
            <EthVaultAvailableDeposit />
            <EthVaultDepositInputGroup />
          </VaultFormSection>
          <VaultTxInfo>
            <EthVaultDepositWillReceive />
            <VaultTxInfoRow
              title="Waiting time"
              help={
                <>
                  Deposits usually complete within 24 hours, often sooner. You
                  can track progress in the Deposit section of the Lido stRATEGY
                  UI.
                </>
              }
            >
              {'24 hours'}
            </VaultTxInfoRow>
          </VaultTxInfo>
          <EthVaultDepositSubmitButton />
        </VaultForm>
      </Block>
    </EthDepositFormProvider>
  );
};
