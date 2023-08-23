import { useFormState } from 'react-hook-form';
import { useWrapFormData } from '../wrap-form-context';

import type { RequestFormInputType } from 'features/withdrawals/request/request-form-context';
import { isValidationErrorTypeUnhandled } from 'shared/hook-form/validation/validation-error';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';

export const SubmitButtonWrap = () => {
  const { isApprovalNeededBeforeWrap: isLocked } = useWrapFormData();
  const { errors } = useFormState<RequestFormInputType>();
  const disabled =
    !!errors.amount && !isValidationErrorTypeUnhandled(errors.amount.type);

  return (
    <SubmitButtonHookForm
      disabled={disabled}
      isLocked={isLocked}
      data-testid="wrapBtn"
    >
      {isLocked ? 'Unlock token to wrap' : 'Wrap'}
    </SubmitButtonHookForm>
  );
};
