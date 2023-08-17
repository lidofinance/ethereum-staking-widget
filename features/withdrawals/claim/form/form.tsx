import { useRef } from 'react';

import { BunkerInfo } from './bunker-info';

import { RequestsList } from './requests-list/requests-list';
import { ClaimFormBody } from './styles';
import { ClaimFormFooterSticky } from './claim-form-footer-sticky';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { SubmitButton } from './submit-button';
import { ClaimFormInputType, useClaimFormData } from '../claim-form-context';
import { useFormState } from 'react-hook-form';
import { TransactionInfo } from './transaction-info';

export const ClaimForm = () => {
  const refRequests = useRef<HTMLDivElement>(null);
  const { isBunker } = useWithdrawals();
  const { isLoading } = useFormState<ClaimFormInputType>();
  const { onSubmit, requestsCount } = useClaimFormData();

  const isEmpty = requestsCount === 0;

  return (
    <form onSubmit={onSubmit}>
      <ClaimFormBody>
        {isBunker && <BunkerInfo />}
        <div ref={refRequests}>
          <RequestsList />
        </div>
      </ClaimFormBody>
      <ClaimFormFooterSticky
        isEnabled={!isLoading && !isEmpty}
        refRequests={refRequests}
        positionDeps={[requestsCount]}
      >
        <SubmitButton />
        <TransactionInfo />
      </ClaimFormFooterSticky>
    </form>
  );
};
