import type { FC } from 'react';

import {
  VaultTxInfo,
  VaultTxInfoRow,
} from 'features/earn/shared/vault-tx-info';
import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';

import { UsdVaultWithdrawFormProvider } from './form-context';

const UsdVaultWithdrawFormContent: FC = () => {
  return (
    <VaultForm data-testid="withdraw-form-usd">
      <VaultFormSection>
        {/* TODO: Add UsdVaultWithdrawRequests */}
        {/* TODO: Add UsdVaultWithdrawAvailable */}
        {/* TODO: Add UsdVaultWithdrawInput */}
      </VaultFormSection>
      <VaultTxInfo>
        {/* TODO: Add UsdVaultWithdrawWillReceive */}
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
      {/* TODO: Add UsdVaultWithdrawSubmitButton */}
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
