import type { FC } from 'react';

import {
  VaultTxInfo,
  VaultTxInfoRow,
} from 'features/earn/shared/vault-tx-info';
import { VaultFormSection } from 'features/earn/shared/vault-form-section';
import { VaultForm } from 'features/earn/shared/vault-form';

import { GGVWithdrawFormProvider } from './form-context';
import { GGVWithdrawInput } from './ggv-withdraw-input';
import { GGVWithdrawAvailable } from './ggv-withdraw-available';
import { GGVWithdrawWillReceive } from './ggv-withdraw-will-receive';
import { GGVWithdrawWarning } from './ggv-withdraw-warning';
import { GGVWithdrawSubmitButton } from './ggv-withdraw-submit';
import { GGVWithdrawRequest } from './ggv-withdraw-request';
import { GGVWhenNoActiveRequests } from './ggv-when-no-active-requests';

export const GGVWithdrawForm: FC = () => {
  return (
    <GGVWithdrawFormProvider>
      <VaultForm data-testid="withdraw-form">
        <GGVWithdrawRequest />
        <GGVWhenNoActiveRequests>
          <GGVWithdrawWarning />
          <VaultFormSection>
            <GGVWithdrawAvailable />
            <GGVWithdrawInput />
          </VaultFormSection>
          <VaultTxInfo>
            <GGVWithdrawWillReceive />
            <VaultTxInfoRow
              title="Waiting time"
              help={
                <>
                  Withdrawals usually complete within 3 days, often sooner. You
                  can track progress in your wallet or in the Withdrawal section
                  of the Lido GGV UI.
                </>
              }
              data-testid="waiting-time"
            >
              3 days
            </VaultTxInfoRow>
          </VaultTxInfo>
          <GGVWithdrawSubmitButton />
        </GGVWhenNoActiveRequests>
      </VaultForm>
    </GGVWithdrawFormProvider>
  );
};
