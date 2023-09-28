import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';

export const SubmitButtonUnwrap = () => {
  return (
    <SubmitButtonHookForm errorField="amount" data-testid="unwrapSubmitBtn">
      Unwrap
    </SubmitButtonHookForm>
  );
};
