import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';

import { useWrapFormData } from '../wrap-form-context';

export const SubmitButtonWrap = () => {
  const { isMultisig, isApprovalNeededBeforeWrap: isLocked } =
    useWrapFormData();

  return (
    <SubmitButtonHookForm
      // TODO: NEW SDK (Type 'boolean | 0n | undefined' is not assignable to type 'boolean | undefined'.)
      isLocked={isLocked as boolean}
      errorField="amount"
      data-testid="wrapBtn"
    >
      {isLocked ? `Unlock tokens ${isMultisig ? 'to' : 'and'} wrap` : 'Wrap'}
    </SubmitButtonHookForm>
  );
};
