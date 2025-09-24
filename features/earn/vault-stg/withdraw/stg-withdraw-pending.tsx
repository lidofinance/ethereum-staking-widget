import { useMemo } from 'react';

import { TokenStrethIcon, TokenWstethIcon } from 'assets/earn';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';

import {
  RequestsContainer,
  Request,
  ActionableTitle,
} from '../stg-pending-action/stg-pending-action';
import { useSTGWithdrawRequests } from './hooks/use-stg-withdraw-requests';
import { useSTGWithdrawClaim } from './hooks/use-stg-withdraw-claim';
import { useSTGWithdrawPendingRequestsUsd } from './hooks/use-stg-withdraw-pending-requests-usd';
import { useStgWithdrawClaimableRequestsUsd } from './hooks/use-stg-widthraw-claimable-requests-usd';

export const STGWithdrawPending = () => {
  const { data } = useSTGWithdrawRequests();
  const { withdrawClaim } = useSTGWithdrawClaim();

  const claimableRequests = useMemo(
    () => data?.filter((item) => item.isClaimable === true) || [],
    [data],
  );
  const pendingRequests = useMemo(
    () => data?.filter((item) => item.isClaimable === false) || [],
    [data],
  );

  const { data: pendingRequestsUsdMap } =
    useSTGWithdrawPendingRequestsUsd(pendingRequests);

  const { data: claimableRequestsUsdMap } =
    useStgWithdrawClaimableRequestsUsd(claimableRequests);

  if (!data || data.length === 0) return null;
  return (
    <RequestsContainer>
      {claimableRequests.length > 0 && (
        <ActionableTitle>Ready to claim</ActionableTitle>
      )}
      {claimableRequests?.map((request) => {
        const usd = claimableRequestsUsdMap?.[String(request.timestamp)];
        if (usd === undefined) return null; // wait until loaded
        return (
          <Request
            key={request.timestamp}
            tokenLogo={<TokenWstethIcon />}
            tokenAmount={request.assets}
            tokenName={getTokenDisplayName('wstETH')}
            tokenAmountUSD={usd}
            createdDateTimestamp={request.timestamp}
            actionText="Claim"
            actionCallback={() =>
              withdrawClaim({
                amount: request.assets,
                timestamp: Number(request.timestamp),
              })
            }
          />
        );
      })}
      {pendingRequests.length > 0 && (
        <ActionableTitle>
          Pending withdrawal request{pendingRequests.length > 1 ? 's' : ''}
        </ActionableTitle>
      )}
      {pendingRequests?.map((request) => {
        const usd = pendingRequestsUsdMap?.[String(request.timestamp)];
        if (usd === undefined) return null; // wait until loaded
        return (
          <Request
            key={request.timestamp}
            tokenLogo={<TokenStrethIcon />}
            tokenAmount={request.shares}
            tokenName={getTokenDisplayName('strETH')}
            tokenAmountUSD={usd}
            createdDateTimestamp={request.timestamp}
          />
        );
      })}
    </RequestsContainer>
  );
};
