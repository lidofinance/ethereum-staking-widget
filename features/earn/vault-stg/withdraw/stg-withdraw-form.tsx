import type { FC } from 'react';

import {
  VaultTxInfo,
  VaultTxInfoRow,
} from 'features/earn/shared/vault-tx-info';
import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';

import { STGWithdrawFormProvider } from './form-context';
import { STGWithdrawInput } from './stg-withdraw-input';
import { STGWithdrawAvailable } from './stg-withdraw-available';
import { STGWithdrawWillReceive } from './stg-withdraw-will-receive';
import { STGWithdrawWarning } from './stg-withdraw-warning';
import { STGWithdrawSubmitButton } from './stg-withdraw-submit';

export const STGWithdrawForm: FC = () => {
  return (
    <STGWithdrawFormProvider>
      <VaultForm data-testid="withdraw-form">
        <STGWithdrawWarning />
        <VaultFormSection>
          <STGWithdrawAvailable />
          <STGWithdrawInput />
        </VaultFormSection>
        <VaultTxInfo>
          <STGWithdrawWillReceive />
          <VaultTxInfoRow title="Waiting time">--</VaultTxInfoRow>
        </VaultTxInfo>
        <STGWithdrawSubmitButton />
      </VaultForm>
    </STGWithdrawFormProvider>
  );
};
