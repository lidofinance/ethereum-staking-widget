import { RequestsContainer } from 'modules/mellow-meta-vaults/components/request';

import { useEthVaultAvailable } from '../../hooks/use-vault-available';
import {
  useEthVaultDepositRequests,
  useEthVaultDepositCancel,
  useEthVaultDepositClaim,
} from '../hooks';
import { EthVaultDepositPendingRequests } from './deposit-pending-requests';
import { EthVaultDepositClaimableRequest } from './deposit-claimable-request';

export const EthVaultDepositRequests = () => {
  const { isEthVaultAvailable } = useEthVaultAvailable();
  const { cancel, isCanceling } = useEthVaultDepositCancel();
  const { claim, isClaiming } = useEthVaultDepositClaim();

  const {
    requests: depositRequests,
    pendingRequests,
    totalClaimableShares,
  } = useEthVaultDepositRequests();

  if (depositRequests.length === 0 || !isEthVaultAvailable) {
    return null;
  }

  return (
    <RequestsContainer>
      <EthVaultDepositPendingRequests
        requests={pendingRequests}
        cancel={cancel}
        isLoading={isCanceling || isClaiming}
      />
      <EthVaultDepositClaimableRequest
        claimableShares={totalClaimableShares}
        claim={claim}
        isLoading={isCanceling || isClaiming}
      />
    </RequestsContainer>
  );
};
