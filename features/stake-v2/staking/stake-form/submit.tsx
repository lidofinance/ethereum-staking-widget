import { useFormState } from 'react-hook-form';

import { ConnectButton } from 'features/stake-v2/utils';
import { isValidationErrorTypeValidate } from 'shared/hook-form/validation/validation-error';

import type { StakeFormInputValues } from './stake-form-context';

// ConnectButton stands in with "Connect Wallet" / "Switch Network" until the
// wallet is connected and on the form's chain, so only then can it submit
export const Submit = () => {
  const { isValidating, isSubmitting, disabled, errors } =
    useFormState<StakeFormInputValues>();
  const hasAmountError = isValidationErrorTypeValidate(errors.amount?.type);

  return (
    <ConnectButton
      type="submit"
      loading={isValidating || isSubmitting}
      disabled={disabled || hasAmountError}
    >
      Stake
    </ConnectButton>
  );
};
