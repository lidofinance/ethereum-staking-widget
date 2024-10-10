import { useFormState } from 'react-hook-form';
import { useAccount } from 'wagmi';
import { Button } from '@lidofinance/lido-ui';
import { Zero } from '@ethersproject/constants';

import { Connect, DisabledButton } from 'shared/wallet';
import { FormatToken } from 'shared/formatters/format-token';
import { useDappStatus } from 'shared/hooks/use-dapp-status';
import { useIsSupportedChain } from 'shared/hooks/use-is-supported-chain';
import { isValidationErrorTypeUnhandled } from 'shared/hook-form/validation/validation-error';

import { ClaimFormInputType, useClaimFormData } from '../claim-form-context';

export const SubmitButton = () => {
  const { isAccountActiveOnL2 } = useDappStatus();
  const { isConnected } = useAccount();
  const isSupportedChain = useIsSupportedChain();

  const { isSubmitting, isValidating, errors } =
    useFormState<ClaimFormInputType>();
  const { ethToClaim } = useClaimFormData();
  const { selectedRequests } = useClaimFormData();

  if (!isConnected) return <Connect fullwidth />;

  if (!isSupportedChain || isAccountActiveOnL2) {
    return <DisabledButton>Claim</DisabledButton>;
  }

  const disabled =
    (!!errors.requests &&
      !isValidationErrorTypeUnhandled(errors.requests.type)) ||
    selectedRequests.length === 0;

  const claimButtonAmount = ethToClaim.lte(Zero) ? null : (
    <FormatToken showAmountTip={false} amount={ethToClaim} symbol="ETH" />
  );

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
