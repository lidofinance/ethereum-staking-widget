import { FC } from 'react';
import { ActionableTitle } from '../../components/stg-request/stg-request';
import { DepositRequests } from '../hooks/use-stg-deposit-requests';
import { useSTGDepositCancel } from '../hooks/use-stg-deposit-cancel';
import { STGDepositPendingRequestETH } from './stg-deposit-pending-request-eth';
import { STGDepositPendingRequestWstETH } from './stg-deposit-pending-request-wsteth';

interface PendingDepositRequestsProps {
  requests: DepositRequests;
  cancel: ReturnType<typeof useSTGDepositCancel>['cancel'];
  isLoading: boolean;
}

export const STGDepositPendingRequests: FC<PendingDepositRequestsProps> = ({
  requests,
  cancel,
  isLoading,
}) => {
  if (requests.length === 0) {
    return null;
  }

  return (
    <>
      <ActionableTitle>Pending deposit request</ActionableTitle>
      {requests.map((request) =>
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
