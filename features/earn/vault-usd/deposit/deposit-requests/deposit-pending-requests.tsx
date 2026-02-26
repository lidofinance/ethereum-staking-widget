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

const requestComponentMap = {
  usdc: UsdVaultDepositPendingRequestUSDC,
  usdt: UsdVaultDepositPendingRequestUSDT,
};
type requestComponentMapKey = keyof typeof requestComponentMap;

type PendingRequestComponentProps = {
  token: requestComponentMapKey;
  request: DepositRequests[number];
  onCancel: () => void;
  isLoading: boolean;
};

const PendingRequestComponent: FC<PendingRequestComponentProps> = ({
  token,
  request,
  onCancel,
  isLoading,
}) => {
  const Component =
    requestComponentMap[token.toLowerCase() as requestComponentMapKey];
  return (
    <Component request={request} onCancel={onCancel} isLoading={isLoading} />
  );
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
      {requests.map((request) => (
        <PendingRequestComponent
          key={request.token}
          token={request.token}
          request={request}
          onCancel={() => cancel(request.assets, request.token)}
          isLoading={isLoading}
        />
      ))}
    </>
  );
};
