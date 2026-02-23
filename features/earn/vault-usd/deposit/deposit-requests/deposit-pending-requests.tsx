import { FC } from 'react';
import { ActionableTitle } from 'modules/mellow-meta-vaults/components/request';
import { DepositRequests } from 'modules/mellow-meta-vaults/hooks/use-deposit-requests';
import { useUsdVaultDepositCancel } from '../hooks';
import { UsdVaultDepositPendingRequestUSDC } from './deposit-pending-request-usdc';
import { UsdVaultDepositPendingRequestUSDT } from './deposit-pending-request-usdt';

type PendingDepositRequestsProps = {
  requests: DepositRequests;
  cancel: ReturnType<typeof useUsdVaultDepositCancel>['cancel'];
  isLoading: boolean;
};

export const UsdVaultDepositPendingRequests: FC<
  PendingDepositRequestsProps
> = ({ requests, cancel, isLoading }) => {
  if (requests.length === 0) {
    return null;
  }

  return (
    <>
      <ActionableTitle>Pending deposit request</ActionableTitle>
      {requests.map((request) =>
        request.token === 'USDT' ? (
          <UsdVaultDepositPendingRequestUSDT
            key={request.token}
            request={request}
            onCancel={() => cancel(request.assets, request.token)}
            isLoading={isLoading}
          />
        ) : (
          <UsdVaultDepositPendingRequestUSDC
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
