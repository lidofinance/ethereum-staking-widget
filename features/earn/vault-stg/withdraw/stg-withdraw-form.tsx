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
import { STGWithdrawSubmitButton } from './stg-withdraw-submit-button';
import { STGWithdrawRequests } from './stg-withdraw-requests';

const STGWithdrawFormContent: FC = () => {
  return (
    <VaultForm data-testid="withdraw-form">
      <VaultFormSection>
        <STGWithdrawRequests />
        <STGWithdrawAvailable />
        <STGWithdrawInput />
      </VaultFormSection>
      <VaultTxInfo>
        <STGWithdrawWillReceive />
        <VaultTxInfoRow title="Waiting time">{'~2 days'}</VaultTxInfoRow>
      </VaultTxInfo>
      <STGWithdrawSubmitButton />
    </VaultForm>
  );
};

export const STGWithdrawForm: FC = () => {
  return (
    <STGWithdrawFormProvider>
      <STGWithdrawFormContent />
    </STGWithdrawFormProvider>
  );
};
