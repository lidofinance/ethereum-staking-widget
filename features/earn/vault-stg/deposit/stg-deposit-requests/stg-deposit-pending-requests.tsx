import { FC } from 'react';
import { ActionableTitle } from '../../components/request/stg-request';
import { DepositRequests } from '../hooks/use-stg-deposit-requests';
import { useSTGDepositCancel } from '../hooks/use-stg-deposit-cancel';
import { STGDepositPendingRequestETH } from './stg-deposit-pending-request-eth';
import { STGDepositPendingRequestWstETH } from './stg-deposit-pending-request-wsteth';

interface PendingDepositRequestsProps {
  depositRequests: DepositRequests;
  cancel: ReturnType<typeof useSTGDepositCancel>['cancel'];
  isLoading: boolean;
}

export const STGDepositPendingRequests: FC<PendingDepositRequestsProps> = ({
  depositRequests,
  cancel,
  isLoading,
}) => {
  // Check if there are any pending requests (not claimable)
  const pendingRequests = depositRequests.filter(
    (request) => !request.isClaimable,
  );

  if (pendingRequests.length === 0) {
    return null;
  }

  return (
    <>
      <ActionableTitle>Pending deposit request</ActionableTitle>
      {pendingRequests.map((request) =>
        request.token === 'wstETH' ? (
          <STGDepositPendingRequestWstETH
            key={request.token}
            request={request}
            onCancel={() => cancel(request.assets, request.token)}
            isLoading={isLoading}
          />
        ) : (
          <STGDepositPendingRequestETH
            key={request.token}
            request={request}
            onCancel={() => cancel(request.assets, request.token)}
            isLoading={isLoading}
          />
        ),
      )}
    </>
  );
};
