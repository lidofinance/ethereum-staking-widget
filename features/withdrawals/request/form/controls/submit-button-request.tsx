import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import {
  RequestFormInputType,
  useRequestFormData,
} from '../../request-form-context';

import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { useFormState } from 'react-hook-form';
import { isValidationErrorTypeUnhandled } from 'shared/hook-form/validation/validation-error';

// conditional render breaks useFormState, so it can't be inside SubmitButton
export const useRequestSubmitButtonProps = (): SubmitButtonRequestProps => {
  const { isPaused } = useWithdrawals();
  const { isValidating, isSubmitting, errors } =
    useFormState<RequestFormInputType>({ name: ['requests', 'amount'] });

  return {
    loading: isValidating || isSubmitting,
    disabled:
      isPaused ||
      (!!errors.amount && !isValidationErrorTypeUnhandled(errors.amount.type)),
  };
};

type SubmitButtonRequestProps = {
  loading?: boolean;
  disabled?: boolean;
};

export const SubmitButtonRequest = ({
  loading,
  disabled,
}: SubmitButtonRequestProps) => {
  const { isTokenLocked } = useRequestFormData();
  const buttonTitle = isTokenLocked
    ? 'Unlock tokens for withdrawal'
    : 'Request withdrawal';

  return (
    <SubmitButtonHookForm
      loading={loading}
      isLocked={isTokenLocked}
      disabled={disabled}
      data-testid="requestButton"
    >
      {buttonTitle}
    </SubmitButtonHookForm>
  );
};
