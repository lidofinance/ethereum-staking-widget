import { FC } from 'react';

import { VaultForm } from 'features/earn/shared/vault-form';
import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultTxInfo } from 'features/earn/shared/vault-tx-info';

import { DVVWithdrawFormProvider } from './form-context';
import { DVVWithdrawAvailable } from './dvv-withdraw-available';
import { DVVWithdrawInput } from './dvv-withdraw-input';
import { DVVWithdrawWillReceive } from './dvv-withdraw-will-receive';
import { DVVWithdrawSubmitButton } from './dvv-withdraw-submit';
import { DVVWithdrawWarning } from './dvv-withdraw-warning';

export const DVVWithdrawForm: FC = () => {
  return (
    <DVVWithdrawFormProvider>
      <VaultForm>
        <DVVWithdrawWarning />
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
