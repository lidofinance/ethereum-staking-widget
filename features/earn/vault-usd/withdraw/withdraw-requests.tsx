import { Question, Tooltip } from '@lidofinance/lido-ui';
import {
  RequestsContainer,
  ActionableTitle,
} from 'modules/mellow-meta-vaults/components/request';
import { ButtonInline } from 'shared/components/button-inline/button-inline';
import { useUsdVaultWithdrawRequests } from './hooks/use-withdraw-requests';
import { UsdVaultWithdrawRequestClaimable } from './withdraw-request/withdraw-request-claimable';
import { UsdVaultWithdrawRequestPending } from './withdraw-request/withdraw-request-pending';
import { useUsdVaultAvailable } from '../hooks/use-vault-available';
import { useUsdVaultWithdrawClaim } from './hooks/use-withdraw-claim';
import { useUsdVaultWithdrawClaimAll } from './hooks/use-withdraw-claim-all';

export const UsdVaultWithdrawRequests = () => {
  const { isUsdVaultAvailable } = useUsdVaultAvailable();
  const { data } = useUsdVaultWithdrawRequests();
  const { withdrawClaim, isClaiming: isClaimingSingle } =
    useUsdVaultWithdrawClaim();
  const { withdrawClaimAll, isClaiming: isClaimingAll } =
    useUsdVaultWithdrawClaimAll();
  const isClaiming = isClaimingSingle || isClaimingAll;

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
          {claimableRequests.length > 1 && (
            <ButtonInline
              $variant="small"
              disabled={isClaiming}
              onClick={withdrawClaimAll}
            >
              Claim all
            </ButtonInline>
          )}
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
