import { useFormState } from 'react-hook-form';

import { Connect, DisabledButton } from 'shared/wallet';
import { FormatToken } from 'shared/formatters/format-token';
import { isValidationErrorTypeUnhandled } from 'shared/hook-form/validation/validation-error';

import { useDappStatus } from 'modules/web3';

import { ClaimFormInputType, useClaimFormData } from '../claim-form-context';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';

export const SubmitButton = () => {
  const { isSupportedChain, isWalletConnected } = useDappStatus();

  const { errors } = useFormState<ClaimFormInputType>();
  const { ethToClaim } = useClaimFormData();
  const { selectedRequests } = useClaimFormData();

  if (!isWalletConnected) return <Connect fullwidth />;

  if (!isSupportedChain) {
    return <DisabledButton>Claim</DisabledButton>;
  }

  const disabled =
    (!!errors.requests &&
      !isValidationErrorTypeUnhandled(errors.requests.type)) ||
    selectedRequests.length === 0;

  const claimButtonAmount = ethToClaim ? (
    <FormatToken showAmountTip={false} amount={ethToClaim} symbol="ETH" />
  ) : null;

  return (
    <SubmitButtonHookForm disabled={disabled} data-testid="claimButton">
      Claim {claimButtonAmount}
    </SubmitButtonHookForm>
  );
};
