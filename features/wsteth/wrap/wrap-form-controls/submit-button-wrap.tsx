import { useWrapFormData } from '../wrap-form-context';

import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';

export const SubmitButtonWrap = () => {
  const { isApprovalNeededBeforeWrap: isLocked } = useWrapFormData();

  return (
    <SubmitButtonHookForm
      isLocked={isLocked}
      errorField="amount"
      data-testid="wrapBtn"
    >
      {isLocked ? 'Unlock token to wrap' : 'Wrap'}
    </SubmitButtonHookForm>
  );
};
