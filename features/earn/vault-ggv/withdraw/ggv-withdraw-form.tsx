import type { FC } from 'react';
import { FormController } from 'shared/hook-form/form-controller';

import { VaultTxInfo } from 'features/earn/shared/vault-tx-info';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';

import { GGVWithdrawFormProvider } from './form-context';
import { GGVWithdrawInput } from './ggv-withdraw-input';
import { GGVWithdrawAvailable } from './ggv-withdraw-available ';
import { GGVWithdrawWillReceive } from './ggv-withdraw-recieve';

export const GGVWithdrawForm: FC = () => {
  return (
    <GGVWithdrawFormProvider>
      <FormController>
        <GGVWithdrawAvailable />
        <GGVWithdrawInput />
        <VaultTxInfo>
          <GGVWithdrawWillReceive />
        </VaultTxInfo>
        <SubmitButtonHookForm>Withdraw</SubmitButtonHookForm>
      </FormController>
    </GGVWithdrawFormProvider>
  );
};
