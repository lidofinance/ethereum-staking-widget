import type { FC } from 'react';

import { VaultForm } from 'features/earn/shared/vault-form';
import { VaultSubmitButton } from 'features/earn/shared/vault-submit-button';
import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultWarning } from 'features/earn/shared/vault-warning';

import { useDVVAvailable } from '../hooks/use-dvv-available';
import { DVVDepositFormProvider } from './form-context';
import { DVVDepositInputGroup } from './dvv-deposit-input-group';
import { DVVDepositAvailable } from './dvv-deposit-available';
import { DVVDepositWillReceive } from './dvv-deposit-will-recieve';
import { DVVDepositWarning } from './dvv-deposit-warning';

export const DVVDepositForm: FC = () => {
  const { isDVVAvailable } = useDVVAvailable();
  return (
    <DVVDepositFormProvider>
      <VaultForm>
        <DVVDepositWarning />
        <VaultFormSection>
          <DVVDepositAvailable />
          <DVVDepositInputGroup />
        </VaultFormSection>
        <DVVDepositWillReceive />
        <VaultWarning variant="info">
          Withdrawing less than 3 days after deposit reduces rewards.
          <br />
          Withdrawals are only in wstETH, regardless of the deposit asset.
        </VaultWarning>
        <VaultSubmitButton isAvailable={isDVVAvailable}>
          Deposit
        </VaultSubmitButton>
      </VaultForm>
    </DVVDepositFormProvider>
  );
};
