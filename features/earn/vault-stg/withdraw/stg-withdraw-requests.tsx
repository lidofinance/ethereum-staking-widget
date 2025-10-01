import {
  RequestsContainer,
  ActionableTitle,
} from './stg-withdraw-request/stg-withdraw-request';
import { useSTGWithdrawRequests } from './hooks/use-stg-withdraw-requests';
import { STGWithdrawRequestClaimable } from './stg-withdraw-request/stg-withdraw-request-claimable';
import { STGWithdrawRequestPending } from './stg-withdraw-request/stg-withdraw-request-pending';
import { ButtonInline } from 'shared/components/button-inline/button-inline';
import { useSTGWithdrawClaimAll } from './hooks/use-stg-withdraw-claim-all';
import { useSTGAvailable } from '../hooks/use-stg-available';
import { Question, Tooltip } from '@lidofinance/lido-ui';

export const STGWithdrawRequests = () => {
  const { isSTGAvailable } = useSTGAvailable();
  const { data } = useSTGWithdrawRequests();
  const { withdrawClaimAll } = useSTGWithdrawClaimAll();

  const requests = data?.requests || [];
  const claimableRequests = data?.claimableRequests || [];
  const pendingRequests = data?.pendingRequests || [];

  if (!data || requests.length === 0 || !isSTGAvailable) return null;
  return (
    <RequestsContainer>
      {claimableRequests.length > 0 && (
        <ActionableTitle>
          Ready to claim{' '}
          <Tooltip
            placement="bottomLeft"
            title="The final claimable wstETH may differ slightly, since your request continues earning until processing is complete."
          >
            <Question
              style={{
                height: 20,
                width: 20,
                color: 'var(--lido-color-textSecondary)',
              }}
            />
          </Tooltip>
          {claimableRequests.length > 1 && (
            <ButtonInline onClick={withdrawClaimAll}>Claim all</ButtonInline>
          )}
        </ActionableTitle>
      )}
      {claimableRequests?.map((request) => (
        <STGWithdrawRequestClaimable
          key={request.timestamp}
          request={request}
        />
      ))}
      {pendingRequests.length > 0 && (
        <ActionableTitle>
          Pending withdrawal request{pendingRequests.length > 1 ? 's' : ''}
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
