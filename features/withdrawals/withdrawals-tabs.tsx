import { Switch } from 'shared/components';

import { WITHDRAWALS_CLAIM_PATH, WITHDRAWALS_REQUEST_PATH } from 'config/urls';

import { ClaimDataProvider } from './contexts/claim-data-context';
import { useWithdrawals } from './contexts/withdrawals-context';
import { Claim } from './claim';
import { Request } from './request';

const withdrawalRoutes = [
  {
    path: WITHDRAWALS_REQUEST_PATH,
    name: 'Request',
  },
  {
    path: WITHDRAWALS_CLAIM_PATH,
    name: 'Claim',
  },
];

export const WithdrawalsTabs = () => {
  const { isClaimTab } = useWithdrawals();
  return (
    <ClaimDataProvider>
      <Switch checked={isClaimTab} routes={withdrawalRoutes} />
      {isClaimTab ? <Claim /> : <Request />}
    </ClaimDataProvider>
  );
};
