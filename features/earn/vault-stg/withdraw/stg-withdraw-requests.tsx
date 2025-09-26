import { useMemo } from 'react';

import {
  RequestsContainer,
  ActionableTitle,
} from './stg-withdraw-request/stg-withdraw-request';
import { useSTGWithdrawRequests } from './hooks/use-stg-withdraw-requests';
import { STGWithdrawRequestClaimable } from './stg-withdraw-request/stg-withdraw-request-claimable';
import { STGWithdrawRequestPending } from './stg-withdraw-request/stg-withdraw-request-pending';

export const STGWithdrawRequests = () => {
  const { data } = useSTGWithdrawRequests();

  const claimableRequests = useMemo(
    () => data?.filter((item) => item.isClaimable === true) || [],
    [data],
  );
  const pendingRequests = useMemo(
    () => data?.filter((item) => item.isClaimable === false) || [],
    [data],
  );

  if (!data || data.length === 0) return null;
  return (
    <RequestsContainer>
      {claimableRequests.length > 0 && (
        <ActionableTitle>Ready to claim</ActionableTitle>
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
