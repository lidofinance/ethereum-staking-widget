import { FC } from 'react';
import { ActionableTitle } from 'modules/mellow-meta-vaults/components/request';
import { DepositRequests } from 'modules/mellow-meta-vaults/hooks/use-deposit-requests';
import { useEthVaultDepositCancel } from '../hooks';
import { EthVaultDepositPendingRequestETH } from './deposit-pending-request-eth';
import { EthVaultDepositPendingRequestWstETH } from './deposit-pending-request-wsteth';
import { EthVaultDepositPendingRequestGg } from './deposit-pending-request-gg';
import { EthVaultDepositPendingRequestStreth } from './deposit-pending-request-streth';
import { EthVaultDepositPendingRequestDvsteth } from './deposit-pending-request-dvsteth';

type PendingDepositRequestsProps = {
  requests: DepositRequests;
  cancel: ReturnType<typeof useEthVaultDepositCancel>['cancel'];
  isLoading: boolean;
};

const requestComponentMap = {
  wsteth: EthVaultDepositPendingRequestWstETH,
  weth: EthVaultDepositPendingRequestETH,
  eth: EthVaultDepositPendingRequestETH,
  gg: EthVaultDepositPendingRequestGg,
  dvsteth: EthVaultDepositPendingRequestDvsteth,
  streth: EthVaultDepositPendingRequestStreth,
};
type requestComponentMapKey = keyof typeof requestComponentMap;

export const EthVaultDepositPendingRequests: FC<
  PendingDepositRequestsProps
> = ({ requests, cancel, isLoading }) => {
  if (requests.length === 0) {
    return null;
  }

  return (
    <>
      <ActionableTitle>Pending deposit request</ActionableTitle>
      {requests.map((request) => {
        const PendingRequestComponent =
          requestComponentMap[
            request.token.toLowerCase() as requestComponentMapKey
          ];
        return (
          <PendingRequestComponent
            key={request.token}
            request={request}
            onCancel={() => cancel(request.assets, request.token)}
            isLoading={isLoading}
          />
        );
      })}
    </>
  );
};
