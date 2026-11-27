import { useFormState } from 'react-hook-form';

import { ConnectButton, useSubmitError } from 'features/stake-v2/utils';

import { useStakeForm, type StakeFormInputValues } from './stake-form-context';

// every field the resolver reports on, in the order they matter
const ERROR_FIELDS = ['amount', 'tokenOut', 'tokenIn', 'referral'] as const;

// ConnectButton stands in with "Connect Wallet" / "Switch Network" until the
// wallet is connected and on the form's chain, so only then can it submit.
// A validation error disables it; its text shows on the field (amount)
export const Submit = () => {
  const { isValidating, isSubmitting, disabled } =
    useFormState<StakeFormInputValues>();
  const submitError = useSubmitError<StakeFormInputValues>(ERROR_FIELDS);
  const { route } = useStakeForm();

  return (
    <ConnectButton
      type="submit"
      loading={isValidating || isSubmitting}
      disabled={disabled || !!submitError?.isBlocking}
    >
      {route?.ui.submitLabel ?? 'Stake'}
    </ConnectButton>
  );
};
