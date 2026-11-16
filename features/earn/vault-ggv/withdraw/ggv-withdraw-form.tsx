import type { FC } from 'react';

import { VaultTxInfo } from 'features/earn/shared/vault-tx-info';
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
import { GGVWithdrawWaitingTime } from './ggv-withdraw-waiting-time';

export const GGVWithdrawForm: FC = () => {
  return (
    <GGVWithdrawFormProvider>
      <VaultForm $gap={12} data-testid="withdraw-form">
        <GGVWithdrawRequest />
        <GGVWhenNoActiveRequests>
          <GGVWithdrawWarning />
          <VaultFormSection>
            <GGVWithdrawAvailable />
            <GGVWithdrawInput />
          </VaultFormSection>
          <VaultTxInfo>
            <GGVWithdrawWillReceive />
            <GGVWithdrawWaitingTime />
          </VaultTxInfo>
          <GGVWithdrawSubmitButton />
        </GGVWhenNoActiveRequests>
      </VaultForm>
    </GGVWithdrawFormProvider>
  );
};
