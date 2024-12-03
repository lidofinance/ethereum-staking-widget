import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';

import { useWrapFormData } from '../wrap-form-context';

export const SubmitButtonWrap = () => {
  const { isSmartAccount, isApprovalNeededBeforeWrap } = useWrapFormData();
  const isLocked = isApprovalNeededBeforeWrap && !isSmartAccount;

  return (
    <SubmitButtonHookForm
      isLocked={isLocked}
      errorField="amount"
      data-testid="wrapBtn"
    >
      {isLocked && !isSmartAccount ? `Unlock tokens and wrap` : 'Wrap'}
    </SubmitButtonHookForm>
  );
};
