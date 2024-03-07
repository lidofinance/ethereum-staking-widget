import { Connect } from 'shared/wallet';
import { Button } from '@lidofinance/lido-ui';
import { useWeb3 } from 'reef-knot/web3-react';
import { FormatToken } from 'shared/formatters/format-token';
import { ClaimFormInputType, useClaimFormData } from '../claim-form-context';
import { Zero } from '@ethersproject/constants';
import { useFormState } from 'react-hook-form';
import { isValidationErrorTypeUnhandled } from 'shared/hook-form/validation/validation-error';

export const SubmitButton = () => {
  const { active } = useWeb3();
  const { isSubmitting, isValidating, errors } =
    useFormState<ClaimFormInputType>();
  const { ethToClaim } = useClaimFormData();
  const { selectedRequests } = useClaimFormData();

  if (!active) return <Connect fullwidth />;

  const claimButtonAmount = ethToClaim.lte(Zero) ? null : (
    <FormatToken showAmountTip={false} amount={ethToClaim} symbol="ETH" />
  );

  const disabled =
    (!!errors.requests &&
      !isValidationErrorTypeUnhandled(errors.requests.type)) ||
    selectedRequests.length === 0;

  return (
    <Button
      data-testid="claimButton"
      fullwidth
      disabled={disabled}
      loading={isSubmitting || isValidating}
      type="submit"
    >
      Claim {claimButtonAmount}
    </Button>
  );
};
