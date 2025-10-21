import { useSTGAvailable } from '../../hooks/use-stg-available';
import { RequestsContainer } from '../../components/stg-request/stg-request';
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

  const {
    requests: depositRequests,
    claimableRequests,
    pendingRequests,
  } = useDepositRequests();

  if (depositRequests.length === 0 || !isSTGAvailable) {
    return null;
  }

  const totalClaimableShares = claimableRequests.reduce(
    (sum, requestData) => sum + (requestData.claimableShares ?? 0n),
    0n,
  );

  return (
    <RequestsContainer>
      <STGDepositPendingRequests
        requests={pendingRequests}
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
