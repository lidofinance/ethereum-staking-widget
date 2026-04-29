import { useUsdVaultAvailable } from '../../hooks/use-vault-available';
import { RequestsContainer } from 'modules/mellow-meta-vaults/components/request';
import {
  useUsdVaultDepositRequests,
  useUsdVaultDepositCancel,
  useUsdVaultDepositClaim,
} from '../hooks';
import { UsdVaultDepositPendingRequests } from './deposit-pending-requests';
import { UsdVaultDepositClaimableRequest } from './deposit-claimable-request';

export const UsdVaultDepositRequests = () => {
  const { isUsdVaultAvailable } = useUsdVaultAvailable();
  const { cancel, isCanceling } = useUsdVaultDepositCancel();
  const { claim, isClaiming } = useUsdVaultDepositClaim();

  const {
    requests: depositRequests,
    pendingRequests,
    totalClaimableShares,
  } = useUsdVaultDepositRequests();

  if (depositRequests.length === 0 || !isUsdVaultAvailable) {
    return null;
  }

  return (
    <RequestsContainer>
      <UsdVaultDepositPendingRequests
        requests={pendingRequests}
        cancel={cancel}
        isLoading={isCanceling || isClaiming}
      />
      <UsdVaultDepositClaimableRequest
        claimableShares={totalClaimableShares}
        claim={claim}
        isLoading={isCanceling || isClaiming}
      />
    </RequestsContainer>
  );
};
