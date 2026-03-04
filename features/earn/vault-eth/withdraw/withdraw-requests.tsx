import { Question, Tooltip } from '@lidofinance/lido-ui';
import {
  RequestsContainer,
  ActionableTitle,
} from 'modules/mellow-meta-vaults/components/request';
import { useEthVaultWithdrawRequests } from './hooks/use-withdraw-requests';
import { EthVaultWithdrawRequestClaimable } from './withdraw-request/withdraw-request-claimable';
import { EthVaultWithdrawRequestPending } from './withdraw-request/withdraw-request-pending';
import { useEthVaultAvailable } from '../hooks/use-vault-available';
import { useEthVaultWithdrawClaim } from './hooks/use-withdraw-claim';
import { useEthVaultPosition } from '../hooks/use-position';
import { TokenEarnEthIcon } from 'assets/earn-v2';
import { ETH_VAULT_TOKEN_SYMBOL } from '../consts';
import { VaultPosition } from 'features/earn/shared/v2/vault-position';

export const EthVaultWithdrawRequests = () => {
  const { isEthVaultAvailable } = useEthVaultAvailable();
  const { data: requestsData } = useEthVaultWithdrawRequests();
  const { withdrawClaim, isClaiming } = useEthVaultWithdrawClaim();

  const {
    data: earnethPositionData,
    isLoading,
    usdBalance: usdAmount,
    usdQuery: { isLoading: isLoadingUsd } = { isLoading: false },
  } = useEthVaultPosition();

  const earnethBalance = earnethPositionData?.earnethSharesBalance ?? 0n;

  const requests = requestsData?.requests || [];
  const claimableRequests = requestsData?.claimableRequests || [];
  const pendingRequests = requestsData?.pendingRequests || [];

  const TOOLTIP_TEXT =
    'The final claimable wstETH may differ slightly, since your request continues earning until processing is complete.';

  if ((earnethBalance === 0n && requests.length === 0) || !isEthVaultAvailable)
    return null;
  return (
    <RequestsContainer>
      <VaultPosition
        position={{
          symbol: ETH_VAULT_TOKEN_SYMBOL,
          token: earnethPositionData?.earnethTokenAddress,
          balance: earnethBalance,
          icon: <TokenEarnEthIcon />,
          isLoading: isLoading || isLoadingUsd,
          usdAmount,
        }}
      />
      {claimableRequests.length > 0 && (
        <ActionableTitle>
          Ready to claim{' '}
          <Tooltip placement="bottomLeft" title={TOOLTIP_TEXT}>
            <Question
              style={{
                height: 20,
                width: 20,
                color: 'var(--lido-color-textSecondary)',
              }}
            />
          </Tooltip>
        </ActionableTitle>
      )}
      {claimableRequests?.map((request) => (
        <EthVaultWithdrawRequestClaimable
          key={request.timestamp}
          request={request}
          claim={() =>
            withdrawClaim({
              amount: request.assets,
              timestamp: Number(request.timestamp),
            })
          }
          isClaiming={isClaiming}
        />
      ))}
      {pendingRequests.length > 0 && (
        <ActionableTitle>
          Pending withdrawal request{pendingRequests.length > 1 ? 's' : ''}
          <Tooltip placement="bottomLeft" title={TOOLTIP_TEXT}>
            <Question
              style={{
                height: 20,
                width: 20,
                color: 'var(--lido-color-textSecondary)',
              }}
            />
          </Tooltip>
        </ActionableTitle>
      )}
      {pendingRequests?.map((request) => {
        return (
          <EthVaultWithdrawRequestPending
            key={request.timestamp}
            request={request}
          />
        );
      })}
    </RequestsContainer>
  );
};
