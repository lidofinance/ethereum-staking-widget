import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';

import { useUnwrapFormData } from '../unwrap-form-context';

export const SubmitButtonUnwrap = () => {
  const { isMultisig, isApprovalNeededBeforeUnwrap: isLocked } =
    useUnwrapFormData();

  return (
    <SubmitButtonHookForm errorField="amount" data-testid="unwrapSubmitBtn">
      {isLocked
        ? `Unlock tokens ${isMultisig ? 'to' : 'and'} unwrap`
        : 'Unwrap'}
    </SubmitButtonHookForm>
  );
};
