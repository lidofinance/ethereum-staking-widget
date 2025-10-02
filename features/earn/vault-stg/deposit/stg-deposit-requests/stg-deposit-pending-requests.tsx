import { FC } from 'react';
import { ActionableTitle } from '../../withdraw/stg-withdraw-request';
import { STGDepositPendingRequest } from './stg-deposit-pending-request';
import { DepositRequestData } from '../hooks/use-stg-deposit-request-data';
import { useSTGDepositCancel } from '../hooks/use-stg-deposit-cancel';

interface PendingDepositRequestsProps {
  requestDataList: DepositRequestData[];
  cancel: ReturnType<typeof useSTGDepositCancel>['cancel'];
  isLoading: boolean;
}

export const STGDepositPendingRequests: FC<PendingDepositRequestsProps> = ({
  requestDataList,
  cancel,
  isLoading,
}) => {
  // Check if there are any pending requests (but not pushed to vault)
  const hasPendingRequests = requestDataList.some(
    ({ depositRequest, isPushedToVault }) => depositRequest && !isPushedToVault,
  );

  if (!hasPendingRequests) {
    return null;
  }

  return (
    <>
      <ActionableTitle>Pending deposit request</ActionableTitle>
      {requestDataList.map((requestData) => (
        <STGDepositPendingRequest
          key={requestData.token}
          depositRequestData={requestData}
          onCancel={() => cancel(requestData.assets, requestData.token)}
          isLoading={isLoading}
        />
      ))}
    </>
  );
};
