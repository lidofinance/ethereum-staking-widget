import { useUsdVaultAvailable } from '../../hooks/use-vault-available';
import { RequestsContainer } from 'modules/mellow-meta-vaults/components/request';
import {
  useUsdVaultDepositRequests,
  useUsdVaultDepositCancel,
  useUsdVaultDepositClaim,
} from '../hooks';
import { UsdVaultDepositPendingRequests } from './deposit-pending-requests';
import { UsdVaultDepositClaimableRequest } from './deposit-claimable-request';
import { useUsdVaultPosition } from '../../hooks/use-position';
import { VaultPosition } from 'features/earn/shared/v2/vault-position/vault-position';
import { USD_VAULT_TOKEN_SYMBOL } from '../../consts';
import { TokenEarnUsdIcon } from 'assets/earn-v2';

export const UsdVaultDepositRequests = () => {
  const { isUsdVaultAvailable } = useUsdVaultAvailable();
  const { cancel, isCanceling } = useUsdVaultDepositCancel();
  const { claim, isClaiming } = useUsdVaultDepositClaim();
  const {
    data: usdVaultPositionData,
    isLoading: isPositionLoading,
    usdBalance: usdAmount,
  } = useUsdVaultPosition();

  const {
    requests: depositRequests,
    pendingRequests,
    totalClaimableShares,
  } = useUsdVaultDepositRequests();

  const usdVaultBalance = usdVaultPositionData?.earnusdSharesBalance ?? 0n;

  if (
    (usdVaultBalance === 0n && depositRequests.length === 0) ||
    !isUsdVaultAvailable
  ) {
    return null;
  }

  return (
    <RequestsContainer>
      <VaultPosition
        position={{
          symbol: USD_VAULT_TOKEN_SYMBOL,
          token: usdVaultPositionData?.earnusdTokenAddress,
          balance: usdVaultBalance,
          icon: <TokenEarnUsdIcon />,
          isLoading: isPositionLoading,
          usdAmount,
        }}
      />
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
