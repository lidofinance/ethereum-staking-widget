import type { FC } from 'react';

import { VaultTxInfo } from 'features/earn/shared/vault-tx-info';
import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';
import { VaultWithdrawWarning } from 'features/earn/shared/v2/vault-warning';

import { UsdVaultWithdrawFormProvider } from './form-context';
import { UsdVaultWithdrawRequests } from './withdraw-requests';
import { UsdVaultWithdrawAvailable } from './withdraw-available';
import { UsdVaultWithdrawInput } from './withdraw-input';
import { UsdVaultWithdrawWillReceive } from './withdraw-will-receive';
import { UsdVaultWithdrawWaitingTime } from './withdraw-waiting-time';
import { UsdVaultWithdrawSubmitButton } from './withdraw-submit-button';
import { useUsdVaultAvailable } from '../hooks/use-vault-available';

const UsdVaultWithdrawFormContent: FC = () => {
  const { isUsdVaultAvailable, isWithdrawEnabled, withdrawPauseReasonText } =
    useUsdVaultAvailable();

  return (
    <VaultForm data-testid="withdraw-form">
      <VaultWithdrawWarning
        isWithdrawEnabled={isWithdrawEnabled}
        isVaultAvailable={isUsdVaultAvailable}
        withdrawPauseReasonText={withdrawPauseReasonText}
      />
      <VaultFormSection>
        <UsdVaultWithdrawRequests />
        <UsdVaultWithdrawAvailable />
        <UsdVaultWithdrawInput />
      </VaultFormSection>
      <VaultTxInfo>
        <UsdVaultWithdrawWillReceive />
        <UsdVaultWithdrawWaitingTime />
      </VaultTxInfo>
      <UsdVaultWithdrawSubmitButton />
    </VaultForm>
  );
};

export const UsdVaultWithdrawForm: FC = () => {
  return (
    <UsdVaultWithdrawFormProvider>
      <UsdVaultWithdrawFormContent />
    </UsdVaultWithdrawFormProvider>
  );
};
