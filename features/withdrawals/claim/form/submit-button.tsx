import { Connect } from 'shared/wallet';
import { Button } from '@lidofinance/lido-ui';
import { useWeb3 } from 'reef-knot/web3-react';
import { FormatToken } from 'shared/formatters/format-token';
import { ClaimFormInputType, useClaimFormData } from '../claim-form-context';
import { Zero } from '@ethersproject/constants';
import { useFormState } from 'react-hook-form';

export const SubmitButton = () => {
  const { active } = useWeb3();
  const { isSubmitting, isValidating, errors } =
    useFormState<ClaimFormInputType>();
  const { ethToClaim } = useClaimFormData();
  const { requestsCount, selectedRequests } = useClaimFormData();

  if (!active) return <Connect fullwidth />;

  const claimButtonAmount = ethToClaim.lte(Zero) ? null : (
    <FormatToken amount={ethToClaim} symbol="ETH" />
  );

  const disabled =
    Boolean(errors.requests) ||
    requestsCount === 0 ||
    selectedRequests.length === 0;

  return (
    <Button
      fullwidth
      disabled={disabled}
      loading={isSubmitting || isValidating}
      type="submit"
    >
      Claim {claimButtonAmount}
    </Button>
  );
};
