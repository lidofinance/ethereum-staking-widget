import { FC } from 'react';
import { FormController } from 'shared/hook-form/form-controller';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { GGVWithdrawFormProvider } from './form-context';

export const GGVWithdrawForm: FC = () => {
  return (
    <GGVWithdrawFormProvider>
      <FormController>
        <SubmitButtonHookForm>Withdraw</SubmitButtonHookForm>
      </FormController>
    </GGVWithdrawFormProvider>
  );
};
