import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';

import { useUnwrapFormData } from '../unwrap-form-context';

export const SubmitButtonUnwrap = () => {
  const { needsApprove } = useUnwrapFormData();

  return (
    <SubmitButtonHookForm
      isLocked={needsApprove}
      errorField="amount"
      data-testid="unwrapSubmitBtn"
    >
      {needsApprove ? `Unlock tokens and unwrap` : 'Unwrap'}
    </SubmitButtonHookForm>
  );
};
