import { useSTGAvailable } from '../../hooks/use-stg-available';
import { RequestsContainer } from '../../components/request/stg-request';
import {
  useDepositRequests,
  useSTGDepositCancel,
  useSTGDepositClaim,
} from '../hooks';
import { STGDepositPendingRequests } from './stg-deposit-pending-requests';
import { STGDepositClaimableRequest } from './stg-deposit-claimable-request';

export const STGDepositRequests = () => {
  const { isSTGAvailable } = useSTGAvailable();
  const { cancel, isCanceling } = useSTGDepositCancel();
  const { claim, isClaiming } = useSTGDepositClaim();

  const depositRequests = useDepositRequests();

  const totalClaimableShares = depositRequests.reduce(
    (sum, requestData) => sum + (requestData.claimableShares ?? 0n),
    0n,
  );

  const hasAnyDepositRequests = depositRequests.length > 0;

  if (!hasAnyDepositRequests || !isSTGAvailable) {
    return null;
  }

  return (
    <RequestsContainer>
      <STGDepositPendingRequests
        depositRequests={depositRequests}
        cancel={cancel}
        isLoading={isCanceling || isClaiming}
      />
      <STGDepositClaimableRequest
        claimableShares={totalClaimableShares}
        claim={claim}
        isLoading={isCanceling || isClaiming}
      />
    </RequestsContainer>
  );
};
