import { FC } from 'react';
import { ActionableTitle } from 'modules/mellow-meta-vaults/components/request';
import { DepositRequests } from 'modules/mellow-meta-vaults/hooks/use-deposit-requests';
import { TOKENS } from 'consts/tokens';
import { asToken } from 'utils/as-token';

import { useUsdVaultDepositCancel } from '../hooks';
import { UsdVaultDepositPendingRequestUSDC } from './deposit-pending-request-usdc';
import { UsdVaultDepositPendingRequestUSDT } from './deposit-pending-request-usdt';
import type { UsdDepositToken } from '../../types';

type PendingDepositRequestsProps = {
  requests: DepositRequests;
  cancel: ReturnType<typeof useUsdVaultDepositCancel>['cancel'];
  isLoading: boolean;
};

const requestComponentMap = {
  [TOKENS.usdc]: UsdVaultDepositPendingRequestUSDC,
  [TOKENS.usdt]: UsdVaultDepositPendingRequestUSDT,
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
      {requests.map((request) => {
        const PendingRequestComponent =
          requestComponentMap[asToken<UsdDepositToken>(request.token)];
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
