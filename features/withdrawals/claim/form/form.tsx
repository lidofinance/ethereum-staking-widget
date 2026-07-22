import { BunkerInfo } from './bunker-info';

import { RequestsList } from './requests-list/requests-list';
import { ClaimListBody, ClaimScrollContainer } from './styles';
import { ClaimFormFooterSticky } from './claim-form-footer-sticky';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { SubmitButton } from './submit-button';
import { ClaimFormInputType, useClaimFormData } from '../claim-form-context';
import { useFormState } from 'react-hook-form';
import { TransactionInfo } from './transaction-info';
import { FormController } from 'shared/hook-form/form-controller';

export const ClaimForm = () => {
  const { isBunker } = useWithdrawals();
  const { isLoading } = useFormState<ClaimFormInputType>();
  const { requestsCount } = useClaimFormData();

  const isEmpty = requestsCount === 0;

  return (
    <FormController>
      <ClaimScrollContainer
        style={
          { '--claim-request-count': requestsCount } as React.CSSProperties
        }
      >
        <ClaimListBody data-testid="claimList">
          {isBunker && <BunkerInfo />}
          <RequestsList />
        </ClaimListBody>
        <ClaimFormFooterSticky isEnabled={!isLoading && !isEmpty}>
          <SubmitButton />
          <TransactionInfo />
        </ClaimFormFooterSticky>
      </ClaimScrollContainer>
    </FormController>
  );
};
