import { FC } from 'react';
import { FormController } from 'shared/hook-form/form-controller';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { DVVWithdrawFormProvider } from './form-context';

export const DVVWithdrawForm: FC = () => {
  return (
    <DVVWithdrawFormProvider>
      <FormController>
        <SubmitButtonHookForm>Withdraw</SubmitButtonHookForm>
      </FormController>
    </DVVWithdrawFormProvider>
  );
};
