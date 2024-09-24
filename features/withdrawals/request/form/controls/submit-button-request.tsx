import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import {
  RequestFormInputType,
  useRequestFormData,
} from '../../request-form-context';

import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { useFormState } from 'react-hook-form';
import { isValidationErrorTypeUnhandled } from 'shared/hook-form/validation/validation-error';
import { useIsMultisig } from 'shared/hooks/useIsMultisig';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

// conditional render breaks useFormState, so it can't be inside SubmitButton
export const useRequestSubmitButtonProps = (): SubmitButtonRequestProps => {
  const { isDappActiveOnL2 } = useDappStatus();
  const { isPaused } = useWithdrawals();
  const { isValidating, isSubmitting, errors } =
    useFormState<RequestFormInputType>({ name: ['requests', 'amount'] });

  return {
    loading: isValidating || isSubmitting,
    disabled:
      isPaused ||
      isDappActiveOnL2 ||
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
  const { isMultisig } = useIsMultisig();
  const { isTokenLocked } = useRequestFormData();
  const buttonTitle = isTokenLocked
    ? `Unlock tokens ${isMultisig ? 'for' : 'and'} withdrawal`
    : 'Request withdrawal';

  return (
    <SubmitButtonHookForm
      errorField="amount"
      loading={loading}
      isLocked={isTokenLocked}
      disabled={disabled}
      data-testid="requestButton"
    >
      {buttonTitle}
    </SubmitButtonHookForm>
  );
};
