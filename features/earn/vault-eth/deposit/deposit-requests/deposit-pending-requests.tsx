import { FC } from 'react';
import { ActionableTitle } from '../../components/request/request';
import { DepositRequests } from 'modules/mellow-meta-vaults/hooks/use-deposit-requests';
import { useEthVaultDepositCancel } from '../hooks';
import { EthVaultDepositPendingRequestETH } from './deposit-pending-request-eth';
import { EthVaultDepositPendingRequestWstETH } from './deposit-pending-request-wsteth';

type PendingDepositRequestsProps = {
  requests: DepositRequests;
  cancel: ReturnType<typeof useEthVaultDepositCancel>['cancel'];
  isLoading: boolean;
};

export const EthVaultDepositPendingRequests: FC<
  PendingDepositRequestsProps
> = ({ requests, cancel, isLoading }) => {
  if (requests.length === 0) {
    return null;
  }

  return (
    <>
      <ActionableTitle>Pending deposit request</ActionableTitle>
      {requests.map((request) =>
        request.token === 'wstETH' ? (
          <EthVaultDepositPendingRequestWstETH
            key={request.token}
            request={request}
            onCancel={() => cancel(request.assets, request.token)}
            isLoading={isLoading}
          />
        ) : (
          <EthVaultDepositPendingRequestETH
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
