import { Question, Tooltip } from '@lidofinance/lido-ui';
import { ButtonInline } from 'shared/components/button-inline/button-inline';
import {
  RequestsContainer,
  ActionableTitle,
} from './stg-withdraw-request/stg-withdraw-request';
import { useSTGWithdrawRequests } from './hooks/use-stg-withdraw-requests';
import { STGWithdrawRequestClaimable } from './stg-withdraw-request/stg-withdraw-request-claimable';
import { STGWithdrawRequestPending } from './stg-withdraw-request/stg-withdraw-request-pending';
import { useSTGWithdrawClaimAll } from './hooks/use-stg-withdraw-claim-all';
import { useSTGAvailable } from '../hooks/use-stg-available';
import { useSTGWithdrawClaim } from './hooks/use-stg-withdraw-claim';

export const STGWithdrawRequests = () => {
  const { isSTGAvailable } = useSTGAvailable();
  const { data } = useSTGWithdrawRequests();
  const { withdrawClaimAll } = useSTGWithdrawClaimAll();
  const { withdrawClaim, isClaiming } = useSTGWithdrawClaim();

  const requests = data?.requests || [];
  const claimableRequests = data?.claimableRequests || [];
  const pendingRequests = data?.pendingRequests || [];

  const TOOLTIP_TEXT =
    'The final claimable wstETH may differ slightly, since your request continues earning until processing is complete.';

  if (!data || requests.length === 0 || !isSTGAvailable) return null;
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
            <ButtonInline disabled={isClaiming} onClick={withdrawClaimAll}>
              Claim all
            </ButtonInline>
          )}
        </ActionableTitle>
      )}
      {claimableRequests?.map((request) => (
        <STGWithdrawRequestClaimable
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
          <STGWithdrawRequestPending
            key={request.timestamp}
            request={request}
          />
        );
      })}
    </RequestsContainer>
  );
};
