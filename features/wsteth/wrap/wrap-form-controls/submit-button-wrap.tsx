import { useWrapFormData } from '../wrap-form-context';

import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';

export const SubmitButtonWrap = () => {
  const { isMultisig, isApprovalNeededBeforeWrap: isLocked } =
    useWrapFormData();

  return (
    <SubmitButtonHookForm
      isLocked={isLocked}
      errorField="amount"
      data-testid="wrapBtn"
    >
      {isLocked ? `Unlock tokens ${isMultisig ? 'to' : 'and'} wrap` : 'Wrap'}
    </SubmitButtonHookForm>
  );
};
