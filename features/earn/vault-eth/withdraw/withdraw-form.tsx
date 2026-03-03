import type { FC } from 'react';
import { Block } from '@lidofinance/lido-ui';

import {
  VaultTxInfo,
  VaultTxInfoRow,
} from 'features/earn/shared/vault-tx-info';
import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';

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
    <Block>
      <VaultForm data-testid="withdraw-form">
        <ActionSwitch isWithdraw />
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
    </Block>
  );
};

export const EthVaultWithdrawForm: FC = () => {
  return (
    <EthVaultWithdrawFormProvider>
      <EthVaultWithdrawFormContent />
    </EthVaultWithdrawFormProvider>
  );
};
