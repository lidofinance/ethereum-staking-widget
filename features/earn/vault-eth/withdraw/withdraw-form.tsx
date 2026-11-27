import type { FC } from 'react';

import {
  VaultTxInfo,
  VaultTxInfoRow,
} from 'features/earn/shared/vault-tx-info';
import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';
import { VaultWithdrawWarning } from 'features/earn/shared/vault-warning';
import { WITHDRAWAL_WAITING_TIME_TOOLTIP } from 'modules/mellow-meta-vaults';

import { EthVaultWithdrawFormProvider } from './form-context';
import { EthVaultWithdrawInput } from './withdraw-input';
import { EthVaultWithdrawAvailable } from './withdraw-available';
import { EthVaultWithdrawWillReceive } from './withdraw-will-receive';
import { EthVaultWithdrawSubmitButton } from './withdraw-submit-button';
import { EthVaultWithdrawRequests } from './withdraw-requests';
import { useEthVaultAvailable } from '../hooks/use-vault-available';

const EthVaultWithdrawFormContent: FC = () => {
  const { isEthVaultAvailable, isWithdrawEnabled, withdrawPauseReasonText } =
    useEthVaultAvailable();

  return (
    <VaultForm data-testid="withdraw-form">
      <VaultWithdrawWarning
        isWithdrawEnabled={isWithdrawEnabled}
        isVaultAvailable={isEthVaultAvailable}
        withdrawPauseReasonText={withdrawPauseReasonText}
      />

      <VaultFormSection>
        <EthVaultWithdrawRequests />
        <EthVaultWithdrawAvailable />
        <EthVaultWithdrawInput />
      </VaultFormSection>
      <VaultTxInfo>
        <EthVaultWithdrawWillReceive />
        <VaultTxInfoRow
          title="Waiting time"
          data-testid="waiting-time"
          help={WITHDRAWAL_WAITING_TIME_TOOLTIP}
        >
          {'Instant or up to 72 hours'}
        </VaultTxInfoRow>
      </VaultTxInfo>
      <EthVaultWithdrawSubmitButton />
    </VaultForm>
  );
};

export const EthVaultWithdrawForm: FC = () => {
  return (
    <EthVaultWithdrawFormProvider>
      <EthVaultWithdrawFormContent />
    </EthVaultWithdrawFormProvider>
  );
};
