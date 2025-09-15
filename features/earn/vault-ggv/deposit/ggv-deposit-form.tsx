import type { FC } from 'react';

import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';
import { VaultTxInfo } from 'features/earn/shared/vault-tx-info';

import { GGVDepositFormProvider } from './form-context';
import { GGVDepositInputGroup } from './ggv-deposit-input-group';
import { GGVAvailableDeposit } from './ggv-available-deposit';
import { GGVWillReceive } from './ggv-deposit-will-receive';
import { GGVDepositSubmitButton } from './ggv-deposit-submit-botton';
import { GGVDepositWarning } from './ggv-deposit-warning';
import { VaultWarning } from 'features/earn/shared/vault-warning';

export const GGVDepositForm: FC = () => {
  return (
    <GGVDepositFormProvider>
      <VaultForm data-testid="deposit-form">
        <GGVDepositWarning />
        <VaultFormSection>
          <GGVAvailableDeposit />
          <GGVDepositInputGroup />
        </VaultFormSection>
        <VaultTxInfo>
          <GGVWillReceive />
        </VaultTxInfo>
        <VaultWarning variant="info">
          Deposited funds cannot be withdrawn, and GG token is non-transferable
          for 24 hours after deposit.
          <br />
          Withdrawals are only in wstETH, regardless of deposited asset(s).
        </VaultWarning>
        <GGVDepositSubmitButton />
      </VaultForm>
    </GGVDepositFormProvider>
  );
};
