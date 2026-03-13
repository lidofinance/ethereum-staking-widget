import type { FC } from 'react';

import {
  VaultTxInfo,
  VaultTxInfoRow,
} from 'features/earn/shared/vault-tx-info';
import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';
import { BlockSidePanel } from 'features/earn/shared/v2/block-side-panel/block-side-panel';

import { EthVaultWithdrawFormProvider } from './form-context';
import { EthVaultWithdrawInput } from './withdraw-input';
import { EthVaultWithdrawAvailable } from './withdraw-available';
import { EthVaultWithdrawWillReceive } from './withdraw-will-receive';
import { EthVaultWithdrawSubmitButton } from './withdraw-submit-button';
import { EthVaultWithdrawRequests } from './withdraw-requests';
import { ActionSwitch } from '../components/action-switch';

// TODO: add Withdraw Warning and ability to disable withdraw via config

const EthVaultWithdrawFormContent: FC = () => {
  return (
    <BlockSidePanel>
      <ActionSwitch isWithdraw />
      <VaultForm data-testid="withdraw-form">
        <VaultFormSection>
          <EthVaultWithdrawRequests />
          <EthVaultWithdrawAvailable />
          <EthVaultWithdrawInput />
        </VaultFormSection>
        <VaultTxInfo>
          <EthVaultWithdrawWillReceive />
          <VaultTxInfoRow
            title="Waiting time"
            help={
              <>
                Withdrawals take up to 72 hours to process. Once ready, your
                funds can be claimed in the Lido UI
              </>
            }
          >
            {'up to 72 hours'}
          </VaultTxInfoRow>
        </VaultTxInfo>
        <EthVaultWithdrawSubmitButton />
      </VaultForm>
    </BlockSidePanel>
  );
};

export const EthVaultWithdrawForm: FC = () => {
  return (
    <EthVaultWithdrawFormProvider>
      <EthVaultWithdrawFormContent />
    </EthVaultWithdrawFormProvider>
  );
};
