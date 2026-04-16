import { Question, Tooltip } from '@lidofinance/lido-ui';
import {
  RequestsContainer,
  ActionableTitle,
} from 'modules/mellow-meta-vaults/components/request';
import { useUsdVaultWithdrawRequests } from './hooks/use-withdraw-requests';
import { UsdVaultWithdrawRequestClaimable } from './withdraw-request/withdraw-request-claimable';
import { UsdVaultWithdrawRequestPending } from './withdraw-request/withdraw-request-pending';
import { useUsdVaultAvailable } from '../hooks/use-vault-available';
import { useUsdVaultWithdrawClaim } from './hooks/use-withdraw-claim';

export const UsdVaultWithdrawRequests = () => {
  const { isUsdVaultAvailable } = useUsdVaultAvailable();
  const { data } = useUsdVaultWithdrawRequests();
  const { withdrawClaim, isClaiming } = useUsdVaultWithdrawClaim();

  const requests = data?.requests || [];
  const claimableRequests = data?.claimableRequests || [];
  const pendingRequests = data?.pendingRequests || [];

  const TOOLTIP_TEXT =
    'The final claimable USDC may differ slightly, since your request continues earning until processing is complete.';

  if (requests.length === 0 || !isUsdVaultAvailable) return null;

  return (
    <RequestsContainer>
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
        <UsdVaultWithdrawRequestClaimable
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
          <UsdVaultWithdrawRequestPending
            key={request.timestamp}
            request={request}
          />
        );
      })}
    </RequestsContainer>
  );
};
