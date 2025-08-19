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
import { GGVWithdrawWillReceive } from './ggv-withdraw-recieve';
import { GGVWithdrawWarning } from './ggv-withdraw-warning';
import { GGVWithdrawSubmitButton } from './ggv-withdraw-submit';
import { GGVWithdrawRequest } from './ggv-withdraw-request';
import { GGVWhenNoActiveRequests } from './ggv-when-no-active-requests';

export const GGVWithdrawForm: FC = () => {
  return (
    <GGVWithdrawFormProvider>
      <VaultForm>
        <GGVWithdrawRequest />
        <GGVWhenNoActiveRequests>
          <GGVWithdrawWarning />
          <VaultFormSection>
            <GGVWithdrawAvailable />
            <GGVWithdrawInput />
          </VaultFormSection>
          <VaultTxInfo>
            <GGVWithdrawWillReceive />
            <VaultTxInfoRow title="Waiting Time:">3 days</VaultTxInfoRow>
          </VaultTxInfo>
          <GGVWithdrawSubmitButton />
        </GGVWhenNoActiveRequests>
      </VaultForm>
    </GGVWithdrawFormProvider>
  );
};
