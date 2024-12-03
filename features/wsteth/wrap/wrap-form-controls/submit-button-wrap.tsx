import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';

import { useWrapFormData } from '../wrap-form-context';

export const SubmitButtonWrap = () => {
  const { isMultisig, isApprovalNeededBeforeWrap } = useWrapFormData();
  const isLocked = isApprovalNeededBeforeWrap && !isMultisig;

  return (
    <SubmitButtonHookForm
      isLocked={isLocked}
      errorField="amount"
      data-testid="wrapBtn"
    >
      {isLocked && !isMultisig ? `Unlock tokens and wrap` : 'Wrap'}
    </SubmitButtonHookForm>
  );
};
