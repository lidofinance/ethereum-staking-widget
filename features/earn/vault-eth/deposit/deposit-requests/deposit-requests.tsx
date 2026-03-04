import { RequestsContainer } from 'modules/mellow-meta-vaults/components/request';
import { VaultPosition } from 'features/earn/shared/v2/vault-position/vault-position';
import { TokenEarnEthIcon } from 'assets/earn-v2';

import { useEthVaultAvailable } from '../../hooks/use-vault-available';
import {
  useEthVaultDepositRequests,
  useEthVaultDepositCancel,
  useEthVaultDepositClaim,
} from '../hooks';
import { EthVaultDepositPendingRequests } from './deposit-pending-requests';
import { EthVaultDepositClaimableRequest } from './deposit-claimable-request';
import { useEthVaultPosition } from '../../hooks/use-position';
import { ETH_VAULT_TOKEN_SYMBOL } from '../../consts';

export const EthVaultDepositRequests = () => {
  const { isEthVaultAvailable } = useEthVaultAvailable();
  const { cancel, isCanceling } = useEthVaultDepositCancel();
  const { claim, isClaiming } = useEthVaultDepositClaim();

  const {
    requests: depositRequests,
    pendingRequests,
    totalClaimableShares,
  } = useEthVaultDepositRequests();

  const {
    data: earnethPositionData,
    isLoading: isPositionLoading,
    usdBalance: usdAmount,
    usdQuery: { isLoading: isPositionLoadingUsd } = { isLoading: false },
  } = useEthVaultPosition();

  const earnethBalance = earnethPositionData?.earnethSharesBalance ?? 0n;

  if (
    (earnethBalance === 0n && depositRequests.length === 0) ||
    !isEthVaultAvailable
  ) {
    return null;
  }

  return (
    <RequestsContainer>
      <VaultPosition
        position={{
          symbol: ETH_VAULT_TOKEN_SYMBOL,
          token: earnethPositionData?.earnethTokenAddress,
          balance: earnethBalance,
          icon: <TokenEarnEthIcon />,
          isLoading: isPositionLoading || isPositionLoadingUsd,
          usdAmount,
        }}
      />
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
