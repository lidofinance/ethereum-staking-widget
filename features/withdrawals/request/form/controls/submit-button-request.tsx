import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import {
  RequestFormInputType,
  useRequestFormData,
} from '../../request-form-context';

import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { useFormState } from 'react-hook-form';
import { isValidationErrorTypeUnhandled } from 'shared/hook-form/validation/validation-error';
import { useAA, useDappStatus } from 'modules/web3';
import { DisabledButton } from 'shared/wallet';

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
  const { isSupportedChain } = useDappStatus();
  const { isAA } = useAA();
  const { isTokenLocked } = useRequestFormData();

  const isLocked = isTokenLocked && !isAA;

  const buttonTitle = isLocked
    ? `Unlock tokens and withdraw`
    : 'Request withdrawal';

  if (!isSupportedChain) {
    return <DisabledButton>Request withdrawal</DisabledButton>;
  }

  return (
    <SubmitButtonHookForm
      errorField="amount"
      loading={loading}
      isLocked={isLocked}
      disabled={disabled}
      data-testid="requestButton"
    >
      {buttonTitle}
    </SubmitButtonHookForm>
  );
};
