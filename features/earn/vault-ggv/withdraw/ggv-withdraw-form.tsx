import type { FC } from 'react';
import { FormController } from 'shared/hook-form/form-controller';

import { VaultTxInfo } from 'features/earn/shared/vault-tx-info';

import { GGVWithdrawFormProvider } from './form-context';
import { GGVWithdrawInput } from './ggv-withdraw-input';
import { GGVWithdrawAvailable } from './ggv-withdraw-available ';
import { GGVWithdrawWillReceive } from './ggv-withdraw-recieve';
import { GGVWithdrawWarning } from './ggv-withdraw-warning';
import { GGVWithdrawSubmitButton } from './ggv-withdraw-submit';

export const GGVWithdrawForm: FC = () => {
  return (
    <GGVWithdrawFormProvider>
      <FormController>
        <GGVWithdrawWarning />
        <GGVWithdrawAvailable />
        <GGVWithdrawInput />
        <VaultTxInfo>
          <GGVWithdrawWillReceive />
        </VaultTxInfo>
        <GGVWithdrawSubmitButton />
      </FormController>
    </GGVWithdrawFormProvider>
  );
};
