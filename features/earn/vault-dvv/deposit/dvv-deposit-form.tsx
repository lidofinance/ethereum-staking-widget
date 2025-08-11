import { FC } from 'react';
import { FormController } from 'shared/hook-form/form-controller';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { DVVDepositFormProvider } from './form-context';

export const DVVDepositForm: FC = () => {
  return (
    <DVVDepositFormProvider>
      <FormController>
        <SubmitButtonHookForm>Deposit</SubmitButtonHookForm>
      </FormController>
    </DVVDepositFormProvider>
  );
};
