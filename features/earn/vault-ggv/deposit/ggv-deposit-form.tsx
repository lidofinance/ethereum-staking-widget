import type { FC } from 'react';

import { FormController } from 'shared/hook-form/form-controller';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';

import { GGVDepositFormProvider } from './form-context';
import { GGVDepositInputGroup } from './ggv-deposit-input-group';
import { GGVAvailableDeposit } from './ggv-avaliable-deposit';
import { GGVWillReceive } from './ggv-will-receive';

export const GGVDepositForm: FC = () => {
  return (
    <GGVDepositFormProvider>
      <FormController>
        <GGVAvailableDeposit />
        <GGVDepositInputGroup />
        <SubmitButtonHookForm>Deposit</SubmitButtonHookForm>
        <GGVWillReceive />
      </FormController>
    </GGVDepositFormProvider>
  );
};
