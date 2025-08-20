import { FC } from 'react';

import { VaultForm } from 'features/earn/shared/vault-form';
import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultTxInfo } from 'features/earn/shared/vault-tx-info';

import { DVVWithdrawFormProvider } from './form-context';
import { DVVWithdrawAvailable } from './dvv-withdraw-available';
import { DVVWithdrawInput } from './dvv-withdraw-input';
import { DVVWithdrawWillReceive } from './dvv-withdraw-will-receive';
import { DVVWithdrawSubmitButton } from './dvv-withdraw-submit';
import { DVVWithdrawStatus } from './dvv-withdraw-status';

export const DVVWithdrawForm: FC = () => {
  return (
    <DVVWithdrawFormProvider>
      <VaultForm>
        <DVVWithdrawStatus />
        <VaultFormSection>
          <DVVWithdrawAvailable />
          <DVVWithdrawInput />
        </VaultFormSection>
        <VaultTxInfo>
          <DVVWithdrawWillReceive />
        </VaultTxInfo>
        <DVVWithdrawSubmitButton />
      </VaultForm>
    </DVVWithdrawFormProvider>
  );
};
