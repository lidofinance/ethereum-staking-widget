import { FC } from 'react';
import { FormController } from 'shared/hook-form/form-controller';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { GGVDepositFormProvider } from './form-context';

export const GGVDepositForm: FC = () => {
  return (
    <GGVDepositFormProvider>
      <FormController>
        <SubmitButtonHookForm>Deposit</SubmitButtonHookForm>
      </FormController>
    </GGVDepositFormProvider>
  );
};
