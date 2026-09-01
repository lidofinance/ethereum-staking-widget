import { Question, Tooltip } from '@lidofinance/lido-ui';
import {
  RequestsContainer,
  ActionableTitle,
} from 'modules/mellow-meta-vaults/components/request';
import { ButtonInline } from 'shared/components/button-inline/button-inline';
import {
  USD_WITHDRAW_TOKEN_TEXT,
  USD_WITHDRAW_REQUESTS_MIXED_TOKEN_TOOLTIP,
} from './consts';
import { useUsdVaultWithdrawRequests } from './hooks/use-withdraw-requests';
import { UsdVaultWithdrawRequestClaimable } from './withdraw-request/withdraw-request-claimable';
import { UsdVaultWithdrawRequestPending } from './withdraw-request/withdraw-request-pending';
import { useUsdVaultAvailable } from '../hooks/use-vault-available';
import { useUsdVaultWithdrawClaim } from './hooks/use-withdraw-claim';
import { useUsdVaultWithdrawClaimAll } from './hooks/use-withdraw-claim-all';
import type { UsdVaultWithdrawRequest } from './types';

// Requests can come from more than one payout queue, so the tooltip cannot
// always name a single token.
const getRequestsTooltip = (requests: UsdVaultWithdrawRequest[]) => {
  const [first, ...rest] = requests;
  if (!first) return USD_WITHDRAW_REQUESTS_MIXED_TOKEN_TOOLTIP;

  return rest.every(({ token }) => token === first.token)
    ? USD_WITHDRAW_TOKEN_TEXT[first.token].willReceiveHelp
    : USD_WITHDRAW_REQUESTS_MIXED_TOKEN_TOOLTIP;
};

const TooltipQuestion = ({ title }: { title: string }) => (
  <Tooltip placement="bottomLeft" title={title}>
    <Question
      style={{
        height: 20,
        width: 20,
        color: 'var(--lido-color-textSecondary)',
      }}
    />
  </Tooltip>
);

export const UsdVaultWithdrawRequests = () => {
  const { isUsdVaultAvailable } = useUsdVaultAvailable();
  const { data } = useUsdVaultWithdrawRequests();
  const { withdrawClaim, isClaiming: isClaimingSingle } =
    useUsdVaultWithdrawClaim();
  const { withdrawClaimAll, isClaiming: isClaimingAll } =
    useUsdVaultWithdrawClaimAll();
  const isClaiming = isClaimingSingle || isClaimingAll;

  const { requests, claimableRequests, pendingRequests } = data;

  if (requests.length === 0 || !isUsdVaultAvailable) return null;

  return (
    <RequestsContainer>
      {claimableRequests.length > 0 && (
        <ActionableTitle>
          Ready to claim{' '}
          <TooltipQuestion title={getRequestsTooltip(claimableRequests)} />
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
      {claimableRequests.map((request) => (
        <UsdVaultWithdrawRequestClaimable
          key={`${request.token}-${request.timestamp}`}
          request={request}
          claim={() =>
            withdrawClaim({
              amount: request.assets,
              timestamp: Number(request.timestamp),
              token: request.token,
            })
          }
          isClaiming={isClaiming}
        />
      ))}
      {pendingRequests.length > 0 && (
        <ActionableTitle>
          Pending withdrawal request{pendingRequests.length > 1 ? 's' : ''}
          <TooltipQuestion title={getRequestsTooltip(pendingRequests)} />
        </ActionableTitle>
      )}
      {pendingRequests.map((request) => (
        <UsdVaultWithdrawRequestPending
          key={`${request.token}-${request.timestamp}`}
          request={request}
        />
      ))}
    </RequestsContainer>
  );
};
