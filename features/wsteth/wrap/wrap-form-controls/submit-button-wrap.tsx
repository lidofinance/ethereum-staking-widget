import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';

import { useWrapFormData } from '../wrap-form-context';

export const SubmitButtonWrap = () => {
  const { needsApprove } = useWrapFormData();

  return (
    <SubmitButtonHookForm
      isLocked={needsApprove}
      errorField="amount"
      data-testid="wrapBtn"
    >
      {needsApprove ? `Unlock tokens and wrap` : 'Wrap'}
    </SubmitButtonHookForm>
  );
};
