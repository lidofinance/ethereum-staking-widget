import type { FC } from 'react';

import {
  VaultTxInfo,
  VaultTxInfoRow,
} from 'features/earn/shared/vault-tx-info';
import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';

import { UsdVaultWithdrawFormProvider } from './form-context';
import { UsdVaultWithdrawRequests } from './withdraw-requests';
import { UsdVaultWithdrawAvailable } from './withdraw-available';
import { UsdVaultWithdrawInput } from './withdraw-input';
import { UsdVaultWithdrawWillReceive } from './withdraw-will-receive';
import { UsdVaultWithdrawSubmitButton } from './withdraw-submit-button';

const UsdVaultWithdrawFormContent: FC = () => {
  return (
    <VaultForm data-testid="withdraw-form-usd">
      <VaultFormSection>
        <UsdVaultWithdrawRequests />
        <UsdVaultWithdrawAvailable />
        <UsdVaultWithdrawInput />
      </VaultFormSection>
      <VaultTxInfo>
        <UsdVaultWithdrawWillReceive />
        <VaultTxInfoRow
          title="Waiting time"
          help={
            <>
              Withdrawals take up to 72 hours to process. Once ready, your funds
              can be claimed in the Lido UI
            </>
          }
        >
          {'up to 72 hours'}
        </VaultTxInfoRow>
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
